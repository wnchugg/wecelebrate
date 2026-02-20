import { useState, useEffect } from 'react';
import { showErrorToast } from '../../utils/errorHandling';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { PhoneInput } from '../../components/ui/phone-input';
import { AddressInput, AddressData } from '../../components/ui/address-input';
import { validateEmail, validateUrl, validateRequired } from './ClientManagement';
import { validatePhoneNumber } from '../../utils/phoneValidation';
import type { Client as ApiClient } from '../../types/api.types';
import { useLanguage } from '../../context/LanguageContext';

// Use the API Client type with additional UI fields
interface Client extends ApiClient {
  isActive: boolean;
  description?: string;
  contactPhone?: string;
  address?: string;
}

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (client: Partial<Client>) => void;
}

export function ClientModal({ open, onClose, client, onSave }: ClientModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    contactEmail: '',
    status: 'active',
    isActive: true,
  });
  const [clientAddress, setClientAddress] = useState<AddressData>({
    line1: '',
    line2: '',
    line3: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });
  const [originalData, setOriginalData] = useState<Partial<Client>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Update form data when client prop changes
  useEffect(() => {
    if (client) {
      const clientData = {
        name: client.name,
        contactEmail: client.contactEmail,
        status: client.status,
        isActive: client.isActive,
        clientCode: client.clientCode,
        clientRegion: client.clientRegion,
        clientSourceCode: client.clientSourceCode,
        clientContactName: client.clientContactName,
        clientContactPhone: client.clientContactPhone,
        clientTaxId: client.clientTaxId,
        clientAccountManager: client.clientAccountManager,
        clientAccountManagerEmail: client.clientAccountManagerEmail,
        clientImplementationManager: client.clientImplementationManager,
        clientImplementationManagerEmail: client.clientImplementationManagerEmail,
        technologyOwner: client.technologyOwner,
        technologyOwnerEmail: client.technologyOwnerEmail,
        clientUrl: client.clientUrl,
        clientCustomUrl: client.clientCustomUrl,
        clientAllowSessionTimeoutExtend: client.clientAllowSessionTimeoutExtend,
        clientAuthenticationMethod: client.clientAuthenticationMethod,
        clientHasEmployeeData: client.clientHasEmployeeData,
        clientInvoiceType: client.clientInvoiceType,
        clientInvoiceTemplateType: client.clientInvoiceTemplateType,
        clientPoType: client.clientPoType,
        clientPoNumber: client.clientPoNumber,
        clientErpSystem: client.clientErpSystem,
        clientSso: client.clientSso,
      };
      setFormData(clientData);
      setOriginalData(clientData);
      
      // Load address data
      setClientAddress({
        line1: client.clientAddressLine1 || '',
        line2: client.clientAddressLine2 || '',
        line3: client.clientAddressLine3 || '',
        city: client.clientCity || '',
        state: client.clientCountryState || '',
        postalCode: client.clientPostalCode || '',
        country: client.clientCountry || 'United States',
      });
    } else {
      const emptyData = {
        name: '',
        contactEmail: '',
        status: 'active' as const,
        isActive: true,
      };
      setFormData(emptyData);
      setOriginalData(emptyData);
      
      // Reset address data
      setClientAddress({
        line1: '',
        line2: '',
        line3: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
      });
    }
    setErrors({});
    setTouched({});
    setActiveTab('basic');
  }, [client, open]);

  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'name': {
        const nameValidation = validateRequired(value, 'Client name');
        return nameValidation.valid ? undefined : nameValidation.error;
      }
      
      case 'contactEmail': {
        const emailValidation = validateRequired(value, 'Contact email');
        if (!emailValidation.valid) return emailValidation.error;
        const emailFormatValidation = validateEmail(value);
        return emailFormatValidation.valid ? undefined : emailFormatValidation.error;
      }
      
      case 'clientContactPhone': {
        if (!value) return undefined; // Optional field
        const phoneError = validatePhoneNumber(value);
        return phoneError || undefined;
      }
      
      case 'clientAccountManagerEmail':
      case 'clientImplementationManagerEmail':
      case 'technologyOwnerEmail': {
        const optionalEmailValidation = validateEmail(value || '');
        return optionalEmailValidation.valid ? undefined : optionalEmailValidation.error;
      }
      
      case 'clientUrl':
      case 'clientCustomUrl': {
        const urlValidation = validateUrl(value || '');
        return urlValidation.valid ? undefined : urlValidation.error;
      }
      
      default:
        return undefined;
    }
  };

  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, formData[name as keyof typeof formData]);
    if (error) {
      setErrors({ ...errors, [name]: error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (touched[name] && errors[name]) {
      const error = validateField(name, value);
      if (!error) {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    const nameError = validateField('name', formData.name);
    if (nameError) newErrors.name = nameError;
    
    const emailError = validateField('contactEmail', formData.contactEmail);
    if (emailError) newErrors.contactEmail = emailError;
    
    // Validate optional fields if they have values
    if (formData.clientContactPhone) {
      const phoneError = validateField('clientContactPhone', formData.clientContactPhone);
      if (phoneError) newErrors.clientContactPhone = phoneError;
    }
    
    if (formData.clientAccountManagerEmail) {
      const amEmailError = validateField('clientAccountManagerEmail', formData.clientAccountManagerEmail);
      if (amEmailError) newErrors.clientAccountManagerEmail = amEmailError;
    }
    
    if (formData.clientImplementationManagerEmail) {
      const imEmailError = validateField('clientImplementationManagerEmail', formData.clientImplementationManagerEmail);
      if (imEmailError) newErrors.clientImplementationManagerEmail = imEmailError;
    }
    
    if (formData.technologyOwnerEmail) {
      const toEmailError = validateField('technologyOwnerEmail', formData.technologyOwnerEmail);
      if (toEmailError) newErrors.technologyOwnerEmail = toEmailError;
    }
    
    if (formData.clientUrl) {
      const urlError = validateField('clientUrl', formData.clientUrl);
      if (urlError) newErrors.clientUrl = urlError;
    }
    
    if (formData.clientCustomUrl) {
      const customUrlError = validateField('clientCustomUrl', formData.clientCustomUrl);
      if (customUrlError) newErrors.clientCustomUrl = customUrlError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    if (!validateForm()) {
      showErrorToast('Please fix the validation errors before submitting');
      return;
    }

    setIsSaving(true);
    try {
      // For updates, send only changed fields
      // For creates, send all populated fields
      let dataToSend: Partial<Client>;
      
      if (client) {
        // Update mode - track which fields have changed
        dataToSend = {};
        Object.keys(formData).forEach(key => {
          const currentValue = formData[key as keyof typeof formData];
          const originalValue = originalData[key as keyof typeof originalData];
          
          // Include field if it has changed
          if (currentValue !== originalValue) {
            (dataToSend as any)[key] = currentValue;
          }
        });
        
        // Check if address has changed and add address fields
        const originalAddress = {
          line1: client.clientAddressLine1 || '',
          line2: client.clientAddressLine2 || '',
          line3: client.clientAddressLine3 || '',
          city: client.clientCity || '',
          state: client.clientCountryState || '',
          postalCode: client.clientPostalCode || '',
          country: client.clientCountry || 'United States',
        };
        
        if (JSON.stringify(clientAddress) !== JSON.stringify(originalAddress)) {
          (dataToSend as any).clientAddressLine1 = clientAddress.line1;
          (dataToSend as any).clientAddressLine2 = clientAddress.line2;
          (dataToSend as any).clientAddressLine3 = clientAddress.line3;
          (dataToSend as any).clientCity = clientAddress.city;
          (dataToSend as any).clientCountryState = clientAddress.state;
          (dataToSend as any).clientPostalCode = clientAddress.postalCode;
          (dataToSend as any).clientCountry = clientAddress.country;
        }
      } else {
        // Create mode - send all populated fields including address
        dataToSend = {
          ...formData,
          clientAddressLine1: clientAddress.line1,
          clientAddressLine2: clientAddress.line2,
          clientAddressLine3: clientAddress.line3,
          clientCity: clientAddress.city,
          clientCountryState: clientAddress.state,
          clientPostalCode: clientAddress.postalCode,
          clientCountry: clientAddress.country,
        };
      }
      
      onSave(dataToSend);
    } finally {
      setIsSaving(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Edit Client' : 'Add New Client'}
          </DialogTitle>
          <DialogDescription>
            {client ? 'Edit the details of this client.' : 'Add a new client to your system.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="w-full justify-start overflow-x-auto flex-shrink-0">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="account">Account Management</TabsTrigger>
              <TabsTrigger value="app">App Settings</TabsTrigger>
              <TabsTrigger value="billing">Billing & Integrations</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto py-4">
              {/* Tab 1: Basic Info */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="name">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g., Acme Corporation"
                    className={errors.name && touched.name ? 'border-red-500' : ''}
                  />
                  {errors.name && touched.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactEmail">
                    Contact Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    onBlur={() => handleBlur('contactEmail')}
                    placeholder="contact@client.com"
                    className={errors.contactEmail && touched.contactEmail ? 'border-red-500' : ''}
                  />
                  {errors.contactEmail && touched.contactEmail && (
                    <p className="text-sm text-red-500 mt-1">{errors.contactEmail}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.status || 'active'}
                    onValueChange={(value) => handleChange('status', value as 'active' | 'inactive')}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="clientCode">URL Slug</Label>
                  <Input
                    id="clientCode"
                    value={formData.clientCode || ''}
                    onChange={(e) => handleChange('clientCode', e.target.value)}
                    placeholder="techcorp"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used in URLs (e.g., /clients/techcorp). Use lowercase letters, numbers, and hyphens only.
                  </p>
                </div>

                <div>
                  <Label htmlFor="clientRegion">Client Region</Label>
                  <Select
                    value={formData.clientRegion || ''}
                    onValueChange={(value) => handleChange('clientRegion', value)}
                  >
                    <SelectTrigger id="clientRegion">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US/CA">US/CA</SelectItem>
                      <SelectItem value="EMEA">EMEA</SelectItem>
                      <SelectItem value="APAC">APAC</SelectItem>
                      <SelectItem value="LATAM">LATAM</SelectItem>
                      <SelectItem value="Global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="clientSourceCode">Client Source Code</Label>
                  <Input
                    id="clientSourceCode"
                    value={formData.clientSourceCode || ''}
                    onChange={(e) => handleChange('clientSourceCode', e.target.value)}
                    placeholder="Source code"
                  />
                </div>
              </TabsContent>

              {/* Tab 2: Contact */}
              <TabsContent value="contact" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="clientContactName">Contact Name</Label>
                  <Input
                    id="clientContactName"
                    value={formData.clientContactName || ''}
                    onChange={(e) => handleChange('clientContactName', e.target.value)}
                    placeholder="Primary contact person"
                  />
                </div>

                <div>
                  <Label htmlFor="clientContactPhone">Contact Phone</Label>
                  <PhoneInput
                    id="clientContactPhone"
                    value={formData.clientContactPhone || ''}
                    onChange={(value) => handleChange('clientContactPhone', value)}
                    onBlur={() => handleBlur('clientContactPhone')}
                    defaultCountry="US"
                    placeholder={t('form.enterPhone')}
                    error={!!(errors.clientContactPhone && touched.clientContactPhone)}
                  />
                  {errors.clientContactPhone && touched.clientContactPhone && (
                    <p className="text-sm text-red-500 mt-1">{errors.clientContactPhone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="clientTaxId">Tax ID</Label>
                  <Input
                    id="clientTaxId"
                    value={formData.clientTaxId || ''}
                    onChange={(e) => handleChange('clientTaxId', e.target.value)}
                    placeholder="Tax identification number"
                  />
                </div>
              </TabsContent>

              {/* Tab 3: Address */}
              <TabsContent value="address" className="space-y-4 mt-0">
                <AddressInput
                  value={clientAddress}
                  onChange={setClientAddress}
                  defaultCountry="US"
                  showCountrySelector={true}
                />
              </TabsContent>

              {/* Tab 4: Account Management */}
              <TabsContent value="account" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="clientAccountManager">Account Manager</Label>
                  <Input
                    id="clientAccountManager"
                    value={formData.clientAccountManager || ''}
                    onChange={(e) => handleChange('clientAccountManager', e.target.value)}
                    placeholder="Account manager name"
                  />
                </div>

                <div>
                  <Label htmlFor="clientAccountManagerEmail">Account Manager Email</Label>
                  <Input
                    id="clientAccountManagerEmail"
                    type="email"
                    value={formData.clientAccountManagerEmail || ''}
                    onChange={(e) => handleChange('clientAccountManagerEmail', e.target.value)}
                    onBlur={() => handleBlur('clientAccountManagerEmail')}
                    placeholder="am@company.com"
                    className={errors.clientAccountManagerEmail && touched.clientAccountManagerEmail ? 'border-red-500' : ''}
                  />
                  {errors.clientAccountManagerEmail && touched.clientAccountManagerEmail && (
                    <p className="text-sm text-red-500 mt-1">{errors.clientAccountManagerEmail}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="clientImplementationManager">Implementation Manager</Label>
                  <Input
                    id="clientImplementationManager"
                    value={formData.clientImplementationManager || ''}
                    onChange={(e) => handleChange('clientImplementationManager', e.target.value)}
                    placeholder="Implementation manager name"
                  />
                </div>

                <div>
                  <Label htmlFor="clientImplementationManagerEmail">Implementation Manager Email</Label>
                  <Input
                    id="clientImplementationManagerEmail"
                    type="email"
                    value={formData.clientImplementationManagerEmail || ''}
                    onChange={(e) => handleChange('clientImplementationManagerEmail', e.target.value)}
                    onBlur={() => handleBlur('clientImplementationManagerEmail')}
                    placeholder="im@company.com"
                    className={errors.clientImplementationManagerEmail && touched.clientImplementationManagerEmail ? 'border-red-500' : ''}
                  />
                  {errors.clientImplementationManagerEmail && touched.clientImplementationManagerEmail && (
                    <p className="text-sm text-red-500 mt-1">{errors.clientImplementationManagerEmail}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="technologyOwner">Technology Owner</Label>
                  <Input
                    id="technologyOwner"
                    value={formData.technologyOwner || ''}
                    onChange={(e) => handleChange('technologyOwner', e.target.value)}
                    placeholder="Technology owner name"
                  />
                </div>

                <div>
                  <Label htmlFor="technologyOwnerEmail">Technology Owner Email</Label>
                  <Input
                    id="technologyOwnerEmail"
                    type="email"
                    value={formData.technologyOwnerEmail || ''}
                    onChange={(e) => handleChange('technologyOwnerEmail', e.target.value)}
                    onBlur={() => handleBlur('technologyOwnerEmail')}
                    placeholder="tech@company.com"
                    className={errors.technologyOwnerEmail && touched.technologyOwnerEmail ? 'border-red-500' : ''}
                  />
                  {errors.technologyOwnerEmail && touched.technologyOwnerEmail && (
                    <p className="text-sm text-red-500 mt-1">{errors.technologyOwnerEmail}</p>
                  )}
                </div>
              </TabsContent>

              {/* Tab 5: App Settings */}
              <TabsContent value="app" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="clientUrl">Client URL</Label>
                  <Input
                    id="clientUrl"
                    value={formData.clientUrl || ''}
                    onChange={(e) => handleChange('clientUrl', e.target.value)}
                    onBlur={() => handleBlur('clientUrl')}
                    placeholder="https://client.example.com"
                    className={errors.clientUrl && touched.clientUrl ? 'border-red-500' : ''}
                  />
                  {errors.clientUrl && touched.clientUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.clientUrl}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="clientCustomUrl">Custom URL</Label>
                  <Input
                    id="clientCustomUrl"
                    value={formData.clientCustomUrl || ''}
                    onChange={(e) => handleChange('clientCustomUrl', e.target.value)}
                    onBlur={() => handleBlur('clientCustomUrl')}
                    placeholder="https://custom.client.com"
                    className={errors.clientCustomUrl && touched.clientCustomUrl ? 'border-red-500' : ''}
                  />
                  {errors.clientCustomUrl && touched.clientCustomUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.clientCustomUrl}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clientAllowSessionTimeoutExtend"
                    checked={formData.clientAllowSessionTimeoutExtend || false}
                    onCheckedChange={(checked) => handleChange('clientAllowSessionTimeoutExtend', checked)}
                  />
                  <Label htmlFor="clientAllowSessionTimeoutExtend" className="cursor-pointer">
                    Allow Session Timeout Extension
                  </Label>
                </div>

                <div>
                  <Label htmlFor="clientAuthenticationMethod">Authentication Method</Label>
                  <Select
                    value={formData.clientAuthenticationMethod || ''}
                    onValueChange={(value) => handleChange('clientAuthenticationMethod', value)}
                  >
                    <SelectTrigger id="clientAuthenticationMethod">
                      <SelectValue placeholder="Select authentication method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SSO">SSO</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="OAuth">OAuth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clientHasEmployeeData"
                    checked={formData.clientHasEmployeeData || false}
                    onCheckedChange={(checked) => handleChange('clientHasEmployeeData', checked)}
                  />
                  <Label htmlFor="clientHasEmployeeData" className="cursor-pointer">
                    Has Employee Data
                  </Label>
                </div>
              </TabsContent>

              {/* Tab 6: Billing & Integrations */}
              <TabsContent value="billing" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="clientInvoiceType">Invoice Type</Label>
                  <Input
                    id="clientInvoiceType"
                    value={formData.clientInvoiceType || ''}
                    onChange={(e) => handleChange('clientInvoiceType', e.target.value)}
                    placeholder="Invoice type"
                  />
                </div>

                <div>
                  <Label htmlFor="clientInvoiceTemplateType">Invoice Template Type</Label>
                  <Input
                    id="clientInvoiceTemplateType"
                    value={formData.clientInvoiceTemplateType || ''}
                    onChange={(e) => handleChange('clientInvoiceTemplateType', e.target.value)}
                    placeholder="Template type"
                  />
                </div>

                <div>
                  <Label htmlFor="clientPoType">PO Type</Label>
                  <Input
                    id="clientPoType"
                    value={formData.clientPoType || ''}
                    onChange={(e) => handleChange('clientPoType', e.target.value)}
                    placeholder="Purchase order type"
                  />
                </div>

                <div>
                  <Label htmlFor="clientPoNumber">PO Number</Label>
                  <Input
                    id="clientPoNumber"
                    value={formData.clientPoNumber || ''}
                    onChange={(e) => handleChange('clientPoNumber', e.target.value)}
                    placeholder="Purchase order number"
                  />
                </div>

                <div>
                  <Label htmlFor="clientErpSystem">ERP System</Label>
                  <Input
                    id="clientErpSystem"
                    value={formData.clientErpSystem || ''}
                    onChange={(e) => handleChange('clientErpSystem', e.target.value)}
                    placeholder="e.g., NXJ, Fourgen, Netsuite, GRS"
                  />
                </div>

                <div>
                  <Label htmlFor="clientSso">SSO Configuration</Label>
                  <Input
                    id="clientSso"
                    value={formData.clientSso || ''}
                    onChange={(e) => handleChange('clientSso', e.target.value)}
                    placeholder="SSO provider"
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="flex-shrink-0 mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#D91C81] hover:bg-[#B01669] text-white"
              disabled={isSaving || hasErrors}
            >
              {isSaving ? 'Saving...' : (client ? 'Update Client' : 'Create Client')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
