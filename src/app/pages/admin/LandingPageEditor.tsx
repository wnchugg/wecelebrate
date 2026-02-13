import { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import { 
  Eye, 
  Code, 
  Palette, 
  Save, 
  RotateCcw, 
  Image as ImageIcon,
  Type,
  Layout,
  Settings,
  AlertCircle,
  Check,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';

interface LandingPageConfig {
  mode: 'visual' | 'custom';
  visual: {
    heroTitle: string;
    heroSubtitle: string;
    heroBackgroundType: 'gradient' | 'image' | 'solid';
    heroBackgroundGradient: string;
    heroBackgroundImage?: string;
    heroBackgroundColor: string;
    ctaText: string;
    ctaStyle: 'primary' | 'secondary' | 'custom';
    ctaCustomColor?: string;
    showFeatures: boolean;
    features: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
    }>;
    showHowItWorks: boolean;
    howItWorksTitle: string;
    steps: Array<{
      id: string;
      number: string;
      title: string;
      description: string;
    }>;
    showLogo: boolean;
    logoPosition: 'left' | 'center';
    showLanguageSelector: boolean;
    customCSS?: string;
  };
  custom: {
    html: string;
    css: string;
    javascript: string;
  };
}

const defaultConfig: LandingPageConfig = {
  mode: 'visual',
  visual: {
    heroTitle: 'Your Exclusive Gift\nSelection Portal',
    heroSubtitle: 'Welcome to your exclusive gift selection portal. Choose from our curated collection of premium gifts as a token of appreciation for your hard work and dedication.',
    heroBackgroundType: 'gradient',
    heroBackgroundGradient: 'linear-gradient(135deg, #00E5A0 0%, #0066CC 33%, #D91C81 66%, #1B2A5E 100%)',
    heroBackgroundColor: '#1B2A5E',
    ctaText: 'Get Started',
    ctaStyle: 'primary',
    showFeatures: true,
    features: [
      {
        id: '1',
        icon: 'Award',
        title: 'Premium Selection',
        description: 'Handpicked gifts from top brands that you\'ll love and appreciate'
      },
      {
        id: '2',
        icon: 'Shield',
        title: 'Secure Access',
        description: 'Your personal gift portal protected with secure validation'
      },
      {
        id: '3',
        icon: 'Package',
        title: 'Easy Delivery',
        description: 'Choose your delivery preference and we\'ll handle the rest'
      }
    ],
    showHowItWorks: true,
    howItWorksTitle: 'How It Works',
    steps: [
      { id: '1', number: '1', title: 'Verify Access', description: 'Enter your credentials to access the portal' },
      { id: '2', number: '2', title: 'Browse Gifts', description: 'Explore our curated collection of premium items' },
      { id: '3', number: '3', title: 'Select & Order', description: 'Choose your gift and complete checkout' },
      { id: '4', number: '4', title: 'Receive', description: 'Get your gift delivered to your door' }
    ],
    showLogo: true,
    logoPosition: 'left',
    showLanguageSelector: true,
  },
  custom: {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gift Selection Portal</title>
</head>
<body>
  <div class="hero">
    <h1>Welcome to Your Gift Portal</h1>
    <p>Select your perfect gift</p>
    <button id="cta-button">Get Started</button>
  </div>
</body>
</html>`,
    css: `body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #00E5A0 0%, #D91C81 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero {
  text-align: center;
  color: white;
  padding: 2rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

#cta-button {
  background: white;
  color: #D91C81;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: bold;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s;
}

#cta-button:hover {
  transform: scale(1.05);
}`,
    javascript: `// Add your custom JavaScript here
document.addEventListener('DOMContentLoaded', function() {
  const ctaButton = document.getElementById('cta-button');
  
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      // Navigate to access page
      window.location.href = '/access';
    });
  }
});`
  }
};

export function LandingPageEditor() {
  const { currentSite, updateSite } = useSite();
  const [config, setConfig] = useState<LandingPageConfig>(defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    // Load saved config from site settings
    if (currentSite?.settings) {
      const savedConfig = (currentSite.settings as any).landingPageConfig;
      if (savedConfig) {
        setConfig(savedConfig);
      }
    }
  }, [currentSite]);

  const handleSave = () => {
    if (!currentSite) return;
    
    setSaveStatus('saving');
    
    // Save to site settings
    updateSite(currentSite.id, {
      settings: {
        ...currentSite.settings,
        landingPageConfig: config
      } as any
    });
    
    setTimeout(() => {
      setSaveStatus('saved');
      setHasChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default settings? This cannot be undone.')) {
      setConfig(defaultConfig);
      setHasChanges(true);
    }
  };

  const updateVisualConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig.visual;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
    setHasChanges(true);
  };

  const updateCustomCode = (type: 'html' | 'css' | 'javascript', value: string) => {
    setConfig(prev => ({
      ...prev,
      custom: {
        ...prev.custom,
        [type]: value
      }
    }));
    setHasChanges(true);
  };

  const addFeature = () => {
    const newFeature = {
      id: Date.now().toString(),
      icon: 'Star',
      title: 'New Feature',
      description: 'Feature description'
    };
    setConfig(prev => ({
      ...prev,
      visual: {
        ...prev.visual,
        features: [...prev.visual.features, newFeature]
      }
    }));
    setHasChanges(true);
  };

  const removeFeature = (id: string) => {
    setConfig(prev => ({
      ...prev,
      visual: {
        ...prev.visual,
        features: prev.visual.features.filter(f => f.id !== id)
      }
    }));
    setHasChanges(true);
  };

  const updateFeature = (id: string, field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      visual: {
        ...prev.visual,
        features: prev.visual.features.map(f => 
          f.id === id ? { ...f, [field]: value } : f
        )
      }
    }));
    setHasChanges(true);
  };

  if (!currentSite) {
    return (
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Please select a site to edit its landing page.
        </AlertDescription>
      </Alert>
    );
  }

  const previewWidthClass = {
    desktop: 'max-w-full',
    tablet: 'max-w-3xl',
    mobile: 'max-w-sm'
  }[previewMode];

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saveStatus === 'saving'}
          className="flex items-center gap-2 px-6 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B01669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveStatus === 'saving' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {hasChanges && saveStatus === 'idle' && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You have unsaved changes. Remember to save before leaving this page.
          </AlertDescription>
        </Alert>
      )}

      {/* Mode Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#D91C81]" />
            Editor Mode
          </CardTitle>
          <CardDescription>Choose between visual editor or custom HTML/CSS/JS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, mode: 'visual' }));
                setHasChanges(true);
              }}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                config.mode === 'visual'
                  ? 'border-[#D91C81] bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Palette className={`w-8 h-8 mb-3 ${config.mode === 'visual' ? 'text-[#D91C81]' : 'text-gray-400'}`} />
              <h3 className="font-bold text-gray-900 mb-2">Visual Editor</h3>
              <p className="text-sm text-gray-600">
                Use our intuitive visual editor to customize colors, content, and layout without coding
              </p>
            </button>

            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, mode: 'custom' }));
                setHasChanges(true);
              }}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                config.mode === 'custom'
                  ? 'border-[#D91C81] bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Code className={`w-8 h-8 mb-3 ${config.mode === 'custom' ? 'text-[#D91C81]' : 'text-gray-400'}`} />
              <h3 className="font-bold text-gray-900 mb-2">Custom Code</h3>
              <p className="text-sm text-gray-600">
                Full control with custom HTML, CSS, and JavaScript for advanced customization
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Visual Editor */}
      {config.mode === 'visual' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Type className="w-5 h-5 text-[#00B4CC]" />
                      Hero Section
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hero Title
                      </label>
                      <textarea
                        value={config.visual.heroTitle}
                        onChange={(e) => updateVisualConfig('heroTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                        rows={3}
                        placeholder="Your Exclusive Gift Selection Portal"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hero Subtitle
                      </label>
                      <textarea
                        value={config.visual.heroSubtitle}
                        onChange={(e) => updateVisualConfig('heroSubtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                        rows={4}
                        placeholder="Welcome message..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={config.visual.ctaText}
                        onChange={(e) => updateVisualConfig('ctaText', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                        placeholder="Get Started"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        "How It Works" Title
                      </label>
                      <input
                        type="text"
                        value={config.visual.howItWorksTitle}
                        onChange={(e) => updateVisualConfig('howItWorksTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                        placeholder="How It Works"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Design Tab */}
              <TabsContent value="design" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="w-5 h-5 text-[#D91C81]" />
                      Background & Colors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background Type
                      </label>
                      <select
                        value={config.visual.heroBackgroundType}
                        onChange={(e) => updateVisualConfig('heroBackgroundType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                      >
                        <option value="gradient">Gradient</option>
                        <option value="solid">Solid Color</option>
                        <option value="image">Image</option>
                      </select>
                    </div>

                    {config.visual.heroBackgroundType === 'gradient' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gradient CSS
                        </label>
                        <input
                          type="text"
                          value={config.visual.heroBackgroundGradient}
                          onChange={(e) => updateVisualConfig('heroBackgroundGradient', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                          placeholder="linear-gradient(...)"
                        />
                      </div>
                    )}

                    {config.visual.heroBackgroundType === 'solid' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={config.visual.heroBackgroundColor}
                            onChange={(e) => updateVisualConfig('heroBackgroundColor', e.target.value)}
                            className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.visual.heroBackgroundColor}
                            onChange={(e) => updateVisualConfig('heroBackgroundColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {config.visual.heroBackgroundType === 'image' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Image URL
                        </label>
                        <input
                          type="text"
                          value={config.visual.heroBackgroundImage || ''}
                          onChange={(e) => updateVisualConfig('heroBackgroundImage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CTA Button Style
                      </label>
                      <select
                        value={config.visual.ctaStyle}
                        onChange={(e) => updateVisualConfig('ctaStyle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                      >
                        <option value="primary">Primary (Brand Color)</option>
                        <option value="secondary">Secondary (White)</option>
                        <option value="custom">Custom Color</option>
                      </select>
                    </div>

                    {config.visual.ctaStyle === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Button Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={config.visual.ctaCustomColor || '#D91C81'}
                            onChange={(e) => updateVisualConfig('ctaCustomColor', e.target.value)}
                            className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.visual.ctaCustomColor || '#D91C81'}
                            onChange={(e) => updateVisualConfig('ctaCustomColor', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom CSS (Advanced)
                      </label>
                      <textarea
                        value={config.visual.customCSS || ''}
                        onChange={(e) => updateVisualConfig('customCSS', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                        rows={6}
                        placeholder="/* Add custom CSS here */"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings className="w-5 h-5 text-[#1B2A5E]" />
                      Layout Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.visual.showLogo}
                        onChange={(e) => updateVisualConfig('showLogo', e.target.checked)}
                        className="w-5 h-5 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                      />
                      <span className="text-sm font-medium text-gray-700">Show Logo</span>
                    </label>

                    {config.visual.showLogo && (
                      <div className="ml-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo Position
                        </label>
                        <select
                          value={config.visual.logoPosition}
                          onChange={(e) => updateVisualConfig('logoPosition', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                        </select>
                      </div>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.visual.showLanguageSelector}
                        onChange={(e) => updateVisualConfig('showLanguageSelector', e.target.checked)}
                        className="w-5 h-5 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                      />
                      <span className="text-sm font-medium text-gray-700">Show Language Selector</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.visual.showFeatures}
                        onChange={(e) => updateVisualConfig('showFeatures', e.target.checked)}
                        className="w-5 h-5 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                      />
                      <span className="text-sm font-medium text-gray-700">Show Features Section</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.visual.showHowItWorks}
                        onChange={(e) => updateVisualConfig('showHowItWorks', e.target.checked)}
                        className="w-5 h-5 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                      />
                      <span className="text-sm font-medium text-gray-700">Show "How It Works" Section</span>
                    </label>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <ImageIcon className="w-5 h-5 text-[#00B4CC]" />
                        Feature Cards
                      </CardTitle>
                      <button
                        onClick={addFeature}
                        className="px-3 py-1 text-sm bg-[#00B4CC] text-white rounded-lg hover:bg-[#0099B3] transition-colors"
                      >
                        Add Feature
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {config.visual.features.map((feature, index) => (
                      <div key={feature.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Feature {index + 1}</span>
                          <button
                            onClick={() => removeFeature(feature.id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Icon Name
                          </label>
                          <input
                            type="text"
                            value={feature.icon}
                            onChange={(e) => updateFeature(feature.id, 'icon', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                            placeholder="Award, Shield, Package, etc."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => updateFeature(feature.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={feature.description}
                            onChange={(e) => updateFeature(feature.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-4 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-[#D91C81]" />
                    Live Preview
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`p-2 rounded-lg transition-colors ${
                        previewMode === 'desktop' ? 'bg-[#D91C81] text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Desktop"
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewMode('tablet')}
                      className={`p-2 rounded-lg transition-colors ${
                        previewMode === 'tablet' ? 'bg-[#D91C81] text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Tablet"
                    >
                      <Tablet className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-2 rounded-lg transition-colors ${
                        previewMode === 'mobile' ? 'bg-[#D91C81] text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Mobile"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
                  <div className={`mx-auto bg-white rounded-lg overflow-hidden shadow-lg transition-all ${previewWidthClass}`}>
                    {/* Preview content based on config */}
                    <div 
                      className="relative min-h-[400px] flex flex-col"
                      style={{
                        background: config.visual.heroBackgroundType === 'gradient'
                          ? config.visual.heroBackgroundGradient
                          : config.visual.heroBackgroundType === 'solid'
                          ? config.visual.heroBackgroundColor
                          : config.visual.heroBackgroundImage
                          ? `url(${config.visual.heroBackgroundImage}) center/cover`
                          : config.visual.heroBackgroundGradient
                      }}
                    >
                      <div className="p-4 text-white">
                        <div className={`flex items-center ${config.visual.logoPosition === 'center' ? 'justify-center' : 'justify-between'}`}>
                          {config.visual.showLogo && (
                            <div className="text-xs font-bold">LOGO</div>
                          )}
                          {config.visual.showLanguageSelector && config.visual.logoPosition !== 'center' && (
                            <div className="text-xs bg-white/20 px-2 py-1 rounded">🌐 EN</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 whitespace-pre-line">
                          {config.visual.heroTitle}
                        </h1>
                        <p className="text-base text-white/90 mb-6 max-w-2xl">
                          {config.visual.heroSubtitle}
                        </p>
                        <button 
                          className="px-6 py-3 rounded-lg font-bold transition-transform hover:scale-105"
                          style={{
                            background: config.visual.ctaStyle === 'primary' 
                              ? currentSite?.branding.primaryColor || '#D91C81'
                              : config.visual.ctaStyle === 'secondary'
                              ? 'white'
                              : config.visual.ctaCustomColor,
                            color: config.visual.ctaStyle === 'secondary' 
                              ? currentSite?.branding.primaryColor || '#D91C81'
                              : 'white'
                          }}
                        >
                          {config.visual.ctaText}
                        </button>
                      </div>

                      {config.visual.showFeatures && (
                        <div className="px-8 pb-8">
                          <div className="grid grid-cols-3 gap-4">
                            {config.visual.features.slice(0, 3).map((feature) => (
                              <div key={feature.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                                <div className="text-xs font-bold text-white mb-1">{feature.title}</div>
                                <div className="text-xs text-white/80">{feature.description.substring(0, 40)}...</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {config.visual.showHowItWorks && (
                        <div className="px-8 pb-8">
                          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white text-center mb-4">
                              {config.visual.howItWorksTitle}
                            </h2>
                            <div className="grid grid-cols-4 gap-3">
                              {config.visual.steps.map((step) => (
                                <div key={step.id} className="text-center">
                                  <div className="w-8 h-8 bg-white text-[#D91C81] rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                                    {step.number}
                                  </div>
                                  <div className="text-xs font-semibold text-white">{step.title}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Custom Code Editor */}
      {config.mode === 'custom' && (
        <div className="space-y-6">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Advanced Mode:</strong> You have full control with custom HTML, CSS, and JavaScript. 
              Make sure your code includes a way to navigate to <code className="px-1 py-0.5 bg-amber-100 rounded">/access</code> for users to access the gift selection.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* HTML Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-[#D91C81]" />
                  HTML
                </CardTitle>
                <CardDescription>
                  Custom HTML structure for your landing page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={config.custom.html}
                  onChange={(e) => updateCustomCode('html', e.target.value)}
                  className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                  spellCheck={false}
                />
              </CardContent>
            </Card>

            {/* CSS Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#00B4CC]" />
                  CSS
                </CardTitle>
                <CardDescription>
                  Custom styles for your landing page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={config.custom.css}
                  onChange={(e) => updateCustomCode('css', e.target.value)}
                  className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                  spellCheck={false}
                />
              </CardContent>
            </Card>

            {/* JavaScript Editor */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-[#1B2A5E]" />
                  JavaScript
                </CardTitle>
                <CardDescription>
                  Custom JavaScript for interactive elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={config.custom.javascript}
                  onChange={(e) => updateCustomCode('javascript', e.target.value)}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                  spellCheck={false}
                />
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#D91C81]" />
                  Custom Code Preview
                </CardTitle>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#D91C81] hover:text-[#B01669] font-medium"
                >
                  Open in new tab
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="bg-white rounded-lg overflow-hidden shadow-lg" style={{ minHeight: '500px' }}>
                  <iframe
                    title="Landing Page Preview"
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <style>${config.custom.css}</style>
                        </head>
                        <body>
                          ${config.custom.html}
                          <script>${config.custom.javascript}</script>
                        </body>
                      </html>
                    `}
                    className="w-full h-[600px] border-0"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}