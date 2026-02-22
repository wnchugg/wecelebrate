/**
 * Mode Selector Component
 * Requirements: 1.3, 1.4, 2.1, 2.5
 */

import React from 'react';
import { Palette, Blocks, Code } from 'lucide-react';
import { EditorMode } from './types';

export interface ModeSelectorProps {
  currentMode: EditorMode;
  allowedModes: EditorMode[];
  onModeChange: (mode: EditorMode) => void;
}

const modeConfig = {
  visual: {
    label: 'Visual',
    icon: Palette,
    description: 'Form-based editing',
  },
  blocks: {
    label: 'Blocks',
    icon: Blocks,
    description: 'Drag-and-drop builder',
  },
  custom: {
    label: 'Custom Code',
    icon: Code,
    description: 'HTML/CSS/JS',
  },
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  allowedModes,
  onModeChange,
}) => {
  return (
    <div className="flex space-x-2 border-b bg-gray-50 px-6 py-3">
      {allowedModes.map((mode) => {
        const config = modeConfig[mode];
        const Icon = config.icon;
        const isActive = currentMode === mode;

        return (
          <button
            key={mode}
            onClick={() => onModeChange(mode)}
            className={`
              flex items-center px-4 py-2 rounded-t border-b-2 transition-colors
              ${
                isActive
                  ? 'bg-white border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:bg-gray-100'
              }
            `}
            title={config.description}
          >
            <Icon className="w-4 h-4 mr-2" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
};
