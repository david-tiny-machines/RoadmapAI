import { HistoricalMetric } from '../types/metrics';
import { addMonths, startOfMonth, differenceInMonths as dateFnsDifferenceInMonths } from 'date-fns';

export interface ForecastResult {
  projectedValues: Array<{ month: Date; value: number }>;
  confidenceInterval?: Array<{ month: Date; upper: number; lower: number }>;
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
  
  // For percentages, convert to decimal form for calculation
  const yValues = sortedMetrics.map(m => m.value / 100);

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
 */
export function calculateForecast(
  metrics: HistoricalMetric[], 
  months: number,
  confidenceLevel: number = 0.95
): ForecastResult {
  if (!metrics.length) {
    throw new Error('No historical data available for forecast');
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

  // Calculate projected values (convert back to percentages)
  const projectedValues = Array.from({ length: months }, (_, i) => {
    const month = addMonths(lastDate, i + 1);
    const monthsFromStart = baseMonths + i + 1;
    const value = Math.max(0, (slope * monthsFromStart + intercept) * 100);
    return { month: startOfMonth(month), value };
  });

  // Calculate confidence intervals
  let confidenceInterval;
  if (metrics.length >= 3) {
    // Use the standard deviation of residuals for confidence interval
    const residuals = sortedMetrics.map((m, i) => {
      const monthsFromStart = dateFnsDifferenceInMonths(m.month, sortedMetrics[0].month);
      const predicted = (slope * monthsFromStart + intercept) * 100;
      return m.value - predicted;
    });
    
    const standardError = Math.sqrt(
      residuals.reduce((sum, res) => sum + res * res, 0) / (residuals.length - 2)
    );
    
    const zScore = confidenceLevel === 0.95 ? 1.96 : 1.645;

    confidenceInterval = projectedValues.map(({ month, value }, i) => {
      const margin = standardError * zScore * Math.sqrt(1 + (1 / metrics.length) + Math.pow(i + 1, 2) / xxSum);
      return {
        month,
        upper: value + margin,
        lower: Math.max(0, value - margin)
      };
    });
  }

  return { projectedValues, confidenceInterval };
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