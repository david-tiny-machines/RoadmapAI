import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../types/supabase';
import MetricInput from '../../components/metrics/MetricInput';
import MetricTabs from '../../components/metrics/MetricTabs';
import MetricTable from '../../components/metrics/MetricTable';
import MetricChart from '../../components/metrics/MetricChart';
import DateRangeSelector from '../../components/metrics/DateRangeSelector';
import ChartControls from '../../components/metrics/ChartControls';
import { ForecastDisplay } from '../../components/metrics/ForecastDisplay';
import { ForecastControls } from '../../components/metrics/ForecastControls';
import { HistoricalMetric } from '../../types/metrics';
import { DbMetricType } from '../../types/database';
import ErrorDisplay from '../../components/shared/ErrorDisplay';

type ViewMode = 'table' | 'chart' | 'forecast';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<HistoricalMetric[]>([]);
  const [activeTab, setActiveTab] = useState<DbMetricType>('conversion');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDataPoints, setShowDataPoints] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [forecastMonths, setForecastMonths] = useState(6);
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 6); // Default to 6 months
    return { start, end };
  });

  const supabaseClient = useSupabaseClient<Database>();

  const fetchMetrics = async () => {
    if (!supabaseClient) {
      setError("Database connection not available.");
      setIsLoading(false);
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: dbError } = await supabaseClient
        .from('historical_metrics')
        .select('*')
        .order('month', { ascending: true });

      if (dbError) throw dbError;
      
      const formattedData: HistoricalMetric[] = data?.map(metric => {
          let frontendType: DbMetricType;
          switch (metric.type) {
              case 'loan_size':
                  frontendType = 'average_loan_size';
                  break;
              case 'conversion':
                  frontendType = 'conversion';
                  break;
              case 'interest_rate':
                  frontendType = 'interest_rate';
                  break;
              default:
                  console.warn(`Unexpected metric type from DB: ${metric.type}`);
                  frontendType = 'conversion'; 
          }
          
          return {
            id: metric.id,
            month: new Date(metric.month),
            value: metric.value,
            type: frontendType,
            created_at: new Date(metric.created_at),
            updated_at: new Date(metric.updated_at),
          };
      }).filter(Boolean) as HistoricalMetric[] || [];
      
      setMetrics(formattedData);
    } catch (err) {
      console.error("Error fetching metrics:", err);
      const message = err instanceof Error ? err.message : 'Failed to load historical metrics.';
      setError(message);
      setMetrics([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [supabaseClient]);

  const handleSuccess = () => {
    fetchMetrics();
  };

  const handleError = (error: Error) => {
    setError(error.message);
  };

  const filteredMetrics = metrics
    // Filter directly using the activeTab state against the metric.type in state
    .filter(metric => metric.type === activeTab)
    .filter(metric => {
      if (viewMode === 'forecast') {
        return true;
      }
      const date = metric.month instanceof Date ? metric.month : new Date(metric.month);
      if (isNaN(date.getTime())) return false;
      return date >= dateRange.start && date <= dateRange.end;
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Historical Metrics</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Metric</h2>
        <MetricInput onSuccess={handleSuccess} />
      </div>

      {error && <ErrorDisplay message={error} onClose={() => setError(null)} />}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Existing Metrics</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-sm rounded-md ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1 text-sm rounded-md ${
                  viewMode === 'chart'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chart
              </button>
              <button
                onClick={() => setViewMode('forecast')}
                className={`px-3 py-1 text-sm rounded-md ${
                  viewMode === 'forecast'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Forecast
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <MetricTabs activeTab={activeTab} onTabChange={setActiveTab} />
              
              <div className="mt-4 space-y-4">
                {viewMode !== 'forecast' && (
                  <DateRangeSelector
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onChange={setDateRange}
                    minDate={new Date(Math.min(...metrics.map(m => m.month.getTime())))}
                    maxDate={new Date(Math.max(...metrics.map(m => m.month.getTime())))}
                  />
                )}

                {viewMode === 'chart' && (
                  <div className="space-y-4">
                    <ChartControls
                      showDataPoints={showDataPoints}
                      showGrid={showGrid}
                      onToggleDataPoints={() => setShowDataPoints(!showDataPoints)}
                      onToggleGrid={() => setShowGrid(!showGrid)}
                    />
                    <MetricChart
                      metrics={filteredMetrics}
                      metricType={activeTab}
                      dateRange={dateRange}
                      onDateRangeChange={setDateRange}
                      showDataPoints={showDataPoints}
                      showGrid={showGrid}
                    />
                  </div>
                )}

                {viewMode === 'forecast' && (
                  <div className="space-y-4">
                    <ForecastControls
                      forecastMonths={forecastMonths}
                      onForecastMonthsChange={setForecastMonths}
                      showConfidenceBands={showConfidenceBands}
                      onToggleConfidenceBands={() => setShowConfidenceBands(!showConfidenceBands)}
                    />
                    <ForecastDisplay
                      metrics={filteredMetrics}
                      metricType={activeTab}
                      forecastMonths={forecastMonths}
                      showConfidenceBands={showConfidenceBands}
                    />
                  </div>
                )}

                {viewMode === 'table' && (
                  <MetricTable
                    metrics={filteredMetrics}
                    metricType={activeTab}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 