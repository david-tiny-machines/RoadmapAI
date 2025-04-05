import React, { useMemo } from 'react';
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
  TimeScale
);

interface ForecastDisplayProps {
  metrics: HistoricalMetric[];
  metricType: DbMetricType;
  forecastMonths?: number;
  showConfidenceBands?: boolean;
}

export const ForecastDisplay: React.FC<ForecastDisplayProps> = ({
  metrics,
  metricType,
  forecastMonths = 6,
  showConfidenceBands = true,
}) => {
  // Calculate date range based on current date and forecast period
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    start.setMonth(end.getMonth() - 3); // Show last 3 months
    end.setMonth(end.getMonth() + forecastMonths);
    return { start, end };
  }, [forecastMonths]);

  // Calculate forecast using all historical data
  const { projectedValues, confidenceInterval } = useMemo(() => {
    return calculateForecast(metrics, forecastMonths);
  }, [metrics, forecastMonths]);

  // Filter historical data to show only last 3 months
  const visibleMetrics = useMemo(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return metrics
      .filter(m => m.month >= threeMonthsAgo)
      .sort((a, b) => a.month.getTime() - b.month.getTime());
  }, [metrics]);

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
        label: 'Forecast',
        data: projectedValues.map(p => ({
          x: new Date(p.month),
          y: p.value
        })),
        borderColor: 'rgb(153, 102, 255)',
        borderDash: [5, 5],
        tension: 0.1
      },
      ...(showConfidenceBands && confidenceInterval ? [
        {
          label: 'Upper Bound',
          data: confidenceInterval.map(ci => ({
            x: new Date(ci.month),
            y: ci.upper
          })),
          borderColor: 'rgba(153, 102, 255, 0.2)',
          backgroundColor: 'rgba(153, 102, 255, 0.1)',
          fill: '+1',
          pointRadius: 0
        },
        {
          label: 'Lower Bound',
          data: confidenceInterval.map(ci => ({
            x: new Date(ci.month),
            y: ci.lower
          })),
          borderColor: 'rgba(153, 102, 255, 0.2)',
          backgroundColor: 'rgba(153, 102, 255, 0.1)',
          fill: false,
          pointRadius: 0
        }
      ] : [])
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
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
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatMetricValue(Number(value), metricType);
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
              const value = Number(context.raw.y);
              return `${context.dataset.label}: ${formatMetricValue(value, metricType)}`;
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