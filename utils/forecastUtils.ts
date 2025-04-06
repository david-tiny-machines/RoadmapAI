import { HistoricalMetric } from '../types/metrics';
import { DbMetricType, DbValueLever } from '../types/database';
import { ScheduledInitiative } from './schedulingUtils';
import { addMonths, startOfMonth, differenceInMonths as dateFnsDifferenceInMonths, parseISO } from 'date-fns';

export interface ForecastResult {
  projectedValues: Array<{ month: Date; value: number }>;
  confidenceInterval?: Array<{ month: Date; upper: number; lower: number }>;
  adjustedForecastValues?: Array<{ month: Date; value: number }>;
}

interface TrendResult {
  slope: number;
  intercept: number;
  r2: number;
}

/**
 * Calculate linear regression for time series data
 * Uses least squares method
 */
export function calculateTrend(metrics: HistoricalMetric[]): TrendResult {
  if (metrics.length < 2) {
    throw new Error('Need at least 2 data points for trend calculation');
  }

  // Sort metrics by date
  const sortedMetrics = [...metrics].sort((a, b) => a.month.getTime() - b.month.getTime());
  
  // Convert dates to numeric values (months since start)
  const startDate = sortedMetrics[0].month;
  const xValues = sortedMetrics.map(m => dateFnsDifferenceInMonths(m.month, startDate));
  
  // Use the raw yValues (do not divide by 100 here)
  const yValues = sortedMetrics.map(m => m.value); // Use raw value

  // Calculate means
  const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length;
  const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;

  // Calculate slope and intercept
  let xxSum = 0;
  let xySum = 0;
  let yySum = 0;
  let yPredSum = 0;

  for (let i = 0; i < xValues.length; i++) {
    const xDiff = xValues[i] - xMean;
    const yDiff = yValues[i] - yMean;
    xxSum += xDiff * xDiff;
    xySum += xDiff * yDiff;
    yySum += yDiff * yDiff;
  }

  const slope = xySum / xxSum;
  const intercept = yMean - (slope * xMean);

  // Calculate R-squared
  for (let i = 0; i < xValues.length; i++) {
    const yPred = slope * xValues[i] + intercept;
    yPredSum += Math.pow(yPred - yMean, 2);
  }
  const r2 = yPredSum / yySum;

  return { slope, intercept, r2 };
}

/**
 * Calculate forecast values and confidence intervals
 * Optionally includes adjusted forecast based on initiative impact.
 */
