import { useState } from 'react';
import { MetricType } from '../../utils/metrics';

interface MetricInputProps {
  onSubmit: (data: { value: number; date: string }) => Promise<void>;
}

export default function MetricInput({ onSubmit }: MetricInputProps) {
  const [value, setValue] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!value || !date) {
      setError('Please fill in all fields');
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      setError('Please enter a valid number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        value: numericValue,
        date,
      });
      setValue('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error('Error submitting metric:', err);
      setError('Failed to submit metric');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700">
          Value
        </label>
        <input
          type="number"
          id="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter value"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Metric'}
      </button>
    </form>
  );
} 