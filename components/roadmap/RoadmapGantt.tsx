import React from 'react';
import {
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
  startMonthStr: string | null;
  deliveryMonthStr: string;
  // Represents the data for the bar: [start_tick, end_tick]
  barRange: [number, number];
  fillColor: string;
  isMandatory: boolean;
}

// Helper to assign colors based on deadline status and mandatory flag
const getColor = (initiative: ScheduledInitiative): string => {
  if (initiative.deadline_missed) {
    return '#DC2626'; // Red for missed deadline (priority)
  }
  if (initiative.isMandatory) {
    return '#F59E0B'; // Amber-500 for mandatory (on schedule)
  }
  // Default color for non-mandatory, on-schedule initiatives
  return '#2563EB'; // Blue
};

const RoadmapGantt: React.FC<RoadmapGanttProps> = ({ scheduledInitiatives }) => {

  const filteredInitiatives = scheduledInitiatives.filter(
    (initiative) => initiative.roadmap_delivery_month !== null && initiative.roadmap_start_month !== null
  );

  if (filteredInitiatives.length === 0) {
    return <p>No scheduled initiatives with start and delivery dates to display.</p>;
  }

  // Determine the date range for the X-axis using both start and end months
  const allMonths = filteredInitiatives.flatMap(initiative => [
    parseISO(initiative.roadmap_start_month!),
    parseISO(initiative.roadmap_delivery_month!)
  ]);
  const startDate = startOfMonth(allMonths.reduce((min, date) => (date < min ? date : min), allMonths[0]));
  const endDate = startOfMonth(allMonths.reduce((max, date) => (date > max ? date : max), allMonths[0]));

  // Add padding to the date range (e.g., 1 month before and 1 month after the latest delivery)
  const chartStartDate = addMonths(startDate, -1);
  const chartEndDate = addMonths(endDate, 2);
  const totalMonths = differenceInCalendarMonths(chartEndDate, chartStartDate);

  // --- Width Calculation for Horizontal Scrolling ---
  const MIN_WIDTH_PER_YEAR = 900; // Minimum pixels for 12 months
  const MIN_TOTAL_WIDTH = 700; // Absolute minimum width for the chart regardless of duration
  const pixelsPerMonth = MIN_WIDTH_PER_YEAR / 12;
  const calculatedWidth = pixelsPerMonth * totalMonths;
  // Ensure chart width isn't too small if totalMonths is very low, but allow it to grow
  const chartWidth = Math.max(MIN_TOTAL_WIDTH, calculatedWidth);
  // --- End Width Calculation ---

  // Prepare data for Recharts BarChart (vertical layout)
  const chartData: ChartDataItem[] = filteredInitiatives.map((initiative) => {
    const startDate = parseISO(initiative.roadmap_start_month!);
    const deliveryDate = parseISO(initiative.roadmap_delivery_month!);

    const startMonthIndex = differenceInCalendarMonths(startDate, chartStartDate);
    const endMonthIndex = differenceInCalendarMonths(addMonths(deliveryDate, 1), chartStartDate);

    const barStart = startMonthIndex;
    const barEnd = endMonthIndex;

    // Assign valueLever directly
    const valueLeverTyped: DbValueLever = initiative.valueLever; 

    return {
      name: initiative.name,
      valueLever: valueLeverTyped, 
      effort: initiative.effortEstimate, 
      deadlineMissed: initiative.deadline_missed,
      startMonthStr: format(startDate, 'MMM yyyy'),
      deliveryMonthStr: format(deliveryDate, 'MMM yyyy'),
      barRange: [barStart, barEnd],
      fillColor: getColor(initiative),
      isMandatory: initiative.isMandatory, // Ensure this is the only isMandatory line and uses camelCase
    };
  });

  // Generate ticks for the X-axis (months)
  const monthTicks = Array.from({ length: totalMonths + 1 }, (_, i) => {
      const monthDate = addMonths(chartStartDate, i);
      return { index: i, label: format(monthDate, 'MMM yy') };
  });

  // Custom Tooltip Content
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = chartData.find(item => item.name === label);
        if (!data) return null;

      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-md text-sm text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
          <div className="flex justify-between items-center mb-1">
            <p className="font-semibold">{data.name}</p>
            {/* Conditionally render Mandatory badge */}
            {data.isMandatory && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                Mandatory
              </span>
            )}
          </div>
          <p>Start: {data.startMonthStr ?? 'N/A'}</p>
          <p>Deliver: {data.deliveryMonthStr}</p>
          <p>Effort: {data.effort} days</p>
          <p>Lever: {getValueLeverDisplay(data.valueLever)}</p>
          {data.deadlineMissed && <p className="text-red-600 font-semibold">Deadline Missed</p>}
        </div>
      );
    }
    return null;
  };

  // Custom shape rendering function for the bar (Simplified - Reverting)
  const renderCustomBar = (props: any) => {
    const { x, y, width, height, payload } = props; // Use props directly from Recharts
    const { fillColor } = payload as ChartDataItem;
    const radius = 2;

    // Rely on Recharts calculated x, y, width, height
    return (
      <rect
        x={x}
        y={y}
        width={Math.max(1, width)} // Use provided width, ensure minimum 1px
        height={height}
        fill={fillColor}
        rx={radius}
        ry={radius}
      />
    );
  };

  return (
    // Wrapper div for horizontal scrolling
    <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
      <BarChart
        width={chartWidth} // Set calculated width
        height={Math.max(400, filteredInitiatives.length * 50)}
        layout="vertical"
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 100,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} /> {/* Only vertical grid lines */}
        <XAxis
          type="number"
          domain={[0, totalMonths]} // Domain from 0 to total number of months
          ticks={monthTicks.map(tick => tick.index)} // Ticks at the start of each month index
          tickFormatter={(tickValue) => {
            // Find the corresponding month label based on index
            const monthTick = monthTicks.find(mt => mt.index === tickValue);
            return monthTick ? monthTick.label : '';
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={150}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }} />
        {/* Render ReferenceLines for each month start for better visual separation */}
        {monthTicks.map(tick => (
            <ReferenceLine key={`ref-${tick.index}`} x={tick.index} stroke="#e0e0e0" strokeDasharray="3 3" />
        ))}
        <Bar dataKey="barRange" shape={renderCustomBar} isAnimationActive={false} />

        {/* Optional: Add Legend if colors need explanation - needs custom setup or simplification */}
        {/* <Legend /> */}
      </BarChart>
    </div>
  );
};

export default RoadmapGantt; 