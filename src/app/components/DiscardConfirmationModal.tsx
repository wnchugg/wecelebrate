import React from 'react';
import { X, AlertTriangle, History } from 'lucide-react';
import { Button } from './ui/button';

interface DiscardConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDiscarding: boolean;
  siteName: string;
}

export function DiscardConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isDiscarding,
  siteName
}: DiscardConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Discard Draft Changes?</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDiscarding}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-900">
                <p className="font-semibold mb-2">This action cannot be undone</p>
                <p>
                  This will permanently delete all draft changes for <strong>{siteName}</strong> and 
                  revert to the published version. Any unpublished modifications will be lost.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            disabled={isDiscarding}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDiscarding}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            {isDiscarding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Discarding...
              </>
            ) : (
              <>
                <History className="w-4 h-4" />
                Discard Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
