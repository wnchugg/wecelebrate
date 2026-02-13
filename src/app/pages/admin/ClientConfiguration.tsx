import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { 
  Save, Settings, Globe, Mail, Building2, Package, CreditCard, 
  Link2, Users, MapPin, Check, AlertCircle, ArrowLeft, Loader2, Clock
} from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { apiRequest } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { validateClientConfiguration } from '../../utils/clientConfigValidation';

interface Client {
  id: string;
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  
  // Client Settings
  clientCode?: string;
  clientRegion?: string;
  clientSourceCode?: string;
  contactName?: string;
  taxId?: string;
  
  // Client Address
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  postalCode?: string;
  countryState?: string;
  country?: string;
  
  // Account Settings
  accountManager?: string;
  accountManagerEmail?: string;
  implementationManager?: string;
  implementationManagerEmail?: string;
  technologyOwner?: string;
  technologyOwnerEmail?: string;
  
  // Client App Settings
  clientUrl?: string;
  allowSessionTimeoutExtend?: boolean;
  authenticationMethod?: string;
  customUrl?: string;
  hasEmployeeData?: boolean;
  
  // Client Billing Settings
  invoiceType?: string;
  invoiceTemplateType?: string;
  poType?: string;
  poNumber?: string;
  
  // Client Integrations
  erpSystem?: string;
  sso?: string;
  hrisSystem?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export function ClientConfiguration() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  
  // Client Basic Info
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Client Settings
  const [clientCode, setClientCode] = useState('');
  const [clientRegion, setClientRegion] = useState('');
  const [clientSourceCode, setClientSourceCode] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  
  // Client Address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressLine3, setAddressLine3] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [countryState, setCountryState] = useState('');
  const [country, setCountry] = useState('');
  
  // Account Settings
  const [accountManager, setAccountManager] = useState('');
  const [accountManagerEmail, setAccountManagerEmail] = useState('');
  const [implementationManager, setImplementationManager] = useState('');
  const [implementationManagerEmail, setImplementationManagerEmail] = useState('');
  const [technologyOwner, setTechnologyOwner] = useState('');
  const [technologyOwnerEmail, setTechnologyOwnerEmail] = useState('');
  
  // Client App Settings
  const [clientUrl, setClientUrl] = useState('');
  const [allowSessionTimeoutExtend, setAllowSessionTimeoutExtend] = useState(false);
  const [authenticationMethod, setAuthenticationMethod] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [hasEmployeeData, setHasEmployeeData] = useState(false);
  
  // Client Billing Settings
  const [invoiceType, setInvoiceType] = useState('');
  const [invoiceTemplateType, setInvoiceTemplateType] = useState('');
  const [poType, setPoType] = useState('');
  const [poNumber, setPoNumber] = useState('');
  
  // Client Integrations
  const [erpSystem, setErpSystem] = useState('');
  const [sso, setSso] = useState('');
  const [hrisSystem, setHrisSystem] = useState('');

