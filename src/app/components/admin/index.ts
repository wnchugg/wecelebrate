/**
 * Admin Component Exports Index
 * Central export point for all admin components
 */

// Modal Components
export { CreateSiteModal } from './CreateSiteModal';
export { CreateGiftModal } from './CreateGiftModal';
export { GiftDetailModal } from './GiftDetailModal';
export { EmployeeImportModal, type EmployeeRecord } from './EmployeeImportModal';
export { SftpConfigModal } from './SftpConfigModal';
export { StoreLocationModal } from './StoreLocationModal';
export { BrandModal } from './BrandModal';
export { ConfirmDialog } from './ConfirmDialog';
export { ConfirmationModal } from './ConfirmationModal';
export { TestEmailModal } from './TestEmailModal';
export { Modal } from './Modal';

// Display Components
export { PublicSitePreview } from './PublicSitePreview';
export { SitePreview } from './SitePreview';
export { DeployedDomainBanner } from './DeployedDomainBanner';
export { JWTDiagnosticBanner } from './JWTDiagnosticBanner';
export { StatusBadge } from './StatusBadge';

// Data Table Components
export { DataTable } from './DataTable';

// Admin Section Components
export { FieldMapper } from './FieldMapper';
export { ScheduleManager } from './ScheduleManager';
export { ManualEmployeeUpload } from './ManualEmployeeUpload';
export { SFTPConfiguration } from './SFTPConfiguration';
export { HRISIntegrationTab } from './HRISIntegrationTab';
export { HRISIntegrationSection } from './HRISIntegrationSection';
export { SiteMappingRules } from './SiteMappingRules';
export { EmailAutomationTriggers } from './EmailAutomationTriggers';
export { ERPConnectionForm } from './ERPConnectionForm';
export { CronBuilder } from './CronBuilder';

// System Components
export { BackendHealthMonitor } from './BackendHealthMonitor';
export { DatabaseCleanupPanel } from './DatabaseCleanupPanel';

// Re-export common admin types
export type { SftpConfig } from '../../types/admin';