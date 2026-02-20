import React, { useMemo } from 'react';
import { X, AlertTriangle, CheckCircle, ArrowRight, Rocket, Edit3 } from 'lucide-react';
import { Button } from './ui/button';

interface Change {
  field: string;
  category: string;
  oldValue: any;
  newValue: any;
  type: 'added' | 'modified' | 'removed';
}

interface PublishConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  changes: Change[];
  isPublishing: boolean;
  siteName: string;
}

export function PublishConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  changes,
  isPublishing,
  siteName
}: PublishConfirmationModalProps) {
  const groupedChanges = useMemo(() => {
    const groups: Record<string, Change[]> = {};
    changes.forEach(change => {
      if (!groups[change.category]) {
        groups[change.category] = [];
      }
      groups[change.category].push(change);
    });
    return groups;
  }, [changes]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return '(empty)';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'string' && value.length > 100) return value.substring(0, 100) + '...';
    return String(value);
  };

  if (!isOpen) return null;  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Publish Site Configuration</h2>
              <p className="text-sm text-gray-600">Review changes before publishing to live</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">Publishing will make these changes live</p>
                <p>
                  The site <strong>{siteName}</strong> will be updated and all users will see these changes immediately.
                  You can still edit the site later, but changes won't be visible until you publish again.
                </p>
              </div>
            </div>
          </div>

          {/* Changes Summary */}
          {changes.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-blue-900 font-semibold mb-1">No changes detected</p>
              <p className="text-sm text-blue-700">
                The draft configuration matches the live version. You can still publish to update the status.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Changes to Publish ({changes.length})
                </h3>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {changes.filter(c => c.type === 'added').length} Added
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {changes.filter(c => c.type === 'modified').length} Modified
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                    {changes.filter(c => c.type === 'removed').length} Removed
                  </span>
                </div>
              </div>

              {/* Grouped Changes */}
              <div className="space-y-4">
                {Object.entries(groupedChanges).map(([category, categoryChanges]) => (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-900 text-sm">{category}</h4>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {categoryChanges.map((change, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              change.type === 'added' ? 'bg-green-100' :
                              change.type === 'modified' ? 'bg-blue-100' :
                              'bg-red-100'
                            }`}>
                              {change.type === 'added' ? (
                                <span className="text-green-600 text-xs font-bold">+</span>
                              ) : change.type === 'modified' ? (
                                <span className="text-blue-600 text-xs font-bold">~</span>
                              ) : (
                                <span className="text-red-600 text-xs font-bold">-</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm mb-2">{change.field}</p>
                              <div className="flex items-center gap-3 text-sm">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500 mb-1">Current (Live)</p>
                                  <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-red-900 font-mono text-xs break-all">
                                    {formatValue(change.oldValue)}
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500 mb-1">New (Draft)</p>
                                  <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-green-900 font-mono text-xs break-all">
                                    {formatValue(change.newValue)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            disabled={isPublishing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Continue Editing
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPublishing}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Publish to Live
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
