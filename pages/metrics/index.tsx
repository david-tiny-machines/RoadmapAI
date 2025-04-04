import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import MainLayout from '../../components/layout/MainLayout';
import MetricInput from '../../components/metrics/MetricInput';
import MetricChart from '../../components/metrics/MetricChart';
import { Metric, MetricType } from '../../utils/metrics';

export default function MetricsPage() {
  const supabase = useSupabaseClient();
  const [selectedMetricType, setSelectedMetricType] = useState<MetricType>('conversion');
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, [selectedMetricType]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('type', selectedMetricType)
        .order('date', { ascending: true });

      if (error) throw error;

      setMetrics(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleMetricSubmit = async (metric: Omit<Metric, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .insert([{ ...metric, type: selectedMetricType }])
        .select()
        .single();

      if (error) throw error;

      setMetrics([...metrics, data]);
      setError(null);
    } catch (err) {
      console.error('Error adding metric:', err);
      setError('Failed to add metric');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Metrics Dashboard</h1>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metric Type
          </label>
          <select
            value={selectedMetricType}
            onChange={(e) => setSelectedMetricType(e.target.value as MetricType)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="conversion">Conversion Rate</option>
            <option value="loan_size">Average Loan Size</option>
            <option value="interest_rate">Interest Rate</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-[400px] text-red-600">
                {error}
              </div>
            ) : metrics.length === 0 ? (
              <div className="flex items-center justify-center h-[400px] text-gray-500">
                No metrics data available
              </div>
            ) : (
              <MetricChart
                metrics={metrics}
                metricType={selectedMetricType}
              />
            )}
          </div>

          <div>
            <div className="bg-white shadow sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Add New Metric
              </h2>
              <MetricInput onSubmit={handleMetricSubmit} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 