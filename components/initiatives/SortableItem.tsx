import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Initiative } from '../../types/initiative';
import { calculateWeightedImpact, calculatePriorityScore } from '../../utils/prioritizationUtils';
import { formatMonthYear } from '../../utils/dateUtils';
import DeleteModal from '../common/DeleteModal';
import { VALUE_LEVER_DISPLAY } from '../../types/database';

interface SortableItemProps {
  item: Initiative;
  onEdit: (initiative: Initiative) => void;
  onDelete: (id: string) => void;
}

export function SortableItem({ item, onEdit, onDelete }: SortableItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(item.id);
    setShowDeleteModal(false);
  };

  const weightedImpact = calculateWeightedImpact(item);
  const priorityScore = calculatePriorityScore(item);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 rounded-lg border mb-2 ${
          item.isMandatory ? 'bg-yellow-50' : 'bg-white'
        } ${isDragging ? 'shadow-lg' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              {...attributes}
              {...listeners}
              className="mr-3 cursor-move p-1 hover:bg-gray-100 rounded"
            >
              ⋮⋮
            </div>
            <div>
              <div className="font-medium flex items-center">
                {item.name}
                {item.isMandatory && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Mandatory
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {VALUE_LEVER_DISPLAY[item.valueLever]}
                {(item.startMonth || item.endMonth) && (
                  <span className="ml-2 text-gray-400">
                    {item.startMonth && !item.endMonth && `From ${formatMonthYear(item.startMonth)}`}
                    {!item.startMonth && item.endMonth && `Until ${formatMonthYear(item.endMonth)}`}
                    {item.startMonth && item.endMonth && `${formatMonthYear(item.startMonth)} to ${formatMonthYear(item.endMonth)}`}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Priority Score: {priorityScore.toFixed(2)} • 
                Effort: {item.effortEstimate} days • 
                Impact: {weightedImpact.toFixed(2)}%
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
} 