  // Load client data
  useEffect(() => {
    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  const loadClient = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{ success: boolean; data: Client }>(`/clients/${clientId}`);
      const client = response.data;
      
      // Basic Info
      setClientName(client.name || '');
      setDescription(client.description || '');
      setIsActive(client.isActive ?? true);
      
      // Client Settings
      setClientCode(client.clientCode || '');
      setClientRegion(client.clientRegion || '');
      setClientSourceCode(client.clientSourceCode || '');
      setContactName(client.contactName || '');
      setContactEmail(client.contactEmail || '');
      setContactPhone(client.contactPhone || '');
      setTaxId(client.taxId || '');
      
      // Client Address
      setAddressLine1(client.addressLine1 || '');
      setAddressLine2(client.addressLine2 || '');
      setAddressLine3(client.addressLine3 || '');
      setCity(client.city || '');
      setPostalCode(client.postalCode || '');
      setCountryState(client.countryState || '');
      setCountry(client.country || '');
      
      // Account Settings
      setAccountManager(client.accountManager || '');
      setAccountManagerEmail(client.accountManagerEmail || '');
      setImplementationManager(client.implementationManager || '');
      setImplementationManagerEmail(client.implementationManagerEmail || '');
      setTechnologyOwner(client.technologyOwner || '');
      setTechnologyOwnerEmail(client.technologyOwnerEmail || '');
      
      // Client App Settings
      setClientUrl(client.clientUrl || '');
      setAllowSessionTimeoutExtend(client.allowSessionTimeoutExtend ?? false);
      setAuthenticationMethod(client.authenticationMethod || '');
      setCustomUrl(client.customUrl || '');
      setHasEmployeeData(client.hasEmployeeData ?? false);
      
      // Client Billing Settings
      setInvoiceType(client.invoiceType || '');
      setInvoiceTemplateType(client.invoiceTemplateType || '');
      setPoType(client.poType || '');
      setPoNumber(client.poNumber || '');
      
      // Client Integrations
      setErpSystem(client.erpSystem || '');
      setSso(client.sso || '');
      setHrisSystem(client.hrisSystem || '');
      
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
      await apiRequest(`/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: clientName,
          description,
          isActive,
          
          // Client Settings
          clientCode,
          clientRegion,
          clientSourceCode,
          contactName,
          contactEmail,
          contactPhone,
          taxId,
          
          // Client Address
          addressLine1,
          addressLine2,
          addressLine3,
          city,
          postalCode,
          countryState,
          country,
          
          // Account Settings
          accountManager,
          accountManagerEmail,
          implementationManager,
          implementationManagerEmail,
          technologyOwner,
          technologyOwnerEmail,
          
          // Client App Settings
          clientUrl,
          allowSessionTimeoutExtend,
          authenticationMethod,
          customUrl,
          hasEmployeeData,
          
          // Client Billing Settings
          invoiceType,
          invoiceTemplateType,
          poType,
          poNumber,
          
          // Client Integrations
          erpSystem,
          sso,
          hrisSystem,
        })
      });
      
      showSuccessToast('Client configuration saved successfully');
      setHasChanges(false);
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
      await apiRequest(`/clients/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: clientName,
          description,
          isActive,
          
          // Client Settings
          clientCode,
          clientRegion,
          clientSourceCode,
          contactName,
          contactEmail,
          contactPhone,
          taxId,
          
          // Client Address
          addressLine1,
          addressLine2,
          addressLine3,
          city,
          postalCode,
          countryState,
          country,
          
          // Account Settings
          accountManager,
          accountManagerEmail,
          implementationManager,
          implementationManagerEmail,
          technologyOwner,
          technologyOwnerEmail,
          
          // Client App Settings
          clientUrl,
          allowSessionTimeoutExtend,
          authenticationMethod,
          customUrl,
          hasEmployeeData,
          
          // Client Billing Settings
          invoiceType,
          invoiceTemplateType,
          poType,
          poNumber,
          
          // Client Integrations
          erpSystem,
          sso,
          hrisSystem,
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
      isActive,
      clientCode,
      clientRegion,
      clientSourceCode,
      contactName,
      contactEmail,
      contactPhone,
      taxId,
      addressLine1,
      addressLine2,
      addressLine3,
      city,
      postalCode,
      countryState,
      country,
      accountManager,
      accountManagerEmail,
      implementationManager,
      implementationManagerEmail,
      technologyOwner,
      technologyOwnerEmail,
      clientUrl,
      allowSessionTimeoutExtend,
      authenticationMethod,
      customUrl,
      hasEmployeeData,
      invoiceType,
      invoiceTemplateType,
      poType,
      poNumber,
      erpSystem,
      sso,
      hrisSystem,
    });

    setErrors(validationErrors.fieldErrors);

    if (Object.keys(validationErrors.fieldErrors).length === 0) {
      handleSave();
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
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/clients/${clientId}`)}
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

      {/* Configuration Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
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
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Client General Information</h3>
                <p className="text-sm text-gray-700">
                  Configure basic client details, contact information, and regional settings
                </p>
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
                    Client Code <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <Input
                    value={clientCode}
                    onChange={(e) => {
                      setClientCode(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="ACME-2026"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used in URLs and identifiers</p>
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
                    value={taxId}
                    onChange={(e) => {
                      setTaxId(e.target.value);
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
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
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
                  <Input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="(555) 123-4567"
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
              <CardDescription>Enable or disable this client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Active Status</p>
                  <p className="text-sm text-gray-600">When disabled, all sites under this client will be inaccessible</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => {
                      setIsActive(e.target.checked);
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

        {/* Address Tab */}
        <TabsContent value="address" className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Client Address Information</h3>
                <p className="text-sm text-gray-700">
                  Complete address details for shipping, billing, and correspondence
                </p>
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
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 1
                </label>
                <Input
                  value={addressLine1}
                  onChange={(e) => {
                    setAddressLine1(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 2 <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <Input
                  value={addressLine2}
                  onChange={(e) => {
                    setAddressLine2(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Suite 100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address Line 3 <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <Input
                  value={addressLine3}
                  onChange={(e) => {
                    setAddressLine3(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Building B"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="San Francisco"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State/Province
                  </label>
                  <Input
                    value={countryState}
                    onChange={(e) => {
                      setCountryState(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <Input
                    value={postalCode}
                    onChange={(e) => {
                      setPostalCode(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="94102"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <Input
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value.toUpperCase());
                      setHasChanges(true);
                    }}
                    placeholder="US"
                    maxLength={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">2-letter ISO code (US, CA, GB)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Team Tab */}
        <TabsContent value="account" className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Account Team</h3>
                <p className="text-sm text-gray-700">
                  Key contacts managing this client relationship
                </p>
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
                    value={accountManager}
                    onChange={(e) => {
                      setAccountManager(e.target.value);
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
                    value={accountManagerEmail}
                    onChange={(e) => {
                      setAccountManagerEmail(e.target.value);
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
                    value={implementationManager}
                    onChange={(e) => {
                      setImplementationManager(e.target.value);
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
                    value={implementationManagerEmail}
                    onChange={(e) => {
                      setImplementationManagerEmail(e.target.value);
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
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Application Settings</h3>
                <p className="text-sm text-gray-700">
                  Configure URLs, authentication, and application behavior
                </p>
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
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
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
                  value={authenticationMethod}
                  onChange={(e) => {
                    setAuthenticationMethod(e.target.value);
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
                    checked={allowSessionTimeoutExtend}
                    onChange={(e) => {
                      setAllowSessionTimeoutExtend(e.target.checked);
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
                    checked={hasEmployeeData}
                    onChange={(e) => {
                      setHasEmployeeData(e.target.checked);
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
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Billing Configuration</h3>
                <p className="text-sm text-gray-700">
                  Invoice settings and purchase order information
                </p>
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
                    value={invoiceType}
                    onChange={(e) => {
                      setInvoiceType(e.target.value);
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
                    value={invoiceTemplateType}
                    onChange={(e) => {
                      setInvoiceTemplateType(e.target.value);
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
                    value={poType}
                    onChange={(e) => {
                      setPoType(e.target.value);
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
                    value={poNumber}
                    onChange={(e) => {
                      setPoNumber(e.target.value);
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
            <div className="flex items-start gap-3">
              <Link2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">System Integrations</h3>
                <p className="text-sm text-gray-700">
                  Connect with ERP, SSO, and HRIS systems
                </p>
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
                  value={erpSystem}
                  onChange={(e) => {
                    setErpSystem(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="">Select ERP System</option>
                  <option value="NAJ">NAJ</option>
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
                  value={sso}
                  onChange={(e) => {
                    setSso(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Azure AD, Okta, OneLogin, etc."
                />
                <p className="text-xs text-gray-500 mt-1">SSO identity provider name</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                HRIS Integration
              </CardTitle>
              <CardDescription>Human Resources Information System connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  HRIS System <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <Input
                  value={hrisSystem}
                  onChange={(e) => {
                    setHrisSystem(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Workday, ADP, BambooHR, etc."
                />
                <p className="text-xs text-gray-500 mt-1">HR system for employee data sync</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}