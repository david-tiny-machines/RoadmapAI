import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
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
import { DbMetricType as DbMetricTypeValue, DbInitiativeType, DbCapacityType, Initiative, fromDbInitiative } from '../../types/database';
import { calculateRoadmapSchedule, ScheduleResult } from '../../utils/schedulingUtils';
import { calculateForecast, ForecastResult } from '../../utils/forecastUtils';
import ErrorDisplay from '../../components/shared/ErrorDisplay';

// Define the structure expected from the DB historical_metrics table
interface DbMetric {
  id: string;
  month: string; // Expect string like YYYY-MM-DD
  value: number;
  type: 'conversion' | 'loan_size' | 'interest_rate'; // DB specific type values
  created_at: string;
  updated_at: string;
}

// Function to convert DB metric to frontend HistoricalMetric
function fromDbMetric(dbMetric: DbMetric): HistoricalMetric | null {
  if (!dbMetric || typeof dbMetric !== 'object') return null;
  try {
    let frontendType: DbMetricTypeValue;
    switch (dbMetric.type) {
      case 'loan_size':
        frontendType = 'average_loan_size';
        break;
      case 'conversion':
      case 'interest_rate':
        frontendType = dbMetric.type;
        break;
      default:
        console.warn(`Unexpected DB metric type: ${dbMetric.type}`);
        return null;
    }

    return {
      id: dbMetric.id,
      month: new Date(dbMetric.month),
      value: dbMetric.value,
      type: frontendType,
      createdAt: new Date(dbMetric.created_at),
      updatedAt: new Date(dbMetric.updated_at),
    };
  } catch (e) {
    console.error("Error converting DB metric:", e, dbMetric);
    return null;
  }
}

type ViewMode = 'table' | 'chart' | 'forecast';

export default function MetricsPage() {
  const supabaseClient = useSupabaseClient<Database>();
  const [metrics, setMetrics] = useState<HistoricalMetric[]>([]);
  const [rawMetricsData, setRawMetricsData] = useState<DbMetric[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [monthlyCapacity, setMonthlyCapacity] = useState<DbCapacityType[]>([]);
  const [activeTab, setActiveTab] = useState<DbMetricTypeValue>('conversion');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 5);
    return { start, end };
  });
  const [showDataPoints, setShowDataPoints] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [forecastMonths, setForecastMonths] = useState(6);
  const [showConfidenceBands, setShowConfidenceBands] = useState(true);
  const [confidencePercentage, setConfidencePercentage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!supabaseClient) {
      setError("Database connection not available.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Fetch metrics
      const metricsResult = await supabaseClient
        .from('historical_metrics')
        .select('*')
        .order('month', { ascending: true });
      if (metricsResult.error) throw new Error(`Metrics fetch failed: ${metricsResult.error.message}`);
      const dbMetrics = (metricsResult.data || []) as DbMetric[]; // Cast fetched data
      setRawMetricsData(dbMetrics);
      setMetrics(dbMetrics.map(fromDbMetric).filter((m): m is HistoricalMetric => m !== null));
      
      // Fetch initiatives
      const initiativesResult = await supabaseClient
        .from('initiatives')
        .select('*')
        .order('priority_score', { ascending: true })
        .order('id');
      if (initiativesResult.error) throw new Error(`Initiatives fetch failed: ${initiativesResult.error.message}`);
      const dbInitiatives = (initiativesResult.data || []) as DbInitiativeType[]; // Cast fetched data
      setInitiatives(dbInitiatives.map(fromDbInitiative).filter((i): i is Initiative => i !== null));

      // Fetch capacity
      const capacityResult = await supabaseClient
        .from('monthly_capacity')
        .select('*')
        .order('month', { ascending: true });
      if (capacityResult.error) throw new Error(`Capacity fetch failed: ${capacityResult.error.message}`);
      setMonthlyCapacity((capacityResult.data || []) as DbCapacityType[]); // Cast fetched data

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
  }, [supabaseClient]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const scheduledInitiativesResult = useMemo<ScheduleResult>(() => {
    if (!initiatives.length || !monthlyCapacity.length) {
      return { scheduledInitiatives: [], monthlyAllocation: {} };
    }
    try {
      return calculateRoadmapSchedule(initiatives, monthlyCapacity);
    } catch (error) {
      console.error("Error calculating roadmap schedule:", error);
      setError(error instanceof Error ? error.message : "Failed to calculate schedule");
      return { scheduledInitiatives: [], monthlyAllocation: {} };
    }
  }, [initiatives, monthlyCapacity]);

  const forecastResult = useMemo<ForecastResult>(() => {
    const metricsForForecast = metrics.filter(m => m.type === activeTab);
    if (metricsForForecast.length < 2) {
      console.warn(`Not enough historical data for ${activeTab} to calculate forecast.`);
      return { projectedValues: [] };
    }
    try {
      return calculateForecast(
        metricsForForecast,
        forecastMonths,
        showConfidenceBands ? confidencePercentage / 100 : undefined,
        scheduledInitiativesResult.scheduledInitiatives,
        activeTab
      );
    } catch (error) {
      console.error("Error calculating forecast:", error);
      setError(error instanceof Error ? error.message : "Failed to calculate forecast");
      return { projectedValues: [] };
    }
  }, [
    metrics,
    activeTab,
    forecastMonths,
    showConfidenceBands,
    confidencePercentage,
    scheduledInitiativesResult
  ]);

  const handleSuccess = () => {
    fetchData();
  };

  const handleError = (error: Error) => {
    setError(error.message);
  };

  const filteredMetrics = metrics
    .filter(metric => metric.type === activeTab)
    .filter((metric: HistoricalMetric) => {
      if (viewMode === 'forecast') {
        return true;
      }
      const date = metric.month instanceof Date ? metric.month : new Date(metric.month);
      if (isNaN(date.getTime())) return false;
      const startDate = dateRange.start instanceof Date ? dateRange.start : new Date(dateRange.start);
      const endDate = dateRange.end instanceof Date ? dateRange.end : new Date(dateRange.end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      date.setHours(0, 0, 0, 0);
      return date >= startDate && date <= endDate;
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
        <MetricInput onSuccess={handleSuccess} onError={handleError} />
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
                    <div className="relative h-96">
                      <ForecastDisplay
                        metrics={metrics.filter(m => m.type === activeTab)}
                        metricType={activeTab}
                        forecastMonths={forecastMonths}
                        showConfidenceBands={showConfidenceBands}
                        artificialConfidenceDecimal={confidencePercentage / 100}
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