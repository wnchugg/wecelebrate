import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Shield, AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { OAuthFields } from './OAuthFields';
import { SAMLFields } from './SAMLFields';
import { ConfiguredStateSummary } from './ConfiguredStateSummary';

interface SSOConfigCardProps {
  // State
  ssoProvider: string;
  ssoConfigured: boolean;
  ssoEditMode: boolean;
  ssoClientId: string;
  ssoClientSecret: string;
  ssoAuthUrl: string;
  ssoTokenUrl: string;
  ssoUserInfoUrl: string;
  ssoScope: string;
  ssoIdpEntryPoint: string;
  ssoEntityId: string;
  ssoCertificate: string;
  ssoAutoProvision: boolean;
  allowAdminBypass: boolean;
  bypassRequires2FA: boolean;
  bypassAllowedIPs: string;
  validationErrors: Record<string, string>;
  configMode: 'live' | 'draft';
  currentSiteDomain: string;
  siteUrl: string;
  
  // Setters
  setSsoProvider: (value: string) => void;
  setSsoClientId: (value: string) => void;
  setSsoClientSecret: (value: string) => void;
  setSsoAuthUrl: (value: string) => void;
  setSsoTokenUrl: (value: string) => void;
  setSsoUserInfoUrl: (value: string) => void;
  setSsoScope: (value: string) => void;
  setSsoIdpEntryPoint: (value: string) => void;
  setSsoEntityId: (value: string) => void;
  setSsoCertificate: (value: string) => void;
  setSsoAutoProvision: (value: boolean) => void;
  setAllowAdminBypass: (value: boolean) => void;
  setBypassRequires2FA: (value: boolean) => void;
  setBypassAllowedIPs: (value: string) => void;
  setHasChanges: (value: boolean) => void;
  
  // Handlers
  handleProviderChange: (provider: string) => void;
  handleSaveConfiguration: () => void;
  handleEditConfiguration: () => void;
  handleCancelEdit: () => void;
  handleDisableSSO: () => void;
  
  // Helper functions
  getUIState: (provider: string | null, configured: boolean, editMode: boolean) => 'unconfigured' | 'initial' | 'configured' | 'edit';
  getProviderCategory: (provider: string | null) => 'oauth' | 'saml' | null;
  getProviderDisplayName: (provider: string | null) => string;
  getPublicSiteUrlBySlug: (slug: string) => string;
}

