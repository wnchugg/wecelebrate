import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { 
  Save, Settings, Globe, Mail, Building2, Package, CreditCard, 
  Link2, Users, MapPin, ArrowLeft, Loader2, ExternalLink, Server
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { PhoneInput } from '../../components/ui/phone-input';
import { AddressInput, AddressData } from '../../components/ui/address-input';
import { SFTPConfiguration } from '../../components/admin/SFTPConfiguration';
import { apiRequest } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { validateClientConfiguration } from '../../utils/clientConfigValidation';
import { useLanguage } from '../../context/LanguageContext';

interface Client {
  id: string;
  name: string;
  description?: string;
  contactEmail: string;
  status: 'active' | 'inactive';
  
  // Client Settings
  clientCode?: string;
  clientRegion?: string;
  clientSourceCode?: string;
  clientContactName?: string;
  clientContactPhone?: string;
  clientTaxId?: string;
  
  // Client Address
  clientAddressLine1?: string;
  clientAddressLine2?: string;
  clientAddressLine3?: string;
  clientCity?: string;
  clientPostalCode?: string;
  clientCountryState?: string;
  clientCountry?: string;
  
  // Account Settings
  clientAccountManager?: string;
  clientAccountManagerEmail?: string;
  clientImplementationManager?: string;
  clientImplementationManagerEmail?: string;
  technologyOwner?: string;
  technologyOwnerEmail?: string;
  
  // Client App Settings
  clientUrl?: string;
  clientAllowSessionTimeoutExtend?: boolean;
  clientAuthenticationMethod?: string;
  clientCustomUrl?: string;
  clientHasEmployeeData?: boolean;
  
  // Client Billing Settings
  clientInvoiceType?: string;
  clientInvoiceTemplateType?: string;
  clientPoType?: string;
  clientPoNumber?: string;
  
  // Client Integrations
  clientErpSystem?: string;
  clientSso?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

interface ClientConfigurationProps {
  clientIdProp?: string;
  embedded?: boolean;
  activeTab?: string;
  onSaveSuccess?: () => void;
  sites?: Array<{ id: string; name: string; clientId: string; status: string; isActive: boolean }>;
}

export function ClientConfiguration({ 
  clientIdProp, 
  embedded = false, 
  activeTab,
  onSaveSuccess,
  sites = []
}: ClientConfigurationProps = {}) {
  const { clientId: routeClientId } = useParams<{ clientId: string }>();
  const clientId = clientIdProp || routeClientId;
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  
  // Client Basic Info
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  
  // Client Settings
  const [clientCode, setClientCode] = useState('');
  const [clientRegion, setClientRegion] = useState('');
  const [clientSourceCode, setClientSourceCode] = useState('');
  const [clientContactName, setClientContactName] = useState('');
  const [clientContactPhone, setClientContactPhone] = useState('');
  const [clientTaxId, setClientTaxId] = useState('');
  
  // Client Address (using AddressData format)
  const [clientAddress, setClientAddress] = useState<AddressData>({
    line1: '',
    line2: '',
    line3: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });
  
  // Account Settings
  const [clientAccountManager, setClientAccountManager] = useState('');
  const [clientAccountManagerEmail, setClientAccountManagerEmail] = useState('');
  const [clientImplementationManager, setClientImplementationManager] = useState('');
  const [clientImplementationManagerEmail, setClientImplementationManagerEmail] = useState('');
  const [technologyOwner, setTechnologyOwner] = useState('');
  const [technologyOwnerEmail, setTechnologyOwnerEmail] = useState('');
  
  // Client App Settings
  const [clientUrl, setClientUrl] = useState('');
  const [clientAllowSessionTimeoutExtend, setClientAllowSessionTimeoutExtend] = useState(false);
  const [clientAuthenticationMethod, setClientAuthenticationMethod] = useState('');
  const [clientCustomUrl, setClientCustomUrl] = useState('');
  const [clientHasEmployeeData, setClientHasEmployeeData] = useState(false);
  
  // Client Billing Settings
  const [clientInvoiceType, setClientInvoiceType] = useState('');
  const [clientInvoiceTemplateType, setClientInvoiceTemplateType] = useState('');
  const [clientPoType, setClientPoType] = useState('');
  const [clientPoNumber, setClientPoNumber] = useState('');
  
  // Client Integrations
  const [clientErpSystem, setClientErpSystem] = useState('');
  const [clientSso, setClientSso] = useState('');

  // Load client data
  useEffect(() => {
    if (clientId) {
      void loadClient();
    }
  }, [clientId]);

  const loadClient = async () => {
    setIsLoading(true);
    try {
      let actualClientId = clientId;
      
      // Check if clientId is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUUID = uuidRegex.test(clientId || '');
      
      // If it's not a UUID, treat it as a slug and resolve it to an ID
      if (!isUUID) {
        try {
          // Fetch all clients to find the one with matching slug
          const allClientsRes = await apiRequest<{ success: boolean; data: Client[] }>('/v2/clients');
          
          // Try to match by clientCode (slug)
          const matchingClient = allClientsRes.data.find(c => 
            c.clientCode?.toLowerCase() === clientId?.toLowerCase()
          );
          
          if (matchingClient) {
            actualClientId = matchingClient.id;
          } else {
            // No match found - show error
            toast.error(`Client not found: "${clientId}". Please check the URL or client code.`);
            setIsLoading(false);
            return;
          }
        } catch (slugError) {
          console.error('Failed to resolve client slug:', slugError);
          toast.error('Failed to load client. Please try again.');
          setIsLoading(false);
          return;
        }
      }
      
      const response = await apiRequest<{ success: boolean; data: Client }>(`/v2/clients/${actualClientId}`);
      const client = response.data;
      
      // Basic Info
      setClientName(client.name || '');
      setDescription(client.description || '');
      setContactEmail(client.contactEmail || '');
      setStatus(client.status || 'active');
      
      // Client Settings
      setClientCode(client.clientCode || '');
      setClientRegion(client.clientRegion || '');
      setClientSourceCode(client.clientSourceCode || '');
      setClientContactName(client.clientContactName || '');
      setClientContactPhone(client.clientContactPhone || '');
      setClientTaxId(client.clientTaxId || '');
      
      // Client Address
      setClientAddress({
        line1: client.clientAddressLine1 || '',
        line2: client.clientAddressLine2 || '',
        line3: client.clientAddressLine3 || '',
        city: client.clientCity || '',
        state: client.clientCountryState || '',
        postalCode: client.clientPostalCode || '',
        country: client.clientCountry || 'United States',
      });
      
      // Account Settings
      setClientAccountManager(client.clientAccountManager || '');
      setClientAccountManagerEmail(client.clientAccountManagerEmail || '');
      setClientImplementationManager(client.clientImplementationManager || '');
      setClientImplementationManagerEmail(client.clientImplementationManagerEmail || '');
      setTechnologyOwner(client.technologyOwner || '');
      setTechnologyOwnerEmail(client.technologyOwnerEmail || '');
      
      // Client App Settings
      setClientUrl(client.clientUrl || '');
      setClientAllowSessionTimeoutExtend(client.clientAllowSessionTimeoutExtend ?? false);
      setClientAuthenticationMethod(client.clientAuthenticationMethod || '');
      setClientCustomUrl(client.clientCustomUrl || '');
      setClientHasEmployeeData(client.clientHasEmployeeData ?? false);
      
      // Client Billing Settings
      setClientInvoiceType(client.clientInvoiceType || '');
      setClientInvoiceTemplateType(client.clientInvoiceTemplateType || '');
      setClientPoType(client.clientPoType || '');
      setClientPoNumber(client.clientPoNumber || '');
      
      // Client Integrations
      setClientErpSystem(client.clientErpSystem || '');
      setClientSso(client.clientSso || '');
      
    } catch (error: any) {
      showErrorToast(error, { operation: 'load client configuration' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!clientName.trim()) {
      toast.error('Client name is required');
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest(`/v2/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: clientName,
          description,
          contactEmail,
          status,
          
          // Client Settings
          clientCode,
          clientRegion,
          clientSourceCode,
          clientContactName,
          clientContactPhone,
          clientTaxId,
          
          // Client Address (map from AddressData to API format)
          clientAddressLine1: clientAddress.line1,
          clientAddressLine2: clientAddress.line2,
          clientAddressLine3: clientAddress.line3,
          clientCity: clientAddress.city,
          clientPostalCode: clientAddress.postalCode,
          clientCountryState: clientAddress.state,
          clientCountry: clientAddress.country,
          
          // Account Settings
          clientAccountManager,
          clientAccountManagerEmail,
          clientImplementationManager,
          clientImplementationManagerEmail,
          technologyOwner,
          technologyOwnerEmail,
          
          // Client App Settings
          clientUrl,
          clientAllowSessionTimeoutExtend,
          clientAuthenticationMethod,
          clientCustomUrl,
          clientHasEmployeeData,
          
          // Client Billing Settings
          clientInvoiceType,
          clientInvoiceTemplateType,
          clientPoType,
          clientPoNumber,
          
          // Client Integrations
          clientErpSystem,
          clientSso,
        })
      });
      
      showSuccessToast('Client configuration saved successfully');
      setHasChanges(false);
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error: any) {
      showErrorToast(error, { operation: 'save client configuration' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (!clientName.trim()) {
      toast.error('Client name is required');
      return;
    }

    setIsAutoSaving(true);
    try {
      await apiRequest(`/v2/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: clientName,
          description,
          contactEmail,
          status,
          
          // Client Settings
          clientCode,
          clientRegion,
          clientSourceCode,
          clientContactName,
          clientContactPhone,
          clientTaxId,
          
          // Client Address (map from AddressData to API format)
          clientAddressLine1: clientAddress.line1,
          clientAddressLine2: clientAddress.line2,
          clientAddressLine3: clientAddress.line3,
          clientCity: clientAddress.city,
          clientPostalCode: clientAddress.postalCode,
          clientCountryState: clientAddress.state,
          clientCountry: clientAddress.country,
          
          // Account Settings
          clientAccountManager,
          clientAccountManagerEmail,
          clientImplementationManager,
          clientImplementationManagerEmail,
          technologyOwner,
          technologyOwnerEmail,
          
          // Client App Settings
          clientUrl,
          clientAllowSessionTimeoutExtend,
          clientAuthenticationMethod,
          clientCustomUrl,
          clientHasEmployeeData,
          
          // Client Billing Settings
          clientInvoiceType,
          clientInvoiceTemplateType,
          clientPoType,
          clientPoNumber,
          
          // Client Integrations
          clientErpSystem,
          clientSso,
        })
      });
      
      showSuccessToast('Client configuration saved successfully');
      setHasChanges(false);
      setLastAutoSave(new Date());
    } catch (error: any) {
      showErrorToast(error, { operation: 'save client configuration' });
    } finally {
      setIsAutoSaving(false);
    }
  };

  const validateAndSave = () => {
    const validationErrors = validateClientConfiguration({
      clientName,
      description,
      contactEmail,
      status,
      clientCode,
      clientRegion,
      clientSourceCode,
      clientContactName,
      clientContactPhone,
      clientTaxId,
      clientAddressLine1: clientAddress.line1,
      clientAddressLine2: clientAddress.line2,
      clientAddressLine3: clientAddress.line3,
      clientCity: clientAddress.city,
      clientPostalCode: clientAddress.postalCode,
      clientCountryState: clientAddress.state,
      clientCountry: clientAddress.country,
      clientAccountManager,
      clientAccountManagerEmail,
      clientImplementationManager,
      clientImplementationManagerEmail,
      technologyOwner,
      technologyOwnerEmail,
      clientUrl,
      clientAllowSessionTimeoutExtend,
      clientAuthenticationMethod,
      clientCustomUrl,
      clientHasEmployeeData,
      clientInvoiceType,
      clientInvoiceTemplateType,
      clientPoType,
      clientPoNumber,
      clientErpSystem,
      clientSso,
    });

    setErrors(validationErrors.fieldErrors);

    if (Object.keys(validationErrors.fieldErrors).length === 0) {
      void handleSave();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#D91C81] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading client configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      {!embedded && (
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => void navigate(`/admin/clients/${clientCode || clientId}`)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Configuration</h1>
              <p className="text-gray-600 mt-1">{clientName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="outline" className="border-amber-500 text-amber-700">
                Unsaved Changes
              </Badge>
            )}
            <Button
              onClick={validateAndSave}
              disabled={isSaving || !hasChanges}
              className="bg-[#D91C81] hover:bg-[#B01669] text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Configuration Tabs */}
      <Tabs defaultValue={embedded ? activeTab : "general"} value={embedded ? activeTab : undefined} className="space-y-6">
        {!embedded && (
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="general">
              <Building2 className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="address">
              <MapPin className="w-4 h-4 mr-2" />
              Address
            </TabsTrigger>
            <TabsTrigger value="account">
              <Users className="w-4 h-4 mr-2" />
              Account Team
            </TabsTrigger>
            <TabsTrigger value="app-settings">
              <Settings className="w-4 h-4 mr-2" />
              App Settings
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Link2 className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="sftp">
              <Server className="w-4 h-4 mr-2" />
              SFTP
            </TabsTrigger>
          </TabsList>
        )}

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Client General Information</h3>
                  <p className="text-sm text-gray-700">
                    Configure basic client details, contact information, and regional settings
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    Unsaved Changes
                  </Badge>
                )}
                <Button
                  onClick={validateAndSave}
                  disabled={isSaving || !hasChanges}
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#D91C81]" />
                Basic Information
              </CardTitle>
              <CardDescription>Core client details and identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <Input
                    value={clientName}
                    onChange={(e) => {
                      setClientName(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="Acme Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL Slug <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={clientCode}
                    onChange={(e) => {
                      setClientCode(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="techcorp"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used in URLs (e.g., /clients/techcorp). Use lowercase letters, numbers, and hyphens only.
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="Brief description of the client..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Client Region
                  </label>
                  <select
                    value={clientRegion}
                    onChange={(e) => {
                      setClientRegion(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  >
                    <option value="">Select Region</option>
                    <option value="US/CA">US/CA (North America)</option>
                    <option value="EMEA">EMEA (Europe, Middle East, Africa)</option>
                    <option value="APAC">APAC (Asia Pacific)</option>
                    <option value="LATAM">LATAM (Latin America)</option>
                    <option value="Global">Global</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Primary operating region</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Source Code <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={clientSourceCode}
                    onChange={(e) => {
                      setClientSourceCode(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="SRC-ACME-001"
                  />
                  <p className="text-xs text-gray-500 mt-1">Internal tracking code</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tax ID <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={clientTaxId}
                    onChange={(e) => {
                      setClientTaxId(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="12-3456789"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tax identification number</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#00B4CC]" />
                Contact Information
              </CardTitle>
              <CardDescription>Primary contact details for this client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Name
                  </label>
                  <Input
                    value={clientContactName}
                    onChange={(e) => {
                      setClientContactName(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => {
                      setContactEmail(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="john.smith@acme.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <PhoneInput
                    value={clientContactPhone}
                    onChange={(value) => {
                      setClientContactPhone(value);
                      setHasChanges(true);
                    }}
                    defaultCountry="US"
                    placeholder={t('form.enterPhone')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Client Status
              </CardTitle>
              <CardDescription>Current operational status of this client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as 'active' | 'inactive');
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">When inactive, all sites under this client will be inaccessible</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address" className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Client Address Information</h3>
                  <p className="text-sm text-gray-700">
                    Complete address details for shipping, billing, and correspondence
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    Unsaved Changes
                  </Badge>
                )}
                <Button
                  onClick={validateAndSave}
                  disabled={isSaving || !hasChanges}
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00B4CC]" />
                Physical Address
              </CardTitle>
              <CardDescription>Main business address for this client</CardDescription>
            </CardHeader>
            <CardContent>
              <AddressInput
                value={clientAddress}
                onChange={(address) => {
                  setClientAddress(address);
                  setHasChanges(true);
                }}
                defaultCountry="US"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Team Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Account Team</h3>
                  <p className="text-sm text-gray-700">
                    Key contacts managing this client relationship
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    Unsaved Changes
                  </Badge>
                )}
                <Button
                  onClick={validateAndSave}
                  disabled={isSaving || !hasChanges}
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D91C81]" />
                Account Manager
              </CardTitle>
              <CardDescription>Primary account manager for this client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Manager Name
                  </label>
                  <Input
                    value={clientAccountManager}
                    onChange={(e) => {
                      setClientAccountManager(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="Sarah Williams"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Manager Email
                  </label>
                  <Input
                    type="email"
                    value={clientAccountManagerEmail}
                    onChange={(e) => {
                      setClientAccountManagerEmail(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="sarah@halo.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00B4CC]" />
                Implementation Manager
              </CardTitle>
              <CardDescription>Project manager for client implementation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Implementation Manager Name
                  </label>
                  <Input
                    value={clientImplementationManager}
                    onChange={(e) => {
                      setClientImplementationManager(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="Michael Chen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Implementation Manager Email
                  </label>
                  <Input
                    type="email"
                    value={clientImplementationManagerEmail}
                    onChange={(e) => {
                      setClientImplementationManagerEmail(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="michael@halo.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Technology Owner
              </CardTitle>
              <CardDescription>Technical contact for integrations and support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Technology Owner Name
                  </label>
                  <Input
                    value={technologyOwner}
                    onChange={(e) => {
                      setTechnologyOwner(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="Alex Johnson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Technology Owner Email
                  </label>
                  <Input
                    type="email"
                    value={technologyOwnerEmail}
                    onChange={(e) => {
                      setTechnologyOwnerEmail(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="alex@halo.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Settings Tab */}
        <TabsContent value="app-settings" className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Application Settings</h3>
                  <p className="text-sm text-gray-700">
                    Configure URLs, authentication, and application behavior
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    Unsaved Changes
                  </Badge>
                )}
                <Button
                  onClick={validateAndSave}
                  disabled={isSaving || !hasChanges}
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00B4CC]" />
                URLs & Domains
              </CardTitle>
              <CardDescription>Client website and custom domain configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Client URL <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <Input
                  value={clientUrl}
                  onChange={(e) => {
                    setClientUrl(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="https://www.acme.com"
                />
                <p className="text-xs text-gray-500 mt-1">Client's main website</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom Domain URL <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <Input
                  value={clientCustomUrl}
                  onChange={(e) => {
                    setClientCustomUrl(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="https://gifts.acme.com"
                />
                <p className="text-xs text-gray-500 mt-1">Custom domain for gift portal</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#D91C81]" />
                Authentication & Security
              </CardTitle>
              <CardDescription>Login and session settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Authentication Method
                </label>
                <select
                  value={clientAuthenticationMethod}
                  onChange={(e) => {
                    setClientAuthenticationMethod(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="">Select Method</option>
                  <option value="Email">Email</option>
                  <option value="SSO">Single Sign-On (SSO)</option>
                  <option value="EmployeeId">Employee ID</option>
                  <option value="MagicLink">Magic Link</option>
                  <option value="SerialCard">Serial Card</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">How users will authenticate</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">4-Hour Session Timeout</p>
                  <p className="text-sm text-gray-600">Extend user session timeout to 4 hours</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={clientAllowSessionTimeoutExtend}
                    onChange={(e) => {
                      setClientAllowSessionTimeoutExtend(e.target.checked);
                      setHasChanges(true);
                    }}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Data Management
              </CardTitle>
              <CardDescription>Employee data and import settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Has Employee Data</p>
                  <p className="text-sm text-gray-600">Client has imported employee information</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={clientHasEmployeeData}
                    onChange={(e) => {
                      setClientHasEmployeeData(e.target.checked);
                      setHasChanges(true);
                    }}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Billing Configuration</h3>
                  <p className="text-sm text-gray-700">
                    Invoice settings and purchase order information
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    Unsaved Changes
                  </Badge>
                )}
                <Button
                  onClick={validateAndSave}
                  disabled={isSaving || !hasChanges}
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#D91C81]" />
                Invoice Settings
              </CardTitle>
              <CardDescription>Configure how this client is billed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Invoice Type
                  </label>
                  <select
                    value={clientInvoiceType}
                    onChange={(e) => {
                      setClientInvoiceType(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  >
                    <option value="">Select Type</option>
                    <option value="Client">Client</option>
                    <option value="Site">Site</option>
                    <option value="Site and Award">Site and Award</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Manager">Manager</option>
                    <option value="Purchase Order">Purchase Order</option>
                    <option value="Registered Invoice">Registered Invoice</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">How invoices are generated</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Invoice Template Type
                  </label>
                  <select
                    value={clientInvoiceTemplateType}
                    onChange={(e) => {
                      setClientInvoiceTemplateType(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  >
                    <option value="">Select Template</option>
                    <option value="US">US</option>
                    <option value="UK">UK</option>
                    <option value="German">German</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Regional invoice format</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#00B4CC]" />
                Purchase Order
              </CardTitle>
              <CardDescription>Purchase order details for billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PO Type <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={clientPoType}
                    onChange={(e) => {
                      setClientPoType(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="Standard, Blanket, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PO Number <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={clientPoNumber}
                    onChange={(e) => {
                      setClientPoNumber(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="PO-2026-12345"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Link2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">System Integrations</h3>
                  <p className="text-sm text-gray-700">
                    Connect with ERP, SSO, and HRIS systems
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <Badge variant="outline" className="border-amber-500 text-amber-700">
                    Unsaved Changes
                  </Badge>
                )}
                <Button
                  onClick={validateAndSave}
                  disabled={isSaving || !hasChanges}
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D91C81]" />
                ERP Integration
              </CardTitle>
              <CardDescription>Enterprise Resource Planning system connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ERP System
                </label>
                <select
                  value={clientErpSystem}
                  onChange={(e) => {
                    setClientErpSystem(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="">Select ERP System</option>
                  <option value="NXJ">NXJ</option>
                  <option value="Fourgen">Fourgen</option>
                  <option value="Netsuite">Netsuite</option>
                  <option value="GRS">GRS</option>
                  <option value="SAP">SAP</option>
                  <option value="Oracle">Oracle</option>
                  <option value="Manual">Manual</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Primary ERP system for product data</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#00B4CC]" />
                Single Sign-On (SSO)
              </CardTitle>
              <CardDescription>SSO configuration for user authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SSO Provider <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <Input
                  value={clientSso}
                  onChange={(e) => {
                    setClientSso(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Azure AD, Okta, OneLogin, etc."
                />
                <p className="text-xs text-gray-500 mt-1">SSO identity provider name</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SFTP Tab */}
        <TabsContent value="sftp" className="space-y-6">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100">
            <div className="flex items-start gap-3">
              <Server className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">SFTP Employee Data Import</h3>
                <p className="text-sm text-gray-700">
                  Configure automated employee data imports from your SFTP server. This setting applies to all sites under this client.
                </p>
              </div>
            </div>
          </div>

          <SFTPConfiguration 
            client={{ id: clientId || '', name: clientName }}
            onConfigUpdated={() => {
              toast.success('SFTP configuration updated');
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Portal Tab - only in embedded mode */}
      {embedded && activeTab === 'portal' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Client Portal</h2>
                  <p className="text-sm text-gray-600">View and manage the dedicated client portal page</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => window.open('/client-portal', '_blank')}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Portal
                  </Button>
                  <Button
                    onClick={() => void navigate('/client-portal')}
                    className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Portal
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  The client portal is a dedicated page where clients can access their specific information, 
                  reports, and resources. Use the editor to customize content, branding, and features.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Sites Tab - only in embedded mode */}
      {embedded && activeTab === 'sites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Sites for {clientName}</h2>
            <Button
              onClick={() => void navigate(`/admin/sites?client=${clientId}`)}
              className="bg-[#D91C81] hover:bg-[#B01669] text-white"
            >
              Manage Sites
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
                <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sites</h3>
                <p className="text-gray-600 mb-6">This client doesn't have any sites yet.</p>
                <Button
                  onClick={() => void navigate(`/admin/sites?client=${clientId}`)}
                  className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                >
                  Add Site
                </Button>
              </div>
            ) : (
              sites.map((site) => (
                <div
                  key={site.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#D91C81] transition-colors cursor-pointer"
                  onClick={() => void navigate(`/admin/sites?site=${site.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{site.name}</h3>
                    <div className={`w-2 h-2 rounded-full ${
                      site.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <p className="text-sm text-gray-600">Status: {site.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}