export function calculateForecast(
  metrics: HistoricalMetric[], 
  months: number,
  artificialConfidenceDecimal?: number,
  scheduledInitiatives?: ScheduledInitiative[],
  metricType?: DbMetricType
): ForecastResult {
  if (!metrics.length) {
    return { projectedValues: [], confidenceInterval: [], adjustedForecastValues: [] };
  }

  // Sort metrics by date
  const sortedMetrics = [...metrics].sort((a, b) => a.month.getTime() - b.month.getTime());
  
  // Convert dates to numeric values (months since start)
  const startDate = sortedMetrics[0].month;
  const xValues = sortedMetrics.map(m => dateFnsDifferenceInMonths(m.month, startDate));
  const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length;
  
  // Calculate xxSum for confidence intervals
  const xxSum = xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);
  
  const { slope, intercept, r2 } = calculateTrend(sortedMetrics);
  const lastDate = sortedMetrics[sortedMetrics.length - 1].month;
  const baseMonths = dateFnsDifferenceInMonths(lastDate, sortedMetrics[0].month);

  // Calculate projected values (using raw trend)
  const projectedValues = Array.from({ length: months }, (_, i) => {
    const month = addMonths(lastDate, i + 1);
    const monthsFromStart = baseMonths + i + 1;
    const value = Math.max(0, (slope * monthsFromStart + intercept)); // Raw projected value
    return { month: startOfMonth(month), value };
  });

  // Calculate *ARTIFICIAL* confidence intervals based on passed percentage or default
  const confidencePercentageToUse = artificialConfidenceDecimal ?? 0.05; // Revert to using percentage

  const confidenceInterval = projectedValues.map(({ month, value }) => {
    // Use percentage for margin calculation
    const margin = value * confidencePercentageToUse; 
    return {
      month,
      upper: value + margin,
      lower: Math.max(0, value - margin) // Ensure lower bound doesn't go below 0
    };
  });

  // --- START: Adjusted Forecast Calculation ---
  let adjustedForecastValues: Array<{ month: Date; value: number }> | undefined = undefined;

  if (scheduledInitiatives && scheduledInitiatives.length > 0 && metricType) {
    adjustedForecastValues = [];
    let cumulativeImpact = 0; // Track cumulative impact across months

    // Sort initiatives by delivery month to process in order (important for accumulation)
    // Handle null delivery months (unscheduled) - filter them out or place them last? Filter out for now.
    const completedInitiatives = scheduledInitiatives
      .filter(init => init.roadmap_delivery_month !== null)
      .sort((a, b) => parseISO(a.roadmap_delivery_month!).getTime() - parseISO(b.roadmap_delivery_month!).getTime());

    let lastProcessedInitiativeIndex = -1;

    for (const baselinePoint of projectedValues) {
      const forecastMonthStart = startOfMonth(baselinePoint.month);

      // Accumulate impact from initiatives completed *before* this forecast month starts
      for (let i = lastProcessedInitiativeIndex + 1; i < completedInitiatives.length; i++) {
          const initiative = completedInitiatives[i];
          const deliveryMonthStart = startOfMonth(parseISO(initiative.roadmap_delivery_month!));

          // Check if delivery month is strictly before the current forecast month
          if (deliveryMonthStart.getTime() < forecastMonthStart.getTime()) {
              // Check if the initiative's value lever maps to the current metric type
              if (mapsToMetric(initiative.value_lever, metricType)) {
                  const confidenceDecimal = initiative.confidence / 100;
                  let singleImpact = 0;

                  if (metricType === 'conversion' || metricType === 'interest_rate') {
                      // Uplift is percentage points, add directly (scaled by confidence)
                      singleImpact = initiative.uplift * confidenceDecimal;
                  } else if (metricType === 'average_loan_size') {
                      // Uplift is relative percentage (scaled by confidence)
                      // IMPORTANT: Impact is relative to the *baseline* for that month
                      singleImpact = baselinePoint.value * (initiative.uplift / 100) * confidenceDecimal;
                  }
                  // Add other metric types here if needed in the future

                  cumulativeImpact += singleImpact;
              }
              lastProcessedInitiativeIndex = i; // Update index to avoid reprocessing
          } else {
              // Initiatives are sorted, so no need to check further for this forecast month
              break;
          }
      }

      const adjustedValue = Math.max(0, baselinePoint.value + cumulativeImpact);
      adjustedForecastValues.push({ month: baselinePoint.month, value: adjustedValue });
    }
  }
  // --- END: Adjusted Forecast Calculation ---

  return { projectedValues, confidenceInterval, adjustedForecastValues }; // Return raw values
}

/**
 * Helper function to get number of months between two dates
 */
function differenceInMonths(laterDate: Date, earlierDate: Date): number {
  return (
    (laterDate.getFullYear() - earlierDate.getFullYear()) * 12 +
    (laterDate.getMonth() - earlierDate.getMonth())
  );
}

// --- START: Helper function to map ValueLever to MetricType ---
const mapsToMetric = (lever: DbValueLever, metricType: DbMetricType): boolean => {
  switch (metricType) {
    case 'conversion':
      return lever === 'conversion';
    case 'average_loan_size':
      // Note: DbMetricType uses 'average_loan_size', ValueLever uses 'average_loan_size'
      // Ensure consistency or handle mapping if they diverge. Assuming they match now.
      return lever === 'average_loan_size';
    case 'interest_rate':
      return lever === 'interest_rate';
    default:
      return false; // Ignore other levers for now
  }
};
// --- END: Helper function --- 