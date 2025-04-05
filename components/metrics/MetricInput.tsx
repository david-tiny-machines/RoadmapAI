import { useState, FormEvent } from 'react';
import { MetricInput as MetricInputType } from '../../types/metrics';
import { DbMetricType, METRIC_TYPE_DISPLAY } from '../../types/database';
import { 
  getPreviousNMonths, 
  formatMonthYear, 
  fromMonthString, 
  formatMonthYearFromDate, 
  formatDateToYYYYMMDD
} from '../../utils/dateUtils';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import ErrorDisplay from '../shared/ErrorDisplay';
import { Database } from '../../types/supabase';

// Type definition for the specific Supabase metric type enum
// Aligning with the linter error message
type SupabaseMetricType = Database['public']['Tables']['historical_metrics']['Row']['type'];

interface MetricInputProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function MetricInput({ onSuccess, onError }: MetricInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<MetricInputType>({
    type: 'conversion',
    value: 0,
    month: fromMonthString(getPreviousNMonths(1)[0])
  });
  const supabaseClient = useSupabaseClient<Database>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!supabaseClient) {
      setError('Database connection is not available.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Format month, ensure it's a string
      const monthDbFormat = formatDateToYYYYMMDD(formData.month);
      if (!monthDbFormat) {
        throw new Error('Invalid month selected.');
      }

      // Map frontend type to Supabase expected type
      let supabaseMetricType: SupabaseMetricType;
      switch (formData.type) {
        case 'average_loan_size':
          supabaseMetricType = 'loan_size';
          break;
        case 'conversion':
          supabaseMetricType = 'conversion';
          break;
        case 'interest_rate':
          supabaseMetricType = 'interest_rate';
          break;
        default:
          // Handle unexpected types if necessary
          throw new Error(`Unsupported metric type: ${formData.type}`);
      }

      const { error: dbError } = await supabaseClient
        .from('historical_metrics')
        .insert([{
          type: supabaseMetricType, // Use mapped type
          value: formData.value,
          month: monthDbFormat, // Use guaranteed string format
        }]);

      if (dbError) {
        if (dbError.code === '23505') {
          throw new Error(`A ${METRIC_TYPE_DISPLAY[formData.type]} metric for ${formatMonthYearFromDate(formData.month)} already exists.`);
        }
        throw dbError;
      }
      
      onSuccess?.();
      setFormData(prev => ({ ...prev, value: 0 }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while saving the metric.';
      console.error("Error saving metric:", err);
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthOptions = getPreviousNMonths(24).map(monthStr => ({
    value: monthStr,
    date: fromMonthString(monthStr),
    label: formatMonthYear(monthStr)
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorDisplay message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Metric Type
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as DbMetricType }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {Object.entries(METRIC_TYPE_DISPLAY).map(([dbValue, displayName]) => (
              <option key={dbValue} value={dbValue}>{displayName}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700">
            Month
          </label>
          <select
            id="month"
            value={`${formData.month.getFullYear()}-${(formData.month.getMonth() + 1).toString().padStart(2, '0')}`}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, month: fromMonthString(e.target.value) }));
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700">
            Value
          </label>
          <input
            type="number"
            id="value"
            value={formData.value?.toString() ?? ''}
            onChange={(e) => {
              const rawValue = e.target.value;
              const newValue = rawValue === '' ? 0 : parseFloat(rawValue);
              setFormData(prev => ({ ...prev, value: newValue }));
            }}
            step="0.01"
            min="0"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Metric'}
        </button>
      </div>
    </form>
  );
} 