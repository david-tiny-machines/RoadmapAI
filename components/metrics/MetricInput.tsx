import { useState, FormEvent } from 'react';
import { MetricInput as MetricInputType } from '../../types/metrics';
import { DbMetricType, METRIC_TYPE_DISPLAY } from '../../types/database';
import { 
  getPreviousNMonths, 
  formatMonthYear, 
  fromMonthString, 
  formatMonthYearFromDate 
} from '../../utils/dateUtils';
import { createClient } from '@supabase/supabase-js';

interface MetricInputProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function MetricInput({ onSuccess, onError }: MetricInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MetricInputType>({
    type: 'conversion',
    value: 0,
    month: fromMonthString(getPreviousNMonths(1)[0])
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase
        .from('historical_metrics')
        .insert([{
          type: formData.type,
          value: formData.value,
          month: `${formData.month.getFullYear()}-${(formData.month.getMonth() + 1).toString().padStart(2, '0')}-01`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error(`A ${METRIC_TYPE_DISPLAY[formData.type]} metric for ${formatMonthYearFromDate(formData.month)} already exists.`);
        }
        throw error;
      }
      
      onSuccess?.();
      setFormData(prev => ({ ...prev, value: 0 }));
    } catch (error) {
      onError?.(error as Error);
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
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
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