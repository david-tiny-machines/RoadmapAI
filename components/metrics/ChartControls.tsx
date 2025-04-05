interface ChartControlsProps {
  onToggleDataPoints?: () => void;
  onToggleGrid?: () => void;
  showDataPoints: boolean;
  showGrid: boolean;
}

const ChartControls: React.FC<ChartControlsProps> = ({
  onToggleDataPoints,
  onToggleGrid,
  showDataPoints,
  showGrid
}) => {
  return (
    <div className="flex space-x-4 items-center">
      <label className="flex items-center space-x-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={showDataPoints}
          onChange={onToggleDataPoints}
          className="rounded text-blue-600 focus:ring-blue-500"
        />
        <span>Show Data Points</span>
      </label>

      <label className="flex items-center space-x-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={showGrid}
          onChange={onToggleGrid}
          className="rounded text-blue-600 focus:ring-blue-500"
        />
        <span>Show Grid</span>
      </label>
    </div>
  );
};

export default ChartControls; 