import React from 'react';

interface ForecastControlsProps {
  forecastMonths: number;
  onForecastMonthsChange: (months: number) => void;
  showConfidenceBands: boolean;
  onToggleConfidenceBands: () => void;
}

export const ForecastControls: React.FC<ForecastControlsProps> = ({
  forecastMonths,
  onForecastMonthsChange,
  showConfidenceBands,
  onToggleConfidenceBands,
}) => {
  const presetPeriods = [
    { label: '3M', months: 3 },
    { label: '6M', months: 6 },
    { label: '1Y', months: 12 },
  ];

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Forecast Period:</label>
        <div className="flex gap-1">
          {presetPeriods.map(({ label, months }) => (
            <button
              key={label}
              onClick={() => onForecastMonthsChange(months)}
              className={`px-3 py-1 text-sm rounded-md transition-colors
                ${forecastMonths === months
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">
          Confidence Bands:
        </label>
        <button
          onClick={onToggleConfidenceBands}
          className={`px-3 py-1 text-sm rounded-md transition-colors
            ${showConfidenceBands
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {showConfidenceBands ? 'On' : 'Off'}
        </button>
      </div>
    </div>
  );
}; 