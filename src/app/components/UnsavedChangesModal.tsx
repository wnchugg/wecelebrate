import { X, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
}

export function UnsavedChangesModal({
  isOpen,
  onClose,
  onSave,
  onDiscard,
  isSaving
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Unsaved Changes</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-2">You have unsaved changes</p>
                <p>
                  Would you like to save your changes before switching to live mode? 
                  If you discard, your recent edits will be lost.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onDiscard}
            disabled={isSaving}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Discard Changes
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-[#D91C81] hover:bg-[#B71569] text-white"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
