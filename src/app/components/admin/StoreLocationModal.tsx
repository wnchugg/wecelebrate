import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { PhoneInput } from '../ui/phone-input';
import { AddressInput, AddressData } from '../ui/address-input';
import { Store, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Local interface for this component (different from admin.ts StoreLocation)
export interface StoreLocation {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  hours?: string;
  isActive: boolean;
}

interface StoreLocationModalProps {
  open: boolean;
  onClose: () => void;
  store?: StoreLocation | null;
  onSave: (store: StoreLocation) => void;
}

export function StoreLocationModal({ open, onClose, store, onSave }: StoreLocationModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    hours: '',
    isActive: true
  });

  const [storeAddress, setStoreAddress] = useState<AddressData>({
    line1: '',
    line2: '',
    line3: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  useEffect(() => {
    if (store) {
      setFormData({
        id: store.id || '',
        name: store.name,
        phone: store.phone,
        hours: store.hours || '',
        isActive: store.isActive
      });
      setStoreAddress({
        line1: store.address || '',
        line2: '',
        line3: '',
        city: store.city || '',
        state: store.state || '',
        postalCode: store.zipCode || '',
        country: store.country || 'United States',
      });
    } else {
      setFormData({
        id: `store-${Date.now()}`,
        name: '',
        phone: '',
        hours: '',
        isActive: true
      });
      setStoreAddress({
        line1: '',
        line2: '',
        line3: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
      });
    }
  }, [store, open]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Map AddressData back to StoreLocation format
    const storeData: StoreLocation = {
      id: formData.id,
      name: formData.name,
      address: storeAddress.line1,
      city: storeAddress.city,
      state: storeAddress.state || '',
      zipCode: storeAddress.postalCode,
      country: storeAddress.country,
      phone: formData.phone,
      hours: formData.hours,
      isActive: formData.isActive
    };
    onSave(storeData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#D91C81]" />
            {store ? 'Edit Store Location' : 'Add Store Location'}
          </DialogTitle>
          <DialogDescription>
            {store 
              ? 'Update the details of this store location for pickup options.'
              : 'Add a new store location where customers can pick up their orders.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Store Name */}
          <div>
            <Label htmlFor="name">
              Store Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Corporate Headquarters"
            />
          </div>

          {/* Address */}
          <div>
            <Label className="mb-2 block">
              Store Address <span className="text-red-500">*</span>
            </Label>
            <AddressInput
              value={storeAddress}
              onChange={setStoreAddress}
              defaultCountry="US"
              required={true}
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <PhoneInput
              id="phone"
              value={formData.phone}
              onChange={(value) => handleChange('phone', value)}
              defaultCountry="US"
              placeholder={t('form.enterPhone')}
              required
            />
          </div>

          {/* Hours */}
          <div>
            <Label htmlFor="hours">Business Hours (Optional)</Label>
            <Input
              id="hours"
              value={formData.hours}
              onChange={(e) => handleChange('hours', e.target.value)}
              placeholder="Mon-Fri: 9AM-5PM"
            />
            <p className="text-xs text-gray-500 mt-1">
              Display operating hours for customer reference
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base font-semibold">Active Location</Label>
              <p className="text-sm text-gray-600 mt-1">
                Make this location available for customer selection
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
          </div>

          {/* Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Location Preview</p>
                {formData.name && (
                  <div className="space-y-1">
                    <p className="font-medium">{formData.name}</p>
                    {storeAddress.line1 && <p>{storeAddress.line1}</p>}
                    {storeAddress.line2 && <p>{storeAddress.line2}</p>}
                    {(storeAddress.city || storeAddress.state || storeAddress.postalCode) && (
                      <p>{storeAddress.city}{storeAddress.state ? `, ${storeAddress.state}` : ''} {storeAddress.postalCode}</p>
                    )}
                    {formData.phone && <p>{formData.phone}</p>}
                    {formData.hours && <p className="text-xs mt-1">{formData.hours}</p>}
                  </div>
                )}
                {!formData.name && (
                  <p className="text-blue-700">Fill in the form to preview how this location will appear to customers.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#D91C81] hover:bg-[#B01669] text-white"
            disabled={!formData.name || !storeAddress.line1 || !storeAddress.city || !storeAddress.postalCode || !formData.phone}
          >
            {store ? 'Update Location' : 'Add Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}