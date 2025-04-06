import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ScheduledInitiative } from '@/utils/schedulingUtils';
import { format, parseISO, addMonths, differenceInCalendarMonths, startOfMonth } from 'date-fns';
import { getValueLeverDisplay, DbValueLever } from '@/types/database';

interface RoadmapGanttProps {
  scheduledInitiatives: ScheduledInitiative[];
}

interface ChartDataItem {
  name: string;
  valueLever: DbValueLever;
  effort: number;
  deadlineMissed: boolean | null;
  deliveryMonthStr: string;
  // Represents the data for the bar: [start_tick, end_tick]
  // We use a small range (e.g., 0.8 of a month) centered in the delivery month
  deliveryRange: [number, number];
  fillColor: string;
}

// Helper to assign colors based on value lever or deadline status
const getColor = (initiative: ScheduledInitiative): string => {
  if (initiative.deadline_missed) {
    return '#DC2626'; // Red for missed deadline
  }
  // Simple color scheme based on value lever - can be expanded
  switch (initiative.value_lever) {
    case 'conversion': return '#2563EB'; // Blue
    case 'average_loan_size': return '#16A34A'; // Green
    case 'interest_rate': return '#D97706'; // Amber
    case 'customer_acquisition': return '#9333EA'; // Purple
    case 'customer_retention': return '#DB2777'; // Pink
    case 'bau': return '#4B5563'; // Gray
    default: return '#6B7280'; // Default Gray
  }
};

const RoadmapGantt: React.FC<RoadmapGanttProps> = ({ scheduledInitiatives }) => {

  const filteredInitiatives = scheduledInitiatives.filter(
    (initiative) => initiative.roadmap_delivery_month !== null
  );

  if (filteredInitiatives.length === 0) {
    return <p>No scheduled initiatives with delivery dates to display.</p>;
  }

  // Determine the date range for the X-axis
  const deliveryMonths = filteredInitiatives.map((initiative) =>
    parseISO(initiative.roadmap_delivery_month!)
  );
  const startDate = startOfMonth(deliveryMonths.reduce((min, date) => (date < min ? date : min), deliveryMonths[0]));
  const endDate = startOfMonth(deliveryMonths.reduce((max, date) => (date > max ? date : max), deliveryMonths[0]));

  // Add padding to the date range (e.g., 1 month before and 3 months after)
  const chartStartDate = addMonths(startDate, -1);
  const chartEndDate = addMonths(endDate, 3);
  const totalMonths = differenceInCalendarMonths(chartEndDate, chartStartDate) + 1;

  // Prepare data for Recharts BarChart (vertical layout)
  const chartData: ChartDataItem[] = filteredInitiatives.map((initiative) => {
    const deliveryDate = parseISO(initiative.roadmap_delivery_month!);
    // Calculate the position (index) of the delivery month on the axis
    const deliveryMonthIndex = differenceInCalendarMonths(deliveryDate, chartStartDate);

    // Define the bar range (e.g., width 0.8 centered in the month index)
    const barStart = deliveryMonthIndex + 0.1;
    const barEnd = deliveryMonthIndex + 0.9;

    // Ensure value_lever retains its specific DbValueLever type
    const valueLeverTyped: DbValueLever = initiative.value_lever;

    return {
      name: initiative.name,
      valueLever: valueLeverTyped,
      effort: initiative.effort_estimate,
      deadlineMissed: initiative.deadline_missed,
      deliveryMonthStr: format(deliveryDate, 'MMM yyyy'),
      deliveryRange: [barStart, barEnd],
      fillColor: getColor(initiative),
    };
  });

  // Generate ticks for the X-axis (months)
  const monthTicks = Array.from({ length: totalMonths }, (_, i) => {
      const monthDate = addMonths(chartStartDate, i);
      return { index: i, label: format(monthDate, 'MMM yy') };
  });

  // Custom Tooltip Content
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // Find the original data based on the initiative name (label for vertical layout)
        const data = chartData.find(item => item.name === label);
        if (!data) return null;

      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-md text-sm text-gray-900">
          <p className="font-semibold mb-1">{data.name}</p>
          <p>Deliver: {data.deliveryMonthStr}</p>
          <p>Effort: {data.effort} days</p>
          <p>Lever: {getValueLeverDisplay(data.valueLever)}</p>
          {data.deadlineMissed && <p className="text-red-600 font-semibold">Deadline Missed</p>}
        </div>
      );
    }
    return null;
  };

  // Custom shape rendering function for the bar
  const renderCustomBar = (props: any) => {
    const { background, payload, x, y, width, height, ...rest } = props;
    const { deliveryRange, fillColor } = payload as ChartDataItem;

    // deliveryRange is [start_tick, end_tick] which corresponds to month indices
    // We need to translate these indices to pixel coordinates using the chart's scale.
    // The `props` passed to the shape renderer unfortunately don't directly expose the scale function easily.
    // However, for a linear scale on the XAxis like ours (0 to totalMonths),
    // we can approximate the position.
    // `x` and `width` provided are for the *full* category width in a vertical layout, not the bar itself.
    // We need to calculate the bar's x position and width based on deliveryRange.

    // Assuming props.x represents the start pixel of the X-axis plotting area
    // and props.width represents the total pixel width of the X-axis plotting area.
    const xAxisPixelWidth = width; // In vertical layout, width is the X-axis length
    const monthWidthPixels = xAxisPixelWidth / totalMonths;

    const barStartPixel = x + deliveryRange[0] * monthWidthPixels;
    const barEndPixel = x + deliveryRange[1] * monthWidthPixels;
    const barWidthPixels = barEndPixel - barStartPixel;

    // Add a small radius
    const radius = 2;

    return (
      <rect
        x={barStartPixel}
        y={y} // y and height are correctly provided for vertical layout
        width={barWidthPixels}
        height={height}
        fill={fillColor}
        rx={radius}
        ry={radius}
      />
    );
  };

  return (
    // <ResponsiveContainer width="100%" height={Math.max(400, filteredInitiatives.length * 50)}> {/* Adjust height based on number of initiatives */}
      <BarChart
        width={800} // Example fixed width
        height={Math.max(400, filteredInitiatives.length * 50)} // Keep dynamic height for now
        layout="vertical"
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 100, // Increase left margin for initiative names
          bottom: 5,
        }}
        barCategoryGap="20%" // Adjust gap between bars
      >
        {/* Remove Fragment if ResponsiveContainer is removed */}
        {/* <>
         */}
          <CartesianGrid strokeDasharray="3 3" horizontal={false} /> {/* Only vertical grid lines */}
          <XAxis
            type="number"
            domain={[0, totalMonths]} // Domain from 0 to total number of months
            ticks={monthTicks.map(tick => tick.index + 0.5)} // Position ticks in the middle of the month
            tickFormatter={(tickValue) => {
              // Find the corresponding month label
              const tickIndex = Math.floor(tickValue);
              const monthTick = monthTicks.find(mt => mt.index === tickIndex);
              return monthTick ? monthTick.label : '';
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={150} // Ensure enough space for initiative names
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }} />
          {/* Render ReferenceLines for each month start for better visual separation */}
          {monthTicks.map(tick => (
              <ReferenceLine key={`ref-${tick.index}`} x={tick.index} stroke="#e0e0e0" strokeDasharray="3 3" />
          ))}
          <Bar dataKey="deliveryRange" shape={renderCustomBar} />

          {/* Optional: Add Legend if colors need explanation - needs custom setup or simplification */}
          {/* <Legend /> */}
        {/* </>
         */}
      </BarChart>
    // </ResponsiveContainer>
  );
};

export default RoadmapGantt; 