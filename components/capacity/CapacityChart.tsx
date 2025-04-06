import { useEffect, useState, useMemo } from 'react';
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
import { MonthlyAllocationMap } from '../../utils/schedulingUtils';
import { MonthlyCapacity } from '../../types/capacity';
import { formatMonthYear, formatDateToYYYYMMDD, fromMonthString } from '../../utils/dateUtils';

interface ChartDataPoint {
    month: string;
    availableDays: number;
    scheduledLoad: number;
}

interface CapacityChartProps {
  monthlyCapacities: MonthlyCapacity[];
  monthlyAllocation: MonthlyAllocationMap;
}

const CapacityWarning = ({ data }: { data: ChartDataPoint[] }) => {
  const overCapacityMonths = data.filter(month => 
    month.scheduledLoad > month.availableDays
  );

  if (overCapacityMonths.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <h4 className="text-red-800 font-medium mb-2">⚠️ Over-Capacity Alert</h4>
      <p className="text-sm text-red-700">
        The following months have scheduled load exceeding available capacity:
      </p>
      <ul className="mt-2 space-y-1">
        {overCapacityMonths.map(month => (
          <li key={month.month} className="text-sm text-red-800">
            <span className="font-medium">{formatMonthYear(month.month)}</span>: {month.scheduledLoad.toFixed(1)} days scheduled vs {month.availableDays} days available
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function CapacityChart({ monthlyCapacities = [], monthlyAllocation = {} }: CapacityChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!monthlyCapacities || monthlyCapacities.length === 0) {
        return [];
    }

    return monthlyCapacities.map(capacityMonth => {
      const monthKey = capacityMonth.month;
      const monthKeyDbFormat = formatDateToYYYYMMDD(fromMonthString(monthKey));
      let totalLoadThisMonth = 0;

      if (monthKeyDbFormat) {
          Object.values(monthlyAllocation).forEach(initiativeAllocation => {
              totalLoadThisMonth += initiativeAllocation[monthKeyDbFormat] || 0;
          });
      }

      return {
        month: monthKey,
        availableDays: capacityMonth.availableDays,
        scheduledLoad: parseFloat(totalLoadThisMonth.toFixed(2)),
      };
    });
  }, [monthlyCapacities, monthlyAllocation]);

  if (!isClient || !chartData.length) {
    return (
      <div className="mt-6">
        <div className="bg-white p-6 rounded-xl shadow-soft">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Scheduled Load vs. Capacity</h3>
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            {!isClient ? 'Loading chart...' : 'No capacity data available to display chart'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="bg-white p-6 rounded-xl shadow-soft">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Scheduled Load vs. Capacity</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={chartData}
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
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)} days`,
                  name === 'availableDays' ? 'Available Capacity' : 'Scheduled Load'
                ]}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar
                dataKey="scheduledLoad"
                fill="#3b82f6"
                name="Scheduled Load"
                shape={(props: any) => {
                    const { x, y, width, height, fill, payload } = props;
                    if (!payload || typeof payload.scheduledLoad === 'undefined' || typeof payload.availableDays === 'undefined') {
                        return <g />;
                    }
                    const isOverCapacity = payload.scheduledLoad > payload.availableDays;
                    const barFill = isOverCapacity ? '#ef4444' : fill;
                    return <rect x={x} y={y} width={width} height={height} fill={barFill} />;
                }}
              />
              <Line
                type="monotone"
                dataKey="availableDays"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Available Capacity"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <CapacityWarning data={chartData} />
      </div>
    </div>
  );
} 