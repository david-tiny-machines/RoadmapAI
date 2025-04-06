import React, { useMemo, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { DbMetricType } from '../../types/database';
import { HistoricalMetric } from '../../types/metrics';
import { calculateForecast } from '../../utils/forecastUtils';
import { formatMetricValue } from '../../utils/formatters';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
  ChartOptions,
  ScaleType,
  TooltipItem,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface ForecastDisplayProps {
  metrics: HistoricalMetric[];
  metricType: DbMetricType;
  forecastMonths?: number;
  showConfidenceBands?: boolean;
  artificialConfidenceDecimal?: number;
  adjustedForecastValues?: Array<{ month: Date; value: number }>;
}

// NEW: Local formatter specifically for this component's display
const formatForecastDisplayValue = (value: number, type: DbMetricType): string => {
  switch (type) {
    case 'conversion':
    case 'interest_rate':
      // Format as percentage, assuming input is already percentage points
      return `${value.toFixed(1)}%`; // Reduced precision slightly for forecast
    case 'average_loan_size':
      // Use a simplified currency format or reuse global if needed
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    default:
      return value.toString();
  }
};

export const ForecastDisplay: React.FC<ForecastDisplayProps> = ({
  metrics,
  metricType,
  forecastMonths = 6,
  showConfidenceBands = true,
  artificialConfidenceDecimal,
  adjustedForecastValues
}) => {
  // Calculate date range based on current date and forecast period
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    start.setMonth(end.getMonth() - 3); // Show last 3 months
    end.setMonth(end.getMonth() + forecastMonths);
    return { start, end };
  }, [forecastMonths]);

  // Step 1: Calculate projected values (depends on metrics, forecastMonths)
  const forecastResult = useMemo(() => {
    console.log("ForecastDisplay: Recalculating Forecast...") // Debug log
    try {
        if (!metrics || metrics.length < 2) {
            console.warn('ForecastDisplay: Not enough metrics for forecast calculation.');
            return { projectedValues: [], confidenceInterval: undefined };
        }
        // Call calculateForecast using only the props available to this component
        return calculateForecast(metrics, forecastMonths, artificialConfidenceDecimal);
    } catch (error) {
        console.error("Error calculating forecast within ForecastDisplay:", error);
        return { projectedValues: [], confidenceInterval: undefined };
    }
  }, [metrics, forecastMonths, artificialConfidenceDecimal]);

  const projectedValues = forecastResult.projectedValues;
  const confidenceInterval = forecastResult.confidenceInterval;

  useEffect(() => {
    if (metricType === 'conversion') {
        console.log("ForecastDisplay Debug - metricType:", metricType);
        console.log("ForecastDisplay Debug - Metrics Input:", metrics);
        console.log("ForecastDisplay Debug - Projected Values:", projectedValues);
        console.log("ForecastDisplay Debug - Confidence Interval:", confidenceInterval);
    }
  }, [metricType, metrics, projectedValues, confidenceInterval, adjustedForecastValues]);

  // Filter historical data to show only last 3 months
  const visibleMetrics = useMemo(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return metrics
      .filter(m => m.month >= threeMonthsAgo)
      .sort((a, b) => a.month.getTime() - b.month.getTime());
  }, [metrics]);

  // Step 3: Calculate Y-axis Min/Max based on WIDEST possible band (50%)
  const allYValuesFixedRange = useMemo(() => {
    const historicalYs = visibleMetrics.map(m => m.value);
    const forecastYs = projectedValues.map(p => p.value);
    const adjustedYs = adjustedForecastValues ? adjustedForecastValues.map(a => a.value) : []; // Add adjusted values

    // Simulate bounds at max percentage (0.5 for 50%)
    const MAX_CONFIDENCE_DECIMAL = 0.50;
    // Use projected values for confidence band calculation base
    const lowerBoundMaxYs = projectedValues.map(p => Math.max(0, p.value - (p.value * MAX_CONFIDENCE_DECIMAL)));
    const upperBoundMaxYs = projectedValues.map(p => p.value + (p.value * MAX_CONFIDENCE_DECIMAL));

    return [...historicalYs, ...forecastYs, ...lowerBoundMaxYs, ...upperBoundMaxYs, ...adjustedYs]; // Include adjustedYs
  }, [visibleMetrics, projectedValues, adjustedForecastValues]); // Add adjustedForecastValues dependency

  const yMinFixed = useMemo(() => allYValuesFixedRange.length > 0 ? Math.min(...allYValuesFixedRange) : 0, [allYValuesFixedRange]);
  const yMaxFixed = useMemo(() => allYValuesFixedRange.length > 0 ? Math.max(...allYValuesFixedRange) : 100, [allYValuesFixedRange]);

  const yPaddingFixed = useMemo(() => (yMaxFixed - yMinFixed) * 0.1, [yMinFixed, yMaxFixed]); // 10% padding

  const chartData = {
    datasets: [
      {
        label: 'Historical',
        data: visibleMetrics.map(m => ({
          x: new Date(m.month),
          y: m.value
        })),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Forecast', // This is the BASELINE forecast
        data: projectedValues.map(p => ({
          x: new Date(p.month),
          y: p.value
        })),
        borderColor: 'rgb(153, 102, 255)',
        borderDash: [5, 5],
        tension: 0.1
      },
      // --- START: Conditionally add Adjusted Forecast dataset ---
      ...(adjustedForecastValues && adjustedForecastValues.length > 0 ? [
          {
              label: 'Adjusted Forecast',
              data: adjustedForecastValues.map(a => ({
                  x: new Date(a.month),
                  y: a.value
              })),
              borderColor: 'rgb(255, 99, 132)', // Use a distinct color (e.g., red)
              tension: 0.1,
              borderWidth: 2 // Slightly thicker line?
          }
      ] : []),
      // --- END: Conditionally add Adjusted Forecast dataset ---
      ...(showConfidenceBands && confidenceInterval ? [
        {
          label: 'Upper Bound',
          data: confidenceInterval.map(ci => ({
            x: new Date(ci.month),
            y: ci.upper
          })),
          borderColor: 'rgba(153, 102, 255, 0.2)',
          backgroundColor: 'rgba(153, 102, 255, 0.1)',
          fill: '1', // Fill to dataset index 1 (Forecast baseline)
          pointRadius: 0,
          tension: 0.1
        },
        {
          label: 'Lower Bound',
          data: confidenceInterval.map(ci => ({
            x: new Date(ci.month),
            y: ci.lower
          })),
          borderColor: 'rgba(153, 102, 255, 0.2)',
          backgroundColor: 'rgba(153, 102, 255, 0.1)',
          fill: '1', // Fill to dataset index 1 (Forecast baseline)
          pointRadius: 0,
          tension: 0.1
        }
      ] : [])
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month'
        },
        min: dateRange.start.toISOString(),
        max: dateRange.end.toISOString()
      },
      y: {
        type: 'linear',
        // Use FIXED min/max based on widest possible range
        min: Math.max(0, yMinFixed - yPaddingFixed),
        max: yMaxFixed + yPaddingFixed,
        ticks: {
          callback: function(value) {
            return formatForecastDisplayValue(Number(value), metricType);
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: 'line'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            if (context.raw && typeof context.raw === 'object' && 'y' in context.raw) {
              const originalValue = Number(context.raw.y);
              const label = context.dataset.label || '';
              // Tooltip formatting remains the same, uses dataset label
              return `${label}: ${formatForecastDisplayValue(originalValue, metricType)}`;
            }
            return '';
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-[400px]">
      <Line data={chartData} options={options} />
    </div>
  );
}; 