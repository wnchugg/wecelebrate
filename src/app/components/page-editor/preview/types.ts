/**
 * Preview system type definitions
 * Requirements: 7.1, 7.2, 15.1
 */

import { PageConfiguration } from '../core/types';

/**
 * Device mode for responsive preview
 */
export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

/**
 * Device width mappings
 */
export const deviceWidths: Record<DeviceMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

/**
 * Props for PreviewPanel component
 */
export interface PreviewPanelProps {
  config: PageConfiguration;
  device: DeviceMode;
  onDeviceChange: (device: DeviceMode) => void;
  showDeviceControls?: boolean;
  showExternalLink?: boolean;
  externalUrl?: string;
}

/**
 * Props for PreviewRenderer component
 */
export interface PreviewRendererProps {
  config: PageConfiguration;
  device: DeviceMode;
  interactive?: boolean;
}

/**
 * Props for DeviceModeSelector component
 */
export interface DeviceModeSelectorProps {
  currentDevice: DeviceMode;
  onDeviceChange: (device: DeviceMode) => void;
}
