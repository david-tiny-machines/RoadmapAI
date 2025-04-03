import { Initiative } from '../../types/initiative';

interface InitiativeListProps {
  initiatives: Initiative[];
  onEdit: (initiative: Initiative) => void;
  onDelete: (id: string) => void;
}

export default function InitiativeList({ initiatives, onEdit, onDelete }: InitiativeListProps) {
  if (initiatives.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-soft">
        <p className="text-gray-500">No initiatives yet. Create one using the form above.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 overflow-hidden bg-white rounded-xl shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Initiative
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value Lever
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uplift
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timeline
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Effort
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {initiatives.map((initiative) => (
              <tr key={initiative.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{initiative.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {initiative.isMandatory ? (
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-white border border-gray-200">
                      <span className="text-orange-500 mr-1">★</span>
                      <span className="text-gray-700">Mandatory</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-white border border-gray-200">
                      <span className="text-gray-700">Optional</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{initiative.valueLever}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {initiative.estimatedUplift > 0 ? '+' : ''}{initiative.estimatedUplift}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {initiative.confidence}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {initiative.startMonth || initiative.endMonth ? (
                      <>
                        {initiative.startMonth && (
                          <span>{new Date(initiative.startMonth).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        )}
                        {initiative.startMonth && initiative.endMonth && <span> → </span>}
                        {initiative.endMonth && (
                          <span>{new Date(initiative.endMonth).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500">Not scheduled</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{initiative.effortEstimate} days</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(initiative)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(initiative.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 