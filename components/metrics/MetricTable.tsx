import { HistoricalMetric } from '../../types/metrics';
import { DbMetricType } from '../../types/database';
import { formatMonthYearFromDate } from '../../utils/dateUtils';

interface MetricTableProps {
  metrics: HistoricalMetric[];
  metricType: DbMetricType;
}

export default function MetricTable({ metrics, metricType }: MetricTableProps) {
  if (metrics.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">No metrics recorded yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Month
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {metrics.map((metric) => (
            <tr key={metric.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatMonthYearFromDate(metric.month)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {metric.value.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(metric.updated_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 