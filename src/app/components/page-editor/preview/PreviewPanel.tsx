/**
 * Preview Panel Component
 * Requirements: 7.1, 7.2, 7.5, 15.1
 */

import React from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';
import { PreviewPanelProps, DeviceMode, deviceWidths } from './types';
import { PreviewRenderer } from './PreviewRenderer';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  config,
  device,
  onDeviceChange,
  showDeviceControls = true,
  showExternalLink = false,
  externalUrl,
}) => {
  const deviceIcons: Record<DeviceMode, React.ComponentType<any>> = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {showDeviceControls && (
        <div className="flex items-center justify-between border-b bg-white px-6 py-3">
          <div className="flex space-x-2">
            {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map((mode) => {
              const Icon = deviceIcons[mode];
              const isActive = device === mode;

              return (
                <button
                  key={mode}
                  onClick={() => onDeviceChange(mode)}
                  className={`
                    p-2 rounded transition-colors
                    ${
                      isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                  title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          {showExternalLink && externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open in new tab
            </a>
          )}
        </div>
      )}

      <div className="flex-1 p-6 overflow-auto">
        <div
          className="mx-auto bg-white shadow-lg transition-all duration-300"
          style={{
            width: deviceWidths[device],
            minHeight: '600px',
          }}
        >
          <div className="p-8">
            <PreviewRenderer config={config} device={device} interactive={false} />
          </div>
        </div>
      </div>
    </div>
  );
};
