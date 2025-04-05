import { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from 'recharts';
import { Initiative } from '../../types/initiative';
import { MonthlyCapacity } from '../../types/capacity';
import { calculateMonthlyEffort, MonthlyEffort } from '../../utils/capacityUtils';
import { formatMonthYear } from '../../utils/dateUtils';

interface CapacityChartProps {
  initiatives: Initiative[];
  monthlyCapacities: MonthlyCapacity[];
}

const CapacityWarning = ({ data }: { data: MonthlyEffort[] }) => {
  const overCapacityMonths = data.filter(month => 
    month.totalEffort > month.availableDays
  );

  if (overCapacityMonths.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 className="text-yellow-800 font-medium mb-2">⚠️ Capacity Warning</h4>
      <p className="text-sm text-yellow-700">
        The following months exceed available capacity:
      </p>
      <ul className="mt-2 space-y-1">
        {overCapacityMonths.map(month => (
          <li key={month.month} className="text-sm text-yellow-800">
            <span className="font-medium">{formatMonthYear(month.month)}</span>: {month.totalEffort.toFixed(1)} days planned vs {month.availableDays} days available
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function CapacityChart({ initiatives = [], monthlyCapacities = [] }: CapacityChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !monthlyCapacities.length) {
    return (
      <div className="mt-6">
        <div className="bg-white p-6 rounded-xl shadow-soft">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Capacity vs. Effort</h3>
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            {!isClient ? 'Loading chart...' : 'No capacity data available'}
          </div>
        </div>
      </div>
    );
  }

  const data = calculateMonthlyEffort(initiatives, monthlyCapacities);

  return (
    <div className="mt-6">
      <div className="bg-white p-6 rounded-xl shadow-soft">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Capacity vs. Effort</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 80,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonthYear}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="mandatoryEffort"
                stackId="effort"
                fill="#f97316"
                name="Mandatory Effort"
              />
              <Bar
                dataKey="optionalEffort"
                stackId="effort"
                fill="#2563eb"
                name="Optional Effort"
              />
              <Line
                type="monotone"
                dataKey="availableDays"
                stroke="#059669"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={false}
                name="Available Capacity"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <CapacityWarning data={data} />
      </div>
    </div>
  );
} 