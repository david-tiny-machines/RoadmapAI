import { DbMetricType, METRIC_TYPE_DISPLAY } from '../../types/database';

interface MetricTabsProps {
  activeTab: DbMetricType;
  onTabChange: (tab: DbMetricType) => void;
}

export default function MetricTabs({ activeTab, onTabChange }: MetricTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px">
        {Object.entries(METRIC_TYPE_DISPLAY).map(([type, display]) => (
          <button
            key={type}
            onClick={() => onTabChange(type as DbMetricType)}
            className={`
              py-4 px-6 font-medium text-sm border-b-2 
              ${activeTab === type
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            {display}
          </button>
        ))}
      </nav>
    </div>
  );
} 