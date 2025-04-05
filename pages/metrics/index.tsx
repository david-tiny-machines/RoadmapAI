import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import MetricInput from '../../components/metrics/MetricInput';
import MetricTabs from '../../components/metrics/MetricTabs';
import MetricTable from '../../components/metrics/MetricTable';
import { HistoricalMetric } from '../../types/metrics';
import { DbMetricType } from '../../types/database';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<HistoricalMetric[]>([]);
  const [activeTab, setActiveTab] = useState<DbMetricType>('conversion');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('historical_metrics')
        .select('*')
        .order('month', { ascending: false });

      if (error) throw error;
      
      const formattedData = data?.map(metric => ({
        ...metric,
        month: new Date(metric.month),
        createdAt: metric.created_at,
        updatedAt: metric.updated_at
      })) || [];
      
      setMetrics(formattedData);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleSuccess = () => {
    fetchMetrics();
  };

  const handleError = (error: Error) => {
    setError(error.message);
  };

  const filteredMetrics = metrics.filter(metric => metric.type === activeTab);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Historical Metrics</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Metric</h2>
        <MetricInput onSuccess={handleSuccess} onError={handleError} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <div className="mr-3">⚠️</div>
          <div>
            <h3 className="font-medium mb-1">Error Adding Metric</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Existing Metrics</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <MetricTabs activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="mt-4">
                <MetricTable metrics={filteredMetrics} metricType={activeTab} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 