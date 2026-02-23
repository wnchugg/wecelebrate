import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface OAuthFieldsProps {
  ssoClientId: string;
  setSsoClientId: (value: string) => void;
  ssoClientSecret: string;
  setSsoClientSecret: (value: string) => void;
  ssoAuthUrl: string;
  setSsoAuthUrl: (value: string) => void;
  ssoTokenUrl: string;
  setSsoTokenUrl: (value: string) => void;
  ssoUserInfoUrl: string;
  setSsoUserInfoUrl: (value: string) => void;
  ssoScope: string;
  setSsoScope: (value: string) => void;
  ssoRedirectUri: string;
  validationErrors: Record<string, string>;
  disabled: boolean;
  onFieldChange: () => void;
}

export function OAuthFields({
  ssoClientId,
  setSsoClientId,
  ssoClientSecret,
  setSsoClientSecret,
  ssoAuthUrl,
  setSsoAuthUrl,
  ssoTokenUrl,
  setSsoTokenUrl,
  ssoUserInfoUrl,
  setSsoUserInfoUrl,
  ssoScope,
  setSsoScope,
  ssoRedirectUri,
  validationErrors,
  disabled,
  onFieldChange
}: OAuthFieldsProps) {
  const handleCopyRedirectUri = () => {
    void navigator.clipboard.writeText(ssoRedirectUri);
    toast.success('Redirect URI copied to clipboard');
  };

  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15V17M12 7V13M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        OAuth 2.0 / OpenID Connect Settings
      </h4>

      <div>
        <label htmlFor="oauth-client-id" className="block text-sm font-semibold text-gray-700 mb-2">
          Client ID *
        </label>
        <Input
          id="oauth-client-id"
          type="text"
          value={ssoClientId}
          onChange={(e) => {
            setSsoClientId(e.target.value);
            onFieldChange();
          }}
          placeholder="e.g., abc123xyz789"
          disabled={disabled}
        />
        {validationErrors.clientId && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.clientId}</p>
        )}
      </div>

      <div>
        <label htmlFor="oauth-client-secret" className="block text-sm font-semibold text-gray-700 mb-2">
          Client Secret *
        </label>
        <Input
          id="oauth-client-secret"
          type="password"
          value={ssoClientSecret}
          onChange={(e) => {
            setSsoClientSecret(e.target.value);
            onFieldChange();
          }}
          placeholder="Enter client secret"
          disabled={disabled}
        />
        <p className="text-xs text-gray-500 mt-1">
          Keep this secret secure. Never share it publicly.
        </p>
        {validationErrors.clientSecret && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.clientSecret}</p>
        )}
      </div>

      <div>
        <label htmlFor="oauth-auth-url" className="block text-sm font-semibold text-gray-700 mb-2">
          Authorization URL *
        </label>
        <Input
          id="oauth-auth-url"
          type="url"
          value={ssoAuthUrl}
          onChange={(e) => {
            setSsoAuthUrl(e.target.value);
            onFieldChange();
          }}
          placeholder="https://login.provider.com/oauth/authorize"
          disabled={disabled}
        />
        {validationErrors.authUrl && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.authUrl}</p>
        )}
      </div>

      <div>
        <label htmlFor="oauth-token-url" className="block text-sm font-semibold text-gray-700 mb-2">
          Token URL *
        </label>
        <Input
          id="oauth-token-url"
          type="url"
          value={ssoTokenUrl}
          onChange={(e) => {
            setSsoTokenUrl(e.target.value);
            onFieldChange();
          }}
          placeholder="https://login.provider.com/oauth/token"
          disabled={disabled}
        />
        {validationErrors.tokenUrl && (
          <p className="text-xs text-red-600 mt-1">{validationErrors.tokenUrl}</p>
        )}
      </div>

      <div>
        <label htmlFor="oauth-user-info-url" className="block text-sm font-semibold text-gray-700 mb-2">
          User Info URL
        </label>
        <Input
          id="oauth-user-info-url"
          type="url"
          value={ssoUserInfoUrl}
          onChange={(e) => {
            setSsoUserInfoUrl(e.target.value);
            onFieldChange();
          }}
          placeholder="https://login.provider.com/oauth/userinfo"
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor="oauth-scope" className="block text-sm font-semibold text-gray-700 mb-2">
          Scope
        </label>
        <Input
          id="oauth-scope"
          type="text"
          value={ssoScope}
          onChange={(e) => {
            setSsoScope(e.target.value);
            onFieldChange();
          }}
          placeholder="openid profile email"
          disabled={disabled}
        />
        <p className="text-xs text-gray-500 mt-1">
          Space-separated list of OAuth scopes
        </p>
      </div>

      <div>
        <label htmlFor="oauth-redirect-uri" className="block text-sm font-semibold text-gray-700 mb-2">
          Redirect URI (Callback URL) *
        </label>
        <div className="flex gap-2">
          <Input
            id="oauth-redirect-uri"
            type="url"
            value={ssoRedirectUri}
            readOnly
            className="bg-gray-50"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyRedirectUri}
          >
            Copy
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Add this URL to your provider's allowed redirect URIs
        </p>
      </div>
    </div>
  );
}
