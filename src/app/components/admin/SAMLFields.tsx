import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface SAMLFieldsProps {
  ssoIdpEntryPoint: string;
  setSsoIdpEntryPoint: (value: string) => void;
  ssoEntityId: string;
  setSsoEntityId: (value: string) => void;
  ssoCertificate: string;
  setSsoCertificate: (value: string) => void;
  ssoAcsUrl: string;
  validationErrors: Record<string, string>;
  disabled: boolean;
  onFieldChange: () => void;
}

export function SAMLFields({
  ssoIdpEntryPoint,
  setSsoIdpEntryPoint,
  ssoEntityId,
  setSsoEntityId,
  ssoCertificate,
  setSsoCertificate,
  ssoAcsUrl,
  validationErrors,
  disabled,
  onFieldChange
}: SAMLFieldsProps) {
  const handleCopyAcsUrl = () => {
    navigator.clipboard.writeText(ssoAcsUrl);
    toast.success('ACS URL copied to clipboard');
  };

  return (
    <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        SAML 2.0 Settings
      </h4>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          IdP Entry Point (SSO URL) *
        </label>
        <Input
          type="url"
          value={ssoIdpEntryPoint}
          onChange={(e) => {
            setSsoIdpEntryPoint(e.target.value);
            onFieldChange();
          }}
          placeholder="https://sso.provider.com/saml/sso"
          disabled={disabled}
        />
        {validationErrors.idpEntryPoint && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.idpEntryPoint}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Issuer / Entity ID *
        </label>
        <Input
          type="text"
          value={ssoEntityId}
          onChange={(e) => {
            setSsoEntityId(e.target.value);
            onFieldChange();
          }}
          placeholder="urn:your-app:entity-id"
          disabled={disabled}
        />
        {validationErrors.entityId && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.entityId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          X.509 Certificate *
        </label>
        <textarea
          rows={4}
          value={ssoCertificate}
          onChange={(e) => {
            setSsoCertificate(e.target.value);
            onFieldChange();
          }}
          placeholder="Paste your X.509 certificate here..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono text-xs disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
        />
        <p className="text-xs text-gray-500 mt-1">
          Public certificate from your identity provider
        </p>
        {validationErrors.certificate && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.certificate}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Assertion Consumer Service URL *
        </label>
        <div className="flex gap-2">
          <Input
            type="url"
            value={ssoAcsUrl}
            readOnly
            className="bg-gray-50"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyAcsUrl}
          >
            Copy
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Configure this URL in your IdP as the ACS URL
        </p>
      </div>
    </div>
  );
}
