import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Save, Palette, Loader2 } from 'lucide-react';
import { useBrands } from '../../hooks/usePhase5A';
import { useSite } from '../../context/SiteContext';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export function BrandEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients } = useSite();
  const { brands, loading, updateBrand } = useBrands({});
  
  const brand = brands.find(b => b.id === id);
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Form state
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [secondaryColor, setSecondaryColor] = useState('#818CF8');
  const [bodyTextColorDark, setBodyTextColorDark] = useState('#1F2937');
  const [bodyTextColorLight, setBodyTextColorLight] = useState('#F9FAFB');
  const [accentColor1, setAccentColor1] = useState('');
  const [accentColor2, setAccentColor2] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Load brand data
  useEffect(() => {
    if (brand) {
      setName(brand.name);
      setClientId(brand.clientId || '');
      setDescription(brand.description || '');
      setLogoUrl(brand.logoUrl || '');
      setPrimaryColor(brand.primaryColor || '#4F46E5');
      setSecondaryColor(brand.secondaryColor || '#818CF8');
      setBodyTextColorDark(brand.bodyTextColorDark || '#1F2937');
      setBodyTextColorLight(brand.bodyTextColorLight || '#F9FAFB');
      setAccentColor1(brand.accentColor1 || '');
      setAccentColor2(brand.accentColor2 || '');
      setStatus(brand.status);
    }
  }, [brand]);

  const handleSave = async () => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      await updateBrand(id, {
        name,
        clientId,
        description,
        logoUrl,
        primaryColor,
        secondaryColor,
        bodyTextColorDark,
        bodyTextColorLight,
        accentColor1,
        accentColor2,
        status,
      });
      showSuccessToast('Brand updated successfully');
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to update brand');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand Not Found</h2>
          <p className="text-gray-600 mb-4">The brand you're looking for doesn't exist.</p>
          <Link to="/admin/brands-management">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Brands
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/brands-management">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Brand</h1>
            <p className="text-gray-600">{brand.name}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="colors">Colors & Styling</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic brand details and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="client">Client *</Label>
                <select
                  id="client"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  This brand will only be accessible to the selected client
                </p>
              </div>

              <div>
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., WeCelebrate"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the brand"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Colors & Styling</CardTitle>
              <CardDescription>Configure brand colors and visual identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary and Secondary Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20 h-12"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#4F46E5"
                      className="flex-1"
                    />
                  </div>
                  <div 
                    className="mt-3 h-24 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>

                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-20 h-12"
                    />
                    <Input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#818CF8"
                      className="flex-1"
                    />
                  </div>
                  <div 
                    className="mt-3 h-24 rounded-lg border-2 border-gray-200"
                    style={{ backgroundColor: secondaryColor }}
                  />
                </div>
              </div>

              {/* Body Text Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bodyTextColorDark">Body Text Color (Dark)</Label>
                  <p className="text-xs text-gray-500 mb-2">For use on light backgrounds</p>
                  <div className="flex gap-2">
                    <Input
                      id="bodyTextColorDark"
                      type="color"
                      value={bodyTextColorDark}
                      onChange={(e) => setBodyTextColorDark(e.target.value)}
                      className="w-20 h-12"
                    />
                    <Input
                      type="text"
                      value={bodyTextColorDark}
                      onChange={(e) => setBodyTextColorDark(e.target.value)}
                      placeholder="#1F2937"
                      className="flex-1"
                    />
                  </div>
                  <div 
                    className="mt-3 h-16 rounded-lg border-2 border-gray-200 bg-white flex items-center justify-center"
                  >
                    <span style={{ color: bodyTextColorDark }} className="font-medium">Sample Text</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bodyTextColorLight">Body Text Color (Light)</Label>
                  <p className="text-xs text-gray-500 mb-2">For use on dark backgrounds</p>
                  <div className="flex gap-2">
                    <Input
                      id="bodyTextColorLight"
                      type="color"
                      value={bodyTextColorLight}
                      onChange={(e) => setBodyTextColorLight(e.target.value)}
                      className="w-20 h-12"
                    />
                    <Input
                      type="text"
                      value={bodyTextColorLight}
                      onChange={(e) => setBodyTextColorLight(e.target.value)}
                      placeholder="#F9FAFB"
                      className="flex-1"
                    />
                  </div>
                  <div 
                    className="mt-3 h-16 rounded-lg border-2 border-gray-200 bg-gray-900 flex items-center justify-center"
                  >
                    <span style={{ color: bodyTextColorLight }} className="font-medium">Sample Text</span>
                  </div>
                </div>
              </div>

              {/* Accent Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="accentColor1">Brand Accent Color 1</Label>
                  <p className="text-xs text-gray-500 mb-2">Optional accent color</p>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor1"
                      type="color"
                      value={accentColor1 || '#10B981'}
                      onChange={(e) => setAccentColor1(e.target.value)}
                      className="w-20 h-12"
                    />
                    <Input
                      type="text"
                      value={accentColor1}
                      onChange={(e) => setAccentColor1(e.target.value)}
                      placeholder="#10B981"
                      className="flex-1"
                    />
                  </div>
                  {accentColor1 && (
                    <div 
                      className="mt-3 h-16 rounded-lg border-2 border-gray-200"
                      style={{ backgroundColor: accentColor1 }}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="accentColor2">Brand Accent Color 2</Label>
                  <p className="text-xs text-gray-500 mb-2">Optional accent color</p>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor2"
                      type="color"
                      value={accentColor2 || '#F59E0B'}
                      onChange={(e) => setAccentColor2(e.target.value)}
                      className="w-20 h-12"
                    />
                    <Input
                      type="text"
                      value={accentColor2}
                      onChange={(e) => setAccentColor2(e.target.value)}
                      placeholder="#F59E0B"
                      className="flex-1"
                    />
                  </div>
                  {accentColor2 && (
                    <div 
                      className="mt-3 h-16 rounded-lg border-2 border-gray-200"
                      style={{ backgroundColor: accentColor2 }}
                    />
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color Preview
                </h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div 
                      className="h-32 rounded-lg border-2 border-white shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <p className="text-xs text-center mt-2 text-gray-600">Primary</p>
                  </div>
                  <div className="flex-1">
                    <div 
                      className="h-32 rounded-lg border-2 border-white shadow-sm"
                      style={{ backgroundColor: secondaryColor }}
                    />
                    <p className="text-xs text-center mt-2 text-gray-600">Secondary</p>
                  </div>
                  <div className="flex-1">
                    <div 
                      className="h-32 rounded-lg border-2 border-white shadow-sm flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                      }}
                    >
                      <span className="text-white font-semibold text-sm">Gradient</span>
                    </div>
                    <p className="text-xs text-center mt-2 text-gray-600">Combined</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>Brand Assets</CardTitle>
              <CardDescription>Logos and other brand assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                {logoUrl && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">Logo Preview:</p>
                    <img 
                      src={logoUrl} 
                      alt="Brand logo" 
                      className="max-h-32 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button (Bottom) */}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
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
  );
}
