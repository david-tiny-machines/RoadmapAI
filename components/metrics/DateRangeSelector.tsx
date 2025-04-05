import { useState } from 'react';
import { getPreviousNMonths, formatMonthYear, fromMonthString } from '../../utils/dateUtils';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onChange: (range: { start: Date; end: Date }) => void;
  minDate?: Date;
  maxDate?: Date;
}

type PresetRange = '3M' | '6M' | '1Y' | 'ALL';

const getButtonClass = (preset: PresetRange, activePreset: PresetRange | null) => {
  return `px-3 py-1 text-sm rounded-md ${
    activePreset === preset
      ? 'bg-blue-600 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`;
};

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate
}) => {
  const [activePreset, setActivePreset] = useState<PresetRange | null>(null);

  const handlePresetClick = (preset: PresetRange) => {
    setActivePreset(preset);
    const end = maxDate || new Date();
    let start: Date;

    switch (preset) {
      case '3M':
        start = new Date(end);
        start.setMonth(end.getMonth() - 3);
        break;
      case '6M':
        start = new Date(end);
        start.setMonth(end.getMonth() - 6);
        break;
      case '1Y':
        start = new Date(end);
        start.setMonth(end.getMonth() - 12);
        break;
      case 'ALL':
        start = minDate || fromMonthString(getPreviousNMonths(24)[23]); // Default to 24 months if no minDate
        break;
      default:
        return;
    }

    onChange({ start, end });
  };

  // Get available months for dropdowns
  const availableMonths = getPreviousNMonths(24); // Returns YYYY-MM strings

  // Convert current dates to YYYY-MM format for select values
  const startMonth = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;
  const endMonth = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-center">
      <div className="flex space-x-2">
        <button
          onClick={() => handlePresetClick('3M')}
          className={getButtonClass('3M', activePreset)}
        >
          3M
        </button>
        <button
          onClick={() => handlePresetClick('6M')}
          className={getButtonClass('6M', activePreset)}
        >
          6M
        </button>
        <button
          onClick={() => handlePresetClick('1Y')}
          className={getButtonClass('1Y', activePreset)}
        >
          1Y
        </button>
        <button
          onClick={() => handlePresetClick('ALL')}
          className={getButtonClass('ALL', activePreset)}
        >
          All
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <select
          value={startMonth}
          onChange={(e) => {
            setActivePreset(null);
            onChange({
              start: fromMonthString(e.target.value),
              end: endDate
            });
          }}
          className="rounded-md border-gray-300 text-sm"
        >
          {availableMonths.map((monthStr) => (
            <option
              key={monthStr}
              value={monthStr}
              disabled={fromMonthString(monthStr) > endDate}
            >
              {formatMonthYear(monthStr)}
            </option>
          ))}
        </select>

        <span className="text-gray-500">to</span>

        <select
          value={endMonth}
          onChange={(e) => {
            setActivePreset(null);
            onChange({
              start: startDate,
              end: fromMonthString(e.target.value)
            });
          }}
          className="rounded-md border-gray-300 text-sm"
        >
          {availableMonths.map((monthStr) => (
            <option
              key={monthStr}
              value={monthStr}
              disabled={fromMonthString(monthStr) < startDate}
            >
              {formatMonthYear(monthStr)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DateRangeSelector; 