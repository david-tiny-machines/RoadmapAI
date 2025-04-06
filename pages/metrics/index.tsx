import { useEffect, useState, useMemo } from 'react';
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
import { DbMetricType, DbInitiativeType, DbCapacityType } from '../../types/database';
import { calculateRoadmapSchedule, ScheduledInitiative } from '../../utils/schedulingUtils';
import { calculateForecast, ForecastResult } from '../../utils/forecastUtils';
import ErrorDisplay from '../../components/shared/ErrorDisplay';

type ViewMode = 'table' | 'chart' | 'forecast';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<HistoricalMetric[]>([]);
  const [activeTab, setActiveTab] = useState<DbMetricType>('conversion');
  const [viewMode, setViewMode] = useState<ViewMode>('forecast');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDataPoints, setShowDataPoints] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [forecastMonths, setForecastMonths] = useState(6);
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);
  const [confidencePercentage, setConfidencePercentage] = useState(5);
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 6); // Default to 6 months
    return { start, end };
  });
  const [rawMetricsData, setRawMetricsData] = useState<HistoricalMetric[]>([]);

  const [initiatives, setInitiatives] = useState<DbInitiativeType[]>([]);
  const [monthlyCapacity, setMonthlyCapacity] = useState<DbCapacityType[]>([]);

  const supabaseClient = useSupabaseClient<Database>();

  const fetchData = async () => {
    if (!supabaseClient) {
      setError("Database connection not available.");
      setIsLoading(false);
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const [metricsResult, initiativesResult, capacityResult] = await Promise.all([
        supabaseClient.from('historical_metrics').select('*').order('month', { ascending: true }),
        supabaseClient.from('initiatives').select('*'),
        supabaseClient.from('monthly_capacity').select('*')
      ]);

      if (metricsResult.error) throw new Error(`Metrics fetch failed: ${metricsResult.error.message}`);
      const formattedMetrics: HistoricalMetric[] = metricsResult.data?.map(metric => {
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
      setMetrics(formattedMetrics);
      setRawMetricsData(formattedMetrics);

      if (initiativesResult.error) throw new Error(`Initiatives fetch failed: ${initiativesResult.error.message}`);
      setInitiatives(initiativesResult.data || []);

      if (capacityResult.error) throw new Error(`Capacity fetch failed: ${capacityResult.error.message}`);
      setMonthlyCapacity(capacityResult.data || []);

    } catch (err) {
      console.error("Error fetching page data:", err);
      const message = err instanceof Error ? err.message : 'Failed to load page data.';
      setError(message);
      setMetrics([]);
      setRawMetricsData([]);
      setInitiatives([]);
      setMonthlyCapacity([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [supabaseClient]);

  // --- START: Calculate Schedule and Forecast ---
  const scheduledInitiativesResult = useMemo(() => {
    if (!initiatives || !monthlyCapacity) {
      return { scheduledInitiatives: [], monthlyAllocation: {} };
    }
    // TODO: Ensure capacity data covers sufficient future range for scheduling?
    // For now, assume fetched capacity is sufficient.
    try {
      return calculateRoadmapSchedule(initiatives, monthlyCapacity);
    } catch (error) {
      console.error("Error calculating roadmap schedule:", error);
      setError(error instanceof Error ? error.message : "Failed to calculate schedule");
      return { scheduledInitiatives: [], monthlyAllocation: {} }; // Return empty on error
    }
  }, [initiatives, monthlyCapacity]);

  const forecastResult = useMemo<ForecastResult>(() => {
    // Ensure we have the necessary data for the active tab
    const metricsForForecast = metrics.filter(m => m.type === activeTab);
    if (metricsForForecast.length < 2) { // Need at least 2 points for trend
        console.warn(`Not enough historical data for ${activeTab} to calculate forecast.`);
        return { projectedValues: [] }; // Return minimal object
    }

    try {
      // Pass the scheduled initiatives and metric type to the forecast function
      return calculateForecast(
        metricsForForecast,
        forecastMonths,
        showConfidenceBands ? confidencePercentage / 100 : undefined,
        scheduledInitiativesResult.scheduledInitiatives, // Pass calculated schedule
        activeTab // Pass current metric type
      );
    } catch (error) {
      console.error("Error calculating forecast:", error);
      setError(error instanceof Error ? error.message : "Failed to calculate forecast");
      return { projectedValues: [] }; // Return minimal object on error
    }
  }, [
    metrics,
    activeTab,
    forecastMonths,
    showConfidenceBands,
    confidencePercentage,
    scheduledInitiativesResult // Depend on the calculated schedule
  ]);
  // --- END: Calculate Schedule and Forecast ---

  const handleSuccess = () => {
    fetchData();
  };

  const handleError = (error: Error) => {
    setError(error.message);
  };

  const filteredMetrics = metrics
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

      <details className="mb-4">
        <summary className="cursor-pointer text-sm text-gray-500">Show Raw Metrics Data (Debug)</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto text-xs">
          {JSON.stringify(rawMetricsData, null, 2)}
        </pre>
      </details>

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
                      confidencePercentage={confidencePercentage}
                      onConfidencePercentageChange={setConfidencePercentage}
                    />
                    <div className="relative h-96"> {/* Ensure container has height */}
                      <ForecastDisplay
                        // Pass historical metrics filtered only by type for context
                        metrics={metrics.filter(m => m.type === activeTab)}
                        metricType={activeTab}
                        forecastMonths={forecastMonths}
                        showConfidenceBands={showConfidenceBands}
                        artificialConfidenceDecimal={confidencePercentage / 100}
                        // Pass ONLY the new adjusted forecast data
                        adjustedForecastValues={forecastResult.adjustedForecastValues}
                      />
                    </div>
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