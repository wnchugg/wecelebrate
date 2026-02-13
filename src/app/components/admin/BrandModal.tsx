import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Building2, Palette } from 'lucide-react';
import { Brand } from '../../context/SiteContext';

interface BrandModalProps {
  open: boolean;
  onClose: () => void;
  brand?: Brand | null;
  onSave: (brand: Brand) => void;
}

export function BrandModal({ open, onClose, brand, onSave }: BrandModalProps) {
  const [formData, setFormData] = useState<Brand>({
    id: '',
    name: '',
    clientId: '',
    clientName: '',
    description: '',
    logo: '',
    primaryColor: '#D91C81',
    secondaryColor: '#1B2A5E',
    tertiaryColor: '#00B4CC',
    isActive: true,
    createdAt: '',
    updatedAt: '',
  });

  useEffect(() => {
    if (brand) {
      setFormData(brand);
    } else {
      setFormData({
        id: `brand-${Date.now()}`,
        name: '',
        clientId: `client-${Date.now()}`,
        clientName: '',
        description: '',
        logo: '',
        primaryColor: '#D91C81',
        secondaryColor: '#1B2A5E',
        tertiaryColor: '#00B4CC',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [brand, open]);

  const handleChange = (field: keyof Brand, value: string | boolean) => {
    setFormData((prev: Brand) => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor' | 'tertiaryColor', value: string) => {
    setFormData((prev: Brand) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.clientName) {
      return;
    }
    onSave({
      ...formData,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#D91C81]" />
            {brand ? 'Edit Brand' : 'Create New Brand'}
          </DialogTitle>
          <DialogDescription>
            {brand 
              ? 'Update the brand details and configuration.'
              : 'Create a new brand for your client with custom branding and settings.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Brand Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Acme Enterprise"
                />
              </div>

              <div>
                <Label htmlFor="clientName">
                  Client Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  placeholder="Acme Corporation"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of this brand..."
                rows={3}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Contact Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Brand Colors */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#D91C81]" />
              <h3 className="font-semibold text-gray-900">Brand Colors</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tertiaryColor">Tertiary Color</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    id="tertiaryColor"
                    type="color"
                    value={formData.tertiaryColor}
                    onChange={(e) => handleColorChange('tertiaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.tertiaryColor}
                    onChange={(e) => handleColorChange('tertiaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm font-semibold text-gray-700 mb-3">Brand Color Preview</p>
              <div className="flex gap-3">
                <div className="flex-1 text-center">
                  <div
                    className="w-full h-16 rounded-lg mb-2 shadow-sm"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                  <p className="text-xs text-gray-600">Primary</p>
                </div>
                <div className="flex-1 text-center">
                  <div
                    className="w-full h-16 rounded-lg mb-2 shadow-sm"
                    style={{ backgroundColor: formData.secondaryColor }}
                  />
                  <p className="text-xs text-gray-600">Secondary</p>
                </div>
                <div className="flex-1 text-center">
                  <div
                    className="w-full h-16 rounded-lg mb-2 shadow-sm"
                    style={{ backgroundColor: formData.tertiaryColor }}
                  />
                  <p className="text-xs text-gray-600">Tertiary</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-base font-semibold">Active Brand</Label>
              <p className="text-sm text-gray-600 mt-1">
                Make this brand available for site configuration
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
            />
          </div>

          {/* Preview Card */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Brand Preview</p>
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-sm"
                style={{ backgroundColor: formData.primaryColor }}
              >
                {formData.name ? formData.name.charAt(0) : '?'}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900">
                  {formData.name || 'Brand Name'}
                </h4>
                <p className="text-sm text-gray-600">
                  {formData.clientName || 'Client Name'}
                </p>
                {formData.description && (
                  <p className="text-sm text-gray-600 mt-2">{formData.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <div
                    className="w-8 h-8 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: formData.primaryColor }}
                  />
                  <div
                    className="w-8 h-8 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: formData.secondaryColor }}
                  />
                  <div
                    className="w-8 h-8 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: formData.tertiaryColor }}
                  />
                </div>
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
            disabled={!formData.name || !formData.clientName}
          >
            {brand ? 'Update Brand' : 'Create Brand'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}