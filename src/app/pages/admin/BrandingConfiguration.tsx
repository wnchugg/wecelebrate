import { useState, useEffect } from 'react';
import { Save, Trash2, RefreshCw, Image as ImageIcon, Video, Palette } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { BrandingAssets, MediaAsset } from '../../types/siteCustomization';
import { toast } from 'sonner';

const defaultBranding: BrandingAssets = {
  logos: {
    primary: { url: '', alt: 'Primary Logo' },
  },
  images: {
    landingPage: [],
    welcomePage: [],
  },
  videos: {},
  colors: {
    primary: '#D91C81',
    secondary: '#B71569',
    tertiary: '#00B4CC',
    accent: '#1B2A5E',
    background: '#FFFFFF',
    text: '#000000',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    fontSizeBase: 16,
  },
};

export function BrandingConfiguration() {
  const { currentSite, currentClient, updateSite, updateClient } = useSite();
  const [branding, setBranding] = useState<BrandingAssets>(defaultBranding);
  const [applyTo, setApplyTo] = useState<'site' | 'client'>('site');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'logos' | 'images' | 'videos' | 'colors' | 'typography'>('logos');

  useEffect(() => {
    // Load existing branding
    if (applyTo === 'site' && currentSite?.brandingAssets) {
      setBranding(currentSite.brandingAssets);
    } else if (applyTo === 'client' && currentClient?.brandingAssets) {
      setBranding(currentClient.brandingAssets);
    } else {
      setBranding(defaultBranding);
    }
  }, [currentSite, currentClient, applyTo]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (applyTo === 'site' && currentSite) {
        await updateSite(currentSite.id, { brandingAssets: branding });
        toast.success('Branding saved to site');
      } else if (applyTo === 'client' && currentClient) {
        await updateClient(currentClient.id, { brandingAssets: branding });
        toast.success('Branding saved to client (applies to all sites)');
      }
    } catch (error) {
      console.error('Failed to save branding:', error);
      toast.error('Failed to save branding');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File, category: string) => {
    // In a real implementation, this would upload to a storage service
    // For now, we'll create a placeholder URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const asset: MediaAsset = {
        url: reader.result as string,
        alt: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      
      // Add to appropriate category
      if (category === 'landingPage') {
        setBranding(prev => ({
          ...prev,
          images: {
            ...prev.images,
            landingPage: [...prev.images.landingPage, asset],
          },
        }));
      } else if (category === 'welcomePage') {
        setBranding(prev => ({
          ...prev,
          images: {
            ...prev.images,
            welcomePage: [...prev.images.welcomePage, asset],
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (category: 'landingPage' | 'welcomePage', index: number) => {
    setBranding(prev => ({
      ...prev,
      images: {
        ...prev.images,
        [category]: prev.images[category].filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Branding Configuration</h1>
          <p className="mt-2 text-gray-600">
            Manage logos, images, videos, colors, and typography for your {applyTo === 'site' ? 'site' : 'client'}
          </p>
        </div>

        {/* Apply To Selector */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Apply Branding To:</label>
          <div className="flex gap-4">
            <button
              onClick={() => setApplyTo('site')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                applyTo === 'site'
                  ? 'bg-[#D91C81] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Current Site Only
            </button>
            <button
              onClick={() => setApplyTo('client')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                applyTo === 'client'
                  ? 'bg-[#D91C81] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Sites in Client (Default)
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {[
              { id: 'logos', label: 'Logos', icon: ImageIcon },
              { id: 'images', label: 'Images', icon: ImageIcon },
              { id: 'videos', label: 'Videos', icon: Video },
              { id: 'colors', label: 'Colors', icon: Palette },
              { id: 'typography', label: 'Typography', icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#D91C81] text-[#D91C81]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm p-6 mb-6">
          {/* Logos Tab */}
          {activeTab === 'logos' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Logo</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                    <input
                      type="text"
                      value={branding.logos.primary.url}
                      onChange={(e) =>
                        setBranding(prev => ({
                          ...prev,
                          logos: {
                            ...prev.logos,
                            primary: { ...prev.logos.primary, url: e.target.value },
                          },
                        }))
                      }
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                    <input
                      type="text"
                      value={branding.logos.primary.alt}
                      onChange={(e) =>
                        setBranding(prev => ({
                          ...prev,
                          logos: {
                            ...prev.logos,
                            primary: { ...prev.logos.primary, alt: e.target.value },
                          },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                    />
                  </div>
                  {branding.logos.primary.url && (
                    <div className="p-4 border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img 
                        src={branding.logos.primary.url} 
                        alt={branding.logos.primary.alt} 
                        className="max-h-24 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Secondary Logo (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                    <input
                      type="text"
                      value={branding.logos.secondary?.url || ''}
                      onChange={(e) =>
                        setBranding(prev => ({
                          ...prev,
                          logos: {
                            ...prev.logos,
                            secondary: { url: e.target.value, alt: 'Secondary Logo' },
                          },
                        }))
                      }
                      placeholder="https://example.com/secondary-logo.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                    />
                  </div>
                  {branding.logos.secondary?.url && (
                    <div className="p-4 border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img 
                        src={branding.logos.secondary.url} 
                        alt={branding.logos.secondary.alt} 
                        className="max-h-24 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Favicon (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
                    <input
                      type="text"
                      value={branding.logos.favicon?.url || ''}
                      onChange={(e) =>
                        setBranding(prev => ({
                          ...prev,
                          logos: {
                            ...prev.logos,
                            favicon: { url: e.target.value, alt: 'Favicon' },
                          },
                        }))
                      }
                      placeholder="https://example.com/favicon.ico"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-8">
              {/* Landing Page Images */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Landing Page Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {branding.images.landingPage.map((image, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={image.url} 
                        alt={image.alt} 
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removeImage('landingPage', idx)}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          if (input.value) {
                            setBranding(prev => ({
                              ...prev,
                              images: {
                                ...prev.images,
                                landingPage: [
                                  ...prev.images.landingPage,
                                  { url: input.value, alt: 'Landing Page Image' },
                                ],
                              },
                            }));
                            input.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Welcome Page Images */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome Page Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {branding.images.welcomePage.map((image, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={image.url} 
                        alt={image.alt} 
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removeImage('welcomePage', idx)}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          if (input.value) {
                            setBranding(prev => ({
                              ...prev,
                              images: {
                                ...prev.images,
                                welcomePage: [
                                  ...prev.images.welcomePage,
                                  { url: input.value, alt: 'Welcome Page Image' },
                                ],
                              },
                            }));
                            input.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Image (Optional)</h3>
                <input
                  type="text"
                  value={branding.images.hero?.url || ''}
                  onChange={(e) =>
                    setBranding(prev => ({
                      ...prev,
                      images: {
                        ...prev.images,
                        hero: { url: e.target.value, alt: 'Hero Image' },
                      },
                    }))
                  }
                  placeholder="https://example.com/hero.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                />
                {branding.images.hero?.url && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img 
                      src={branding.images.hero.url} 
                      alt={branding.images.hero.alt} 
                      className="w-full max-h-64 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome Video (Optional)</h3>
                <input
                  type="text"
                  value={branding.videos.welcomeVideo?.url || ''}
                  onChange={(e) =>
                    setBranding(prev => ({
                      ...prev,
                      videos: {
                        ...prev.videos,
                        welcomeVideo: { url: e.target.value, alt: 'Welcome Video' },
                      },
                    }))
                  }
                  placeholder="https://example.com/video.mp4 or YouTube URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Instructional Video (Optional)</h3>
                <input
                  type="text"
                  value={branding.videos.instructionalVideo?.url || ''}
                  onChange={(e) =>
                    setBranding(prev => ({
                      ...prev,
                      videos: {
                        ...prev.videos,
                        instructionalVideo: { url: e.target.value, alt: 'Instructional Video' },
                      },
                    }))
                  }
                  placeholder="https://example.com/video.mp4 or YouTube URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                />
              </div>
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.entries(branding.colors).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) =>
                          setBranding(prev => ({
                            ...prev,
                            colors: { ...prev.colors, [key]: e.target.value },
                          }))
                        }
                        className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          setBranding(prev => ({
                            ...prev,
                            colors: { ...prev.colors, [key]: e.target.value },
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81] font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Color Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(branding.colors).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div
                        className="h-20 rounded-md border border-gray-200 mb-2"
                        style={{ backgroundColor: value }}
                      />
                      <p className="text-xs text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading Font</label>
                <input
                  type="text"
                  value={branding.typography.headingFont}
                  onChange={(e) =>
                    setBranding(prev => ({
                      ...prev,
                      typography: { ...prev.typography, headingFont: e.target.value },
                    }))
                  }
                  placeholder="Inter, Arial, sans-serif"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Body Font</label>
                <input
                  type="text"
                  value={branding.typography.bodyFont}
                  onChange={(e) =>
                    setBranding(prev => ({
                      ...prev,
                      typography: { ...prev.typography, bodyFont: e.target.value },
                    }))
                  }
                  placeholder="Inter, Arial, sans-serif"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Font Size (px)</label>
                <input
                  type="number"
                  value={branding.typography.fontSizeBase}
                  onChange={(e) =>
                    setBranding(prev => ({
                      ...prev,
                      typography: { ...prev.typography, fontSizeBase: parseInt(e.target.value) },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Typography Preview</h3>
                <div className="p-6 border border-gray-200 rounded-md space-y-4">
                  <h1 
                    style={{ 
                      fontFamily: branding.typography.headingFont,
                      fontSize: `${branding.typography.fontSizeBase * 2}px`
                    }}
                    className="font-bold"
                  >
                    Heading 1 Sample
                  </h1>
                  <h2 
                    style={{ 
                      fontFamily: branding.typography.headingFont,
                      fontSize: `${branding.typography.fontSizeBase * 1.5}px`
                    }}
                    className="font-semibold"
                  >
                    Heading 2 Sample
                  </h2>
                  <p 
                    style={{ 
                      fontFamily: branding.typography.bodyFont,
                      fontSize: `${branding.typography.fontSizeBase}px`
                    }}
                  >
                    This is body text. The quick brown fox jumps over the lazy dog. 
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={() => setBranding(defaultBranding)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[#D91C81] text-white rounded-md hover:bg-[#B71569] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Branding
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
