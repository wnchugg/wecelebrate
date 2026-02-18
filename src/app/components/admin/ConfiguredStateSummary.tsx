import React from 'react';
import { Button } from '../ui/button';
import { CheckCircle, Edit, XCircle } from 'lucide-react';

interface ConfiguredStateSummaryProps {
  providerName: string;
  providerCategory: 'oauth' | 'saml';
  clientId?: string;
  entityId?: string;
  redirectUri?: string;
  acsUrl?: string;
  autoProvision: boolean;
  adminBypassEnabled: boolean;
  onEdit: () => void;
  onDisable: () => void;
}

export function ConfiguredStateSummary({
  providerName,
  providerCategory,
  clientId,
  entityId,
  redirectUri,
  acsUrl,
  autoProvision,
  adminBypassEnabled,
  onEdit,
  onDisable
}: ConfiguredStateSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-green-900">SSO is Active</p>
          <p className="text-sm text-green-700">
            Users will authenticate through {providerName}
          </p>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Provider</p>
          <p className="text-sm font-medium text-gray-900">{providerName}</p>
        </div>
        
        {providerCategory === 'oauth' && (
          <>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Client ID</p>
              <p className="text-sm font-medium text-gray-900 font-mono truncate">
                {clientId || 'Not set'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Redirect URI</p>
              <p className="text-sm font-medium text-gray-900 font-mono truncate">
                {redirectUri}
              </p>
            </div>
          </>
        )}
        
        {providerCategory === 'saml' && (
          <>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Entity ID</p>
              <p className="text-sm font-medium text-gray-900 font-mono truncate">
                {entityId || 'Not set'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">ACS URL</p>
              <p className="text-sm font-medium text-gray-900 font-mono truncate">
                {acsUrl}
              </p>
            </div>
          </>
        )}
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Auto-Provision</p>
          <p className="text-sm font-medium text-gray-900">
            {autoProvision ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Admin Bypass</p>
          <p className="text-sm font-medium text-gray-900">
            {adminBypassEnabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="default"
          onClick={onEdit}
          className="flex-1"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Configuration
        </Button>
        <Button
          variant="destructive"
          onClick={onDisable}
          className="flex-1"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Disable SSO
        </Button>
      </div>
    </div>
  );
}
