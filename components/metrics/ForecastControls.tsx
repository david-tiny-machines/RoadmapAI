import React from 'react';

interface ForecastControlsProps {
  forecastMonths: number;
  onForecastMonthsChange: (months: number) => void;
  showConfidenceBands: boolean;
  onToggleConfidenceBands: () => void;
  confidencePercentage: number;
  onConfidencePercentageChange: (percentage: number) => void;
}

export const ForecastControls: React.FC<ForecastControlsProps> = ({
  forecastMonths,
  onForecastMonthsChange,
  showConfidenceBands,
  onToggleConfidenceBands,
  confidencePercentage,
  onConfidencePercentageChange,
}) => {
  const presetPeriods = [
    { label: '3M', months: 3 },
    { label: '6M', months: 6 },
    { label: '1Y', months: 12 },
  ];

  // Helper functions for custom buttons
  const handleDecrement = () => {
    const newValue = Math.max(1, confidencePercentage - 1); // Ensure min is 1
    onConfidencePercentageChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(50, confidencePercentage + 1); // Ensure max is 50
    onConfidencePercentageChange(newValue);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
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

      {showConfidenceBands && (
        <div className="flex items-center gap-2">
          <label htmlFor="confidence-percentage" className="text-sm font-medium text-gray-700">
            Confidence Level:
          </label>
          {/* Container for input and custom buttons */}
          <div className="flex items-center overflow-hidden rounded-md">
            <input
              id="confidence-percentage"
              type="number"
              min="1"
              max="50"
              step="1"
              value={confidencePercentage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= 50) {
                  onConfidencePercentageChange(val);
                } else if (e.target.value === '') {
                   onConfidencePercentageChange(1);
                }
              }}
              className="w-10 px-1 py-1 text-center border border-gray-300 border-r-0 rounded-l-md outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-8"
            />
            {/* Custom Button Container - Add explicit height, remove self-stretch */}
            <div className="flex flex-col border border-gray-300 border-l-0 rounded-r-md h-8">
              {/* Up Button (Increment) */}
              <button 
                onClick={handleIncrement}
                className="flex-1 px-2 text-sm font-bold leading-none border-b border-gray-300 bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center"
                aria-label="Increase confidence level"
              >
                &#x25B4; 
              </button>
              {/* Down Button (Decrement) */}
              <button 
                onClick={handleDecrement}
                className="flex-1 px-2 text-sm font-bold leading-none bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center"
                aria-label="Decrease confidence level"
              >
                &#x25BE; 
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 