import { useMemo, useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, addMonths } from 'date-fns';
import { Metric, MetricType } from '../../utils/metrics';

interface MetricChartProps {
  metrics: Metric[];
  metricType: MetricType;
}

interface ForecastData {
  date: string;
  baseline: number;
  forecast: number;
}

interface ChartDataPoint {
  date: string;
  value: number | null;
  baseline: number | null;
  forecast: number | null;
}

const metricLabels: Record<MetricType, string> = {
  conversion: 'Conversion Rate (%)',
  loan_size: 'Average Loan Size ($)',
  interest_rate: 'Interest Rate (%)',
};

const formatValue = (value: number, metricType: MetricType): string => {
  switch (metricType) {
    case 'conversion':
    case 'interest_rate':
      return `${value.toFixed(2)}%`;
    case 'loan_size':
      return `$${value.toLocaleString()}`;
  }
};

export default function MetricChart({ metrics, metricType }: MetricChartProps) {
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      if (metrics.length === 0) return;

      try {
        setLoading(true);
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = addMonths(new Date(), 6).toISOString().split('T')[0];

        const response = await fetch('/api/metrics/forecast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metricType,
            startDate,
            endDate,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch forecast');
        }

        const data = await response.json();
        setForecast(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching forecast:', err);
        setError('Failed to load forecast');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [metrics, metricType]);

  const data = useMemo<ChartDataPoint[]>(() => {
    const historicalData = metrics.map((metric) => ({
      date: metric.date,
      value: metric.value,
      baseline: null,
      forecast: null,
    }));

    if (forecast.length === 0) return historicalData;

    const forecastData = forecast.map((f) => ({
      date: f.date,
      value: null,
      baseline: f.baseline,
      forecast: f.forecast,
    }));

    return [...historicalData, ...forecastData];
  }, [metrics, forecast]);

  return (
    <div className="relative h-[400px] w-full">
      {loading && (
        <div className="absolute top-2 right-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
        </div>
      )}
      {error && (
        <div className="absolute top-2 right-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(parseISO(date), 'MMM yyyy')}
          />
          <YAxis
            tickFormatter={(value) => formatValue(value, metricType)}
            domain={['auto', 'auto']}
          />
          <Tooltip
            formatter={(value: number) => formatValue(value, metricType)}
            labelFormatter={(date) => format(parseISO(date as string), 'MMM d, yyyy')}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name="Historical"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
            connectNulls
          />
          {forecast.length > 0 && (
            <>
              <Line
                type="monotone"
                dataKey="baseline"
                name="Baseline"
                stroke="#9ca3af"
                strokeDasharray="5 5"
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 