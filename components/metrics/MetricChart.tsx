import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoricalMetric } from '../../types/metrics';
import { DbMetricType, METRIC_TYPE_DISPLAY } from '../../types/database';
import { formatMonthYearFromDate } from '../../utils/dateUtils';

interface MetricChartProps {
  metrics: HistoricalMetric[];
  metricType: DbMetricType;
  dateRange?: { start: Date; end: Date };
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  showDataPoints?: boolean;
  showGrid?: boolean;
}

const formatValue = (value: number, type: DbMetricType) => {
  switch (type) {
    case 'conversion':
    case 'interest_rate':
      return `${value.toFixed(2)}%`;
    case 'loan_size':
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    default:
      return value.toFixed(2);
  }
};

const MetricChart: React.FC<MetricChartProps> = ({
  metrics,
  metricType,
  dateRange,
  showDataPoints = true,
  showGrid = true
}) => {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No data available for this metric type</p>
      </div>
    );
  }

  // Sort metrics by date
  const sortedData = [...metrics].sort((a, b) => a.month.getTime() - b.month.getTime());

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={sortedData}
          margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey="month"
            tickFormatter={(date: Date) => formatMonthYearFromDate(date)}
            type="category"
          />
          <YAxis
            tickFormatter={(value: number) => formatValue(value, metricType)}
          />
          <Tooltip
            labelFormatter={(date: Date) => formatMonthYearFromDate(date)}
            formatter={(value: number) => [formatValue(value as number, metricType), METRIC_TYPE_DISPLAY[metricType]]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={showDataPoints ? { fill: '#3B82F6', r: 4 } : false}
            activeDot={showDataPoints ? { r: 6 } : false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricChart; 