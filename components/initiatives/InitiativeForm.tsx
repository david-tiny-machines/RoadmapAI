import { useState } from 'react';
import { Initiative, DbValueLever, VALUE_LEVER_DISPLAY, DbInitiativeType } from '../../types/database';
import { useAuth } from '../../contexts/AuthContext';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../types/supabase';
import { fromMonthString, formatDateToYYYYMMDD } from '../../utils/dateUtils';
import { calculatePriorityScore } from '../../utils/prioritizationUtils';
import ErrorDisplay from '../shared/ErrorDisplay';

interface InitiativeFormProps {
  onSave: () => void;
  onCancel: () => void;
  initialData?: Initiative;
}

export default function InitiativeForm({ onSave, onCancel, initialData }: InitiativeFormProps) {
  const { user } = useAuth();
  const supabaseClient = useSupabaseClient<Database>();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Initiative>(() => ({
    id: initialData?.id || crypto.randomUUID(),
    userId: user?.id || '',
    name: initialData?.name || '',
    valueLever: initialData?.valueLever || 'conversion',
    uplift: initialData?.uplift || 0,
    confidence: initialData?.confidence || 0,
    effortEstimate: initialData?.effortEstimate || 0,
    startMonth: initialData?.startMonth || null,
    endMonth: initialData?.endMonth || null,
    isMandatory: initialData?.isMandatory || false,
    createdAt: initialData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const validateDates = (startMonth: string | null, endMonth: string | null): string | null => {
    if (!startMonth) return null;
    if (!endMonth) return null;
    return startMonth > endMonth ? 'End date cannot be before start date' : null;
  };

  const validateForm = (data: Initiative): string | null => {
    if (!data.name.trim()) {
      return 'Initiative name is required';
    }

    // --- Parse string numbers before validation ---
    const upliftNum = parseFloat(data.uplift as any); // Use 'any' temporarily if TS complains about string
    const confidenceNum = parseFloat(data.confidence as any);
    const effortNum = parseFloat(data.effortEstimate as any);
    // --- End parsing ---

    // Note: No uplift validation needed as per previous step

    if (isNaN(confidenceNum) || confidenceNum < 0 || confidenceNum > 100) {
      return 'Confidence must be a number between 0 and 100';
    }
    if (isNaN(effortNum) || effortNum <= 0) {
      return 'Effort estimate must be a number greater than 0';
    }
    
    // Validate dates (ensure they are valid strings first)
    const startMonthStr = typeof data.startMonth === 'string' ? data.startMonth : null;
    const endMonthStr = typeof data.endMonth === 'string' ? data.endMonth : null;
    if (startMonthStr && endMonthStr) {
        // Additional check: ensure they are valid YYYY-MM or YYYY-MM-DD formats if needed
        if (!isValidMonthFormat(startMonthStr) || !isValidMonthFormat(endMonthStr)) {
            // return 'Invalid date format. Use YYYY-MM.'; // Or handle implicitly
        } else {
             return validateDates(startMonthStr, endMonthStr);
        }
    }

    return null;
  };

  // Helper function (could be moved to dateUtils)
  const isValidMonthFormat = (dateStr: string): boolean => {
    return /^\d{4}-\d{2}$/.test(dateStr) || /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabaseClient) {
       setError('Cannot save initiative: User or database connection is unavailable.');
       return;
    }

    // Validate all form fields
    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Intelligently format dates based on whether they were modified
      let startMonthFormatted: string | null = null;
      if (formData.startMonth) {
          // Assuming startMonth is YYYY-MM or YYYY-MM-DD string based on state handling
          const startMonthStr = formData.startMonth as string;
          if (startMonthStr.length === 7) { // YYYY-MM
             const dateObj = fromMonthString(startMonthStr);
             startMonthFormatted = formatDateToYYYYMMDD(dateObj);
          } else if (startMonthStr.length === 10 && isValidMonthFormat(startMonthStr)) { // YYYY-MM-DD
             startMonthFormatted = startMonthStr;
          }
      }
      
      let endMonthFormatted: string | null = null;
      if (formData.endMonth) {
          const endMonthStr = formData.endMonth as string;
          if (endMonthStr.length === 7) { // YYYY-MM
             const dateObj = fromMonthString(endMonthStr);
             endMonthFormatted = formatDateToYYYYMMDD(dateObj);
          } else if (endMonthStr.length === 10 && isValidMonthFormat(endMonthStr)) { // YYYY-MM-DD
             endMonthFormatted = endMonthStr;
          }
      }

      // Parse and round numbers before saving
      const upliftNum = parseFloat(formData.uplift as any) || 0;
      const confidenceNum = parseFloat(formData.confidence as any) || 0;
      const effortEstimateNum = parseFloat(formData.effortEstimate as any) || 0;
      const effortEstimateInt = Math.round(effortEstimateNum);

      // Calculate priority score using parsed numbers
      const priorityScore = calculatePriorityScore({
          ...formData, // Pass other fields
          uplift: upliftNum,
          confidence: confidenceNum,
          effortEstimate: effortEstimateNum,
      });

      const { error: dbError } = await supabaseClient
        .from('initiatives')
        .upsert({
          id: formData.id,
          user_id: user.id,
          name: formData.name,
          value_lever: formData.valueLever,
          uplift: upliftNum,
          confidence: confidenceNum,
          effort_estimate: effortEstimateInt,
          start_month: startMonthFormatted,
          end_month: endMonthFormatted,
          is_mandatory: formData.isMandatory,
          created_at: initialData ? undefined : formData.createdAt,
          updated_at: new Date().toISOString(),
          priority_score: priorityScore,
        } as DbInitiativeType);

      if (dbError) throw dbError;
      onSave();
    } catch (error) {
      console.error('Error saving initiative:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while saving the initiative');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Store raw value directly, handle type-specific needs later or on submit
    let stateValue: string | boolean | null;

    if (type === 'checkbox') {
       stateValue = (e.target as HTMLInputElement).checked;
    } else {
        // Store raw string value for text, number, month, select.
        // This avoids NaN for numbers and allows typing "-".
        // Actual numeric conversion/validation happens in validateForm/handleSubmit.
        stateValue = value;
        // Handle null for empty month inputs explicitly if needed
        if ((name === 'startMonth' || name === 'endMonth') && value === '') {
            stateValue = null;
        }
    }

    const newFormData = {
      ...formData,
      [name]: stateValue,
    };

    // Minimal immediate validation (e.g., required fields)
    // Defer numeric/complex validation to validateForm before submit
    let validationError: string | null = null;
    if (name === 'name') {
      if (typeof stateValue === 'string' && !stateValue.trim()) {
        validationError = 'Initiative name is required';
      }
    }
    // Potentially add date range validation here if desired immediately
    // else if (name === 'startMonth' || name === 'endMonth') {
    //   if (newFormData.startMonth && newFormData.endMonth) {
    //       validationError = validateDates(newFormData.startMonth as string, newFormData.endMonth as string);
    //   }
    // }

    setError(validationError); // Show only immediate errors
    setFormData(newFormData); 
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorDisplay message={error} onClose={() => setError(null)} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="valueLever" className="block text-sm font-medium text-gray-700">
          Value Lever
        </label>
        <select
          id="valueLever"
          name="valueLever"
          value={formData.valueLever}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {Object.entries(VALUE_LEVER_DISPLAY).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="uplift" className="block text-sm font-medium text-gray-700">
          Uplift (%)
        </label>
        <input
          type="number"
          id="uplift"
          name="uplift"
          value={formData.uplift}
          onChange={handleChange}
          required
          max="100"
          step="0.1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="confidence" className="block text-sm font-medium text-gray-700">
          Confidence (%)
        </label>
        <input
          type="number"
          id="confidence"
          name="confidence"
          value={formData.confidence}
          onChange={handleChange}
          required
          min="0"
          max="100"
          step="1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="effortEstimate" className="block text-sm font-medium text-gray-700">
          Effort Estimate (days)
        </label>
        <input
          type="number"
          id="effortEstimate"
          name="effortEstimate"
          value={formData.effortEstimate}
          onChange={handleChange}
          required
          min="0"
          step="0.5"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="startMonth" className="block text-sm font-medium text-gray-700">
          Start Month
        </label>
        <input
          type="month"
          id="startMonth"
          name="startMonth"
          value={formData.startMonth ? formData.startMonth.substring(0, 7) : ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="endMonth" className="block text-sm font-medium text-gray-700">
          End Month
        </label>
        <input
          type="month"
          id="endMonth"
          name="endMonth"
          value={formData.endMonth ? formData.endMonth.substring(0, 7) : ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isMandatory"
          name="isMandatory"
          checked={formData.isMandatory}
          onChange={handleCheckboxChange}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isMandatory" className="ml-2 block text-sm text-gray-900">
          Mandatory Initiative
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
} 