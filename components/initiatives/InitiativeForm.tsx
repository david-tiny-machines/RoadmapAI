import { useState, FormEvent } from 'react';
import { Initiative, ValueLever } from '../../types/initiative';

const VALUE_LEVERS: ValueLever[] = [
  'Conversion',
  'Average Loan Size',
  'Interest Rate',
  'Customer Acquisition',
  'Customer Retention',
  'Cost Reduction',
  'Compliance/Risk Mitigation',
  'BAU obligations',
];

interface InitiativeFormProps {
  onSubmit: (initiative: Omit<Initiative, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Initiative;
}

export default function InitiativeForm({ onSubmit, initialData }: InitiativeFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    valueLever: initialData?.valueLever || VALUE_LEVERS[0],
    estimatedUplift: initialData?.estimatedUplift || 0,
    confidence: initialData?.confidence || 50,
    effortEstimate: initialData?.effortEstimate || 1,
    startMonth: initialData?.startMonth || '',
    endMonth: initialData?.endMonth || '',
    isMandatory: initialData?.isMandatory || false,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-soft">
      {/* Name */}
      <div>
        <label htmlFor="name" className="form-label">
          Initiative Name
        </label>
        <input
          type="text"
          id="name"
          className="input-field"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      {/* Value Lever */}
      <div>
        <label htmlFor="valueLever" className="form-label">
          Value Lever
        </label>
        <select
          id="valueLever"
          className="input-field"
          value={formData.valueLever}
          onChange={(e) => setFormData({ ...formData, valueLever: e.target.value as ValueLever })}
          required
        >
          {VALUE_LEVERS.map((lever) => (
            <option key={lever} value={lever}>
              {lever}
            </option>
          ))}
        </select>
      </div>

      {/* Estimated Uplift */}
      <div>
        <label htmlFor="estimatedUplift" className="form-label">
          Estimated Uplift (%)
        </label>
        <input
          type="number"
          id="estimatedUplift"
          className="input-field"
          value={formData.estimatedUplift}
          onChange={(e) => setFormData({ ...formData, estimatedUplift: parseFloat(e.target.value) })}
          step="0.1"
          required
        />
      </div>

      {/* Confidence */}
      <div>
        <label htmlFor="confidence" className="form-label">
          Confidence (%)
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            id="confidence"
            className="w-full"
            value={formData.confidence}
            onChange={(e) => setFormData({ ...formData, confidence: parseInt(e.target.value) })}
            min="0"
            max="100"
            step="1"
          />
          <span className="text-sm font-medium w-12">{formData.confidence}%</span>
        </div>
      </div>

      {/* Effort Estimate */}
      <div>
        <label htmlFor="effortEstimate" className="form-label">
          Effort Estimate (days)
        </label>
        <input
          type="number"
          id="effortEstimate"
          className="input-field"
          value={formData.effortEstimate}
          onChange={(e) => setFormData({ ...formData, effortEstimate: parseInt(e.target.value) })}
          min="1"
          required
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startMonth" className="form-label flex items-center space-x-1">
            <span>Start Month</span>
            <span className="text-sm text-gray-500">(Optional)</span>
          </label>
          <input
            type="month"
            id="startMonth"
            className="input-field"
            value={formData.startMonth}
            onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="endMonth" className="form-label flex items-center space-x-1">
            <span>End Month</span>
            <span className="text-sm text-gray-500">(Optional)</span>
          </label>
          <input
            type="month"
            id="endMonth"
            className="input-field"
            value={formData.endMonth}
            onChange={(e) => setFormData({ ...formData, endMonth: e.target.value })}
          />
        </div>
      </div>

      {/* Mandatory Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isMandatory"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={formData.isMandatory}
          onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
        />
        <label htmlFor="isMandatory" className="text-sm font-medium text-gray-700">
          Mandatory Initiative
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          Save Initiative
        </button>
      </div>
    </form>
  );
} 