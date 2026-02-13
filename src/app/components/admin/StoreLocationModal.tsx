import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Store, MapPin } from 'lucide-react';
import { countries } from '../../utils/countries';

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

type StoreLocationValue = string | boolean;

interface StoreLocationModalProps {
  open: boolean;
  onClose: () => void;
  store?: StoreLocation | null;
  onSave: (store: StoreLocation) => void;
}

export function StoreLocationModal({ open, onClose, store, onSave }: StoreLocationModalProps) {
  const [formData, setFormData] = useState<StoreLocation>({
    id: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    hours: '',
    isActive: true
  });

  useEffect(() => {
    if (store) {
      setFormData(store);
    } else {
      setFormData({
        id: `store-${Date.now()}`,
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
        phone: '',
        hours: '',
        isActive: true
      });
    }
  }, [store, open]);

  const handleChange = (field: keyof StoreLocation, value: StoreLocationValue) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
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
            <Label htmlFor="address">
              Street Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          {/* City, State, Zip */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="New York"
              />
            </div>
            <div>
              <Label htmlFor="state">
                State/Province <span className="text-red-500">*</span>
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="NY"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">
                Zip/Postal Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder="10001"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <Label htmlFor="country">
              Country <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.country}
              onValueChange={(value) => handleChange('country', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
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
                    {formData.address && <p>{formData.address}</p>}
                    {(formData.city || formData.state || formData.zipCode) && (
                      <p>{formData.city}{formData.state ? `, ${formData.state}` : ''} {formData.zipCode}</p>
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
            disabled={!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.phone}
          >
            {store ? 'Update Location' : 'Add Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}