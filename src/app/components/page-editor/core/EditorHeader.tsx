/**
 * Editor Header Component
 * Requirements: 9.1, 9.4, 10.3
 */

import React from 'react';
import { Save, RotateCcw, AlertCircle, Check } from 'lucide-react';
import { SaveStatus } from './types';

export interface EditorHeaderProps {
  hasChanges: boolean;
  saveStatus: SaveStatus;
  onSave: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  hasChanges,
  saveStatus,
  onSave,
  onReset,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">Page Editor</h2>
          
          {hasChanges && (
            <div className="flex items-center text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              Unsaved changes
            </div>
          )}
          
          {saveStatus === 'saved' && (
            <div className="flex items-center text-green-600 text-sm">
              <Check className="w-4 h-4 mr-1" />
              Saved
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="px-3 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            Undo
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="px-3 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            Redo
          </button>

          <button
            onClick={onReset}
            className="px-3 py-2 text-sm border rounded hover:bg-gray-50 flex items-center"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </button>

          <button
            onClick={onSave}
            disabled={!hasChanges || saveStatus === 'saving'}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Save className="w-4 h-4 mr-1" />
            {saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
