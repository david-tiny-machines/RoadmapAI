import { useState } from 'react';
import { Initiative } from '../../types/initiative';

interface InitiativeFormProps {
  onSubmit: (initiative: Omit<Initiative, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'priority_score'>) => void;
}

export default function InitiativeForm({ onSubmit }: InitiativeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    value_lever: '',
    uplift: 0,
    confidence: 0,
    effort_estimate: 0,
    start_month: '',
    end_month: '',
    is_mandatory: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      value_lever: '',
      uplift: 0,
      confidence: 0,
      effort_estimate: 0,
      start_month: '',
      end_month: '',
      is_mandatory: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Initiative Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="value_lever" className="block text-sm font-medium text-gray-700">
            Value Lever
          </label>
          <input
            type="text"
            id="value_lever"
            value={formData.value_lever}
            onChange={(e) => setFormData({ ...formData, value_lever: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="uplift" className="block text-sm font-medium text-gray-700">
              Uplift (%)
            </label>
            <input
              type="number"
              id="uplift"
              value={formData.uplift}
              onChange={(e) => setFormData({ ...formData, uplift: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min="0"
              max="100"
              required
            />
          </div>

          <div>
            <label htmlFor="confidence" className="block text-sm font-medium text-gray-700">
              Confidence (%)
            </label>
            <input
              type="number"
              id="confidence"
              value={formData.confidence}
              onChange={(e) => setFormData({ ...formData, confidence: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min="0"
              max="100"
              required
            />
          </div>

          <div>
            <label htmlFor="effort_estimate" className="block text-sm font-medium text-gray-700">
              Effort (days)
            </label>
            <input
              type="number"
              id="effort_estimate"
              value={formData.effort_estimate}
              onChange={(e) => setFormData({ ...formData, effort_estimate: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min="0"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_month" className="block text-sm font-medium text-gray-700">
              Start Month
            </label>
            <input
              type="month"
              id="start_month"
              value={formData.start_month}
              onChange={(e) => setFormData({ ...formData, start_month: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="end_month" className="block text-sm font-medium text-gray-700">
              End Month
            </label>
            <input
              type="month"
              id="end_month"
              value={formData.end_month}
              onChange={(e) => setFormData({ ...formData, end_month: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_mandatory"
            checked={formData.is_mandatory}
            onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="is_mandatory" className="ml-2 block text-sm text-gray-900">
            Mandatory Initiative
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Initiative
          </button>
        </div>
      </div>
    </form>
  );
} 