export function SSOConfigCard(props: SSOConfigCardProps) {
  const {
    ssoProvider,
    ssoConfigured,
    ssoEditMode,
    ssoClientId,
    ssoClientSecret,
    ssoAuthUrl,
    ssoTokenUrl,
    ssoUserInfoUrl,
    ssoScope,
    ssoIdpEntryPoint,
    ssoEntityId,
    ssoCertificate,
    ssoAutoProvision,
    allowAdminBypass,
    bypassRequires2FA,
    bypassAllowedIPs,
    validationErrors,
    configMode,
    currentSiteDomain,
    siteUrl,
    setSsoClientId,
    setSsoClientSecret,
    setSsoAuthUrl,
    setSsoTokenUrl,
    setSsoUserInfoUrl,
    setSsoScope,
    setSsoIdpEntryPoint,
    setSsoEntityId,
    setSsoCertificate,
    setSsoAutoProvision,
    setAllowAdminBypass,
    setBypassRequires2FA,
    setBypassAllowedIPs,
    setHasChanges,
    handleProviderChange,
    handleSaveConfiguration,
    handleEditConfiguration,
    handleCancelEdit,
    handleDisableSSO,
    getUIState,
    getProviderCategory,
    getProviderDisplayName,
    getPublicSiteUrlBySlug
  } = props;

  const uiState = getUIState(ssoProvider, ssoConfigured, ssoEditMode);
  const providerCategory = getProviderCategory(ssoProvider);
  const isFormValid = providerCategory === 'oauth'
    ? ssoClientId && ssoClientSecret && ssoAuthUrl && ssoTokenUrl && Object.keys(validationErrors).length === 0
    : ssoIdpEntryPoint && ssoEntityId && ssoCertificate && Object.keys(validationErrors).length === 0;

  return (
    <Card className="border-2 border-[#D91C81]">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#D91C81]" />
          SSO Configuration
        </CardTitle>
        <CardDescription>Configure Single Sign-On authentication settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Unconfigured State - Show only provider selection */}
        {uiState === 'unconfigured' && (
          <div>
            <label htmlFor="sso-provider-unconfigured" className="block text-sm font-semibold text-gray-700 mb-2">
              SSO Provider *
            </label>
            <select
              id="sso-provider-unconfigured"
              value={ssoProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              disabled={configMode === 'live'}
            >
              <option value="">Select a provider...</option>
              <option value="azure">Microsoft Azure AD / Entra ID</option>
              <option value="okta">Okta</option>
              <option value="google">Google Workspace</option>
              <option value="saml">Generic SAML 2.0</option>
              <option value="oauth2">Generic OAuth 2.0</option>
              <option value="openid">OpenID Connect</option>
              <option value="custom">Custom Provider</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select your organization's identity provider
            </p>
          </div>
        )}

        {/* Configured State - Show summary with Edit/Disable buttons */}
        {uiState === 'configured' && (
          <ConfiguredStateSummary
            providerName={getProviderDisplayName(ssoProvider)}
            providerCategory={providerCategory}
            clientId={ssoClientId}
            entityId={ssoEntityId}
            redirectUri={`https://wecelebrate.netlify.app/site/${currentSiteDomain}/auth/callback`}
            acsUrl={`https://wecelebrate.netlify.app/site/${currentSiteDomain}/auth/saml/callback`}
            autoProvision={ssoAutoProvision}
            adminBypassEnabled={allowAdminBypass}
            onEdit={handleEditConfiguration}
            onDisable={handleDisableSSO}
          />
        )}

        {/* Initial Configuration or Edit Mode - Show full form */}
        {(uiState === 'initial' || uiState === 'edit') && (
          <div className="space-y-6">
            {/* Info Banner for Edit Mode */}
            {uiState === 'edit' && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-900">
                  You are editing your SSO configuration. Changes will not take effect until you save.
                </p>
              </div>
            )}

            {/* Provider Selection */}
            <div>
              {uiState === 'edit' ? (
                <>
                  <label htmlFor="sso-provider-display" className="block text-sm font-semibold text-gray-700 mb-2">
                    SSO Provider *
                  </label>
                  <Input
                    id="sso-provider-display"
                    value={getProviderDisplayName(ssoProvider)}
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    To change providers, disable SSO and configure a new provider
                  </p>
                </>
              ) : (
                <>
                  <label htmlFor="sso-provider-select" className="block text-sm font-semibold text-gray-700 mb-2">
                    SSO Provider *
                  </label>
                  <select
                    id="sso-provider-select"
                    value={ssoProvider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    disabled={configMode === 'live'}
                  >
                    <option value="">Select a provider...</option>
                    <option value="azure">Microsoft Azure AD / Entra ID</option>
                    <option value="okta">Okta</option>
                    <option value="google">Google Workspace</option>
                    <option value="saml">Generic SAML 2.0</option>
                    <option value="oauth2">Generic OAuth 2.0</option>
                    <option value="openid">OpenID Connect</option>
                    <option value="custom">Custom Provider</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select your organization's identity provider
                  </p>
                </>
              )}
            </div>

            {/* Provider-Specific Fields */}
            {providerCategory === 'oauth' && (
              <OAuthFields
                ssoClientId={ssoClientId}
                setSsoClientId={setSsoClientId}
                ssoClientSecret={ssoClientSecret}
                setSsoClientSecret={setSsoClientSecret}
                ssoAuthUrl={ssoAuthUrl}
                setSsoAuthUrl={setSsoAuthUrl}
                ssoTokenUrl={ssoTokenUrl}
                setSsoTokenUrl={setSsoTokenUrl}
                ssoUserInfoUrl={ssoUserInfoUrl}
                setSsoUserInfoUrl={setSsoUserInfoUrl}
                ssoScope={ssoScope}
                setSsoScope={setSsoScope}
                ssoRedirectUri={`https://wecelebrate.netlify.app/site/${currentSiteDomain}/auth/callback`}
                validationErrors={validationErrors}
                disabled={configMode === 'live'}
                onFieldChange={() => setHasChanges(true)}
              />
            )}

            {providerCategory === 'saml' && (
              <SAMLFields
                ssoIdpEntryPoint={ssoIdpEntryPoint}
                setSsoIdpEntryPoint={setSsoIdpEntryPoint}
                ssoEntityId={ssoEntityId}
                setSsoEntityId={setSsoEntityId}
                ssoCertificate={ssoCertificate}
                setSsoCertificate={setSsoCertificate}
                ssoAcsUrl={`https://wecelebrate.netlify.app/site/${currentSiteDomain}/auth/saml/callback`}
                validationErrors={validationErrors}
                disabled={configMode === 'live'}
                onFieldChange={() => setHasChanges(true)}
              />
            )}

            {/* Attribute Mapping - Always shown */}
            {providerCategory && (
              <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-gray-900">User Attribute Mapping</h4>
                <p className="text-sm text-gray-600">
                  Map attributes from your SSO provider to user fields
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sso-attr-email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Attribute
                    </label>
                    <Input
                      id="sso-attr-email"
                      type="text"
                      defaultValue="email"
                      placeholder="email"
                      onChange={() => setHasChanges(true)}
                      disabled={configMode === 'live'}
                    />
                  </div>

                  <div>
                    <label htmlFor="sso-attr-first-name" className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name Attribute
                    </label>
                    <Input
                      id="sso-attr-first-name"
                      type="text"
                      defaultValue="firstName"
                      placeholder="firstName"
                      onChange={() => setHasChanges(true)}
                      disabled={configMode === 'live'}
                    />
                  </div>

                  <div>
                    <label htmlFor="sso-attr-last-name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name Attribute
                    </label>
                    <Input
                      id="sso-attr-last-name"
                      type="text"
                      defaultValue="lastName"
                      placeholder="lastName"
                      onChange={() => setHasChanges(true)}
                      disabled={configMode === 'live'}
                    />
                  </div>

                  <div>
                    <label htmlFor="sso-attr-employee-id" className="block text-sm font-semibold text-gray-700 mb-2">
                      Employee ID Attribute
                    </label>
                    <Input
                      id="sso-attr-employee-id"
                      type="text"
                      defaultValue="employeeId"
                      placeholder="employeeId"
                      onChange={() => setHasChanges(true)}
                      disabled={configMode === 'live'}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Settings - Always shown */}
            {providerCategory && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Auto-Provision Users</p>
                    <p className="text-sm text-gray-600">Automatically create accounts for new users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <span className="sr-only">Auto-Provision Users</span>
                    <input
                      type="checkbox"
                      checked={ssoAutoProvision}
                      onChange={(e) => {
                        setSsoAutoProvision(e.target.checked);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Require Multi-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Enforce MFA at the provider level</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <span className="sr-only">Require Multi-Factor Authentication</span>
                    <input
                      type="checkbox"
                      onChange={() => setHasChanges(true)}
                      disabled={configMode === 'live'}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                  </label>
                </div>

                <div>
                  <label htmlFor="sso-session-timeout" className="block text-sm font-semibold text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <Input
                    id="sso-session-timeout"
                    type="number"
                    defaultValue="60"
                    min="5"
                    max="480"
                    onChange={() => setHasChanges(true)}
                    disabled={configMode === 'live'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How long users stay logged in (5-480 minutes)
                  </p>
                </div>
              </div>
            )}

            {/* Admin Bypass Section - Always shown */}
            {providerCategory && (
              <div className="border-t pt-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  Admin Bypass Access
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Allow site managers to login with username/password when SSO is required
                </p>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">Allow Site Manager Bypass</p>
                    <p className="text-sm text-gray-600">
                      Enable username/password login for site managers
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <span className="sr-only">Allow Site Manager Bypass</span>
                    <input
                      type="checkbox"
                      checked={allowAdminBypass}
                      onChange={(e) => {
                        setAllowAdminBypass(e.target.checked);
                        setHasChanges(true);
                      }}
                      disabled={configMode === 'live'}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                  </label>
                </div>
                
                {allowAdminBypass && (
                  <div className="space-y-4 pl-4 border-l-2 border-amber-200">
                    <div>
                      <label htmlFor="sso-bypass-url" className="block text-sm font-semibold text-gray-700 mb-2">
                        Bypass Login URL
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="sso-bypass-url"
                          value={`${getPublicSiteUrlBySlug(siteUrl)}/admin-login`}
                          readOnly
                          className="bg-gray-50 font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            void navigator.clipboard.writeText(`${getPublicSiteUrlBySlug(siteUrl)}/admin-login`);
                            toast.success('Bypass URL copied to clipboard');
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Share this URL with site managers who need bypass access
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div>
                        <p className="font-semibold text-gray-900">Require 2FA for Bypass</p>
                        <p className="text-sm text-gray-600">Additional security for admin access</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <span className="sr-only">Require 2FA for Bypass</span>
                        <input
                          type="checkbox"
                          checked={bypassRequires2FA}
                          onChange={(e) => {
                            setBypassRequires2FA(e.target.checked);
                            setHasChanges(true);
                          }}
                          disabled={configMode === 'live'}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                      </label>
                    </div>
                    
                    <div>
                      <label htmlFor="sso-allowed-ips" className="block text-sm font-semibold text-gray-700 mb-2">
                        Allowed IP Addresses (Optional)
                      </label>
                      <textarea
                        id="sso-allowed-ips"
                        rows={4}
                        placeholder="192.168.1.1&#10;10.0.0.1&#10;Leave empty to allow all IPs"
                        value={bypassAllowedIPs}
                        onChange={(e) => {
                          setBypassAllowedIPs(e.target.value);
                          setHasChanges(true);
                        }}
                        disabled={configMode === 'live'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        One IP address per line. Leave empty to allow all IPs.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Test Connection - Always shown */}
            {providerCategory && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#D91C81] to-purple-600 text-white rounded-lg font-semibold hover:from-[#B71569] hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={configMode === 'live'}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Test SSO Connection
                </button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Verify your SSO configuration is working correctly
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {providerCategory && (
              <div className="flex gap-3 pt-4 border-t">
                {uiState === 'edit' ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex-1"
                      disabled={configMode === 'live'}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveConfiguration}
                      disabled={!isFormValid || configMode === 'live'}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleSaveConfiguration}
                    disabled={!isFormValid || configMode === 'live'}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
