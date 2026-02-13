import { useState, useEffect } from 'react';
import { 
  Eye, 
  Code, 
  Palette, 
  Save, 
  RotateCcw, 
  Type,
  Layout,
  Settings,
  AlertCircle,
  Check,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  Building2,
  User,
  Gift,
  ArrowRight,
  Truck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { logger } from '../../utils/logger';

interface HomePageConfig {
  hero: {
    badgeIcon: string;
    badgeText: string;
    title: string;
    subtitle: string;
    gradientColors: string;
  };
  deliverySection: {
    sectionTitle: string;
    sectionSubtitle: string;
    companyShipping: {
      title: string;
      description: string;
      ctaText: string;
    };
    employeeShipping: {
      title: string;
      description: string;
      ctaText: string;
    };
  };
  features: {
    show: boolean;
    items: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
    }>;
  };
}

const defaultConfig: HomePageConfig = {
  hero: {
    badgeIcon: 'Gift',
    badgeText: 'Premium Event Gifting Platform',
    title: 'Celebrate Every Milestone',
    subtitle: 'Choose from our curated selection of premium gifts for your employees or corporate events',
    gradientColors: 'from-blue-600 via-blue-700 to-indigo-800',
  },
  deliverySection: {
    sectionTitle: 'Choose Your Delivery Option',
    sectionSubtitle: 'Select how you\'d like to receive your gifts - shipped directly to your company or to individual employees',
    companyShipping: {
      title: 'Ship to Company',
      description: 'Have all gifts delivered to your company address for bulk distribution. Ideal for corporate events and team celebrations.',
      ctaText: 'Browse Catalog',
    },
    employeeShipping: {
      title: 'Ship to Employee',
      description: 'Send gifts directly to individual employee addresses. Perfect for remote teams and personalized recognition.',
      ctaText: 'Browse Catalog',
    },
  },
  features: {
    show: true,
    items: [
      {
        id: '1',
        icon: 'Gift',
        title: 'Premium Selection',
        description: 'Curated gifts from top brands to celebrate your team',
      },
      {
        id: '2',
        icon: 'Building2',
        title: 'Flexible Delivery',
        description: 'Choose company or individual shipping options',
      },
      {
        id: '3',
        icon: 'ArrowRight',
        title: 'Easy Process',
        description: 'Simple checkout and tracking for all orders',
      },
    ],
  },
};

export default function HomePageEditor() {
  const [config, setConfig] = useState<HomePageConfig>(defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('hero');

  // Load saved config from backend
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/global-settings/home-page`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
      logger.error('[HomePageEditor] Failed to load config:', error);
      // Continue with default config
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/global-settings/home-page`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ config }),
        }
      );

      if (response.ok) {
        setSaveStatus('saved');
        setHasChanges(false);
        showSuccessToast('Home page settings saved successfully');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      logger.error('[HomePageEditor] Failed to save config:', error);
      setSaveStatus('error');
      showErrorToast('Failed to save home page settings');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default settings? This cannot be undone.')) {
      setConfig(defaultConfig);
      setHasChanges(true);
    }
  };

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
    setHasChanges(true);
  };

  const addFeature = () => {
    const newFeature = {
      id: Date.now().toString(),
      icon: 'Star',
      title: 'New Feature',
      description: 'Feature description',
    };
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        items: [...prev.features.items, newFeature],
      },
    }));
    setHasChanges(true);
  };

  const removeFeature = (id: string) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        items: prev.features.items.filter(f => f.id !== id),
      },
    }));
    setHasChanges(true);
  };

  const updateFeature = (id: string, field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        items: prev.features.items.map(f => 
          f.id === id ? { ...f, [field]: value } : f
        ),
      },
    }));
    setHasChanges(true);
  };

  const previewWidthClass = {
    desktop: 'max-w-full',
    tablet: 'max-w-3xl',
    mobile: 'max-w-sm'
  }[previewMode];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home Page Editor</h1>
          <p className="text-gray-600 mt-1">
            Customize the /home page content and styling
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/home"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-[#D91C81] border border-[#D91C81] rounded-lg hover:bg-pink-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Live
          </a>
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
      </div>

      {hasChanges && saveStatus === 'idle' && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You have unsaved changes. Remember to save before leaving this page.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            {/* Hero Tab */}
            <TabsContent value="hero" className="space-y-4 mt-4">
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
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={config.hero.badgeText}
                      onChange={(e) => updateConfig('hero.badgeText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                      placeholder="Premium Event Gifting Platform"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value={config.hero.title}
                      onChange={(e) => updateConfig('hero.title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                      placeholder="Celebrate Every Milestone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Subtitle
                    </label>
                    <textarea
                      value={config.hero.subtitle}
                      onChange={(e) => updateConfig('hero.subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                      rows={3}
                      placeholder="Choose from our curated selection..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gradient Colors (Tailwind classes)
                    </label>
                    <input
                      type="text"
                      value={config.hero.gradientColors}
                      onChange={(e) => updateConfig('hero.gradientColors', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                      placeholder="from-blue-600 via-blue-700 to-indigo-800"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Delivery Tab */}
            <TabsContent value="delivery" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="w-5 h-5 text-[#D91C81]" />
                    Delivery Options Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={config.deliverySection.sectionTitle}
                      onChange={(e) => updateConfig('deliverySection.sectionTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Subtitle
                    </label>
                    <textarea
                      value={config.deliverySection.sectionSubtitle}
                      onChange={(e) => updateConfig('deliverySection.sectionSubtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company Shipping Option
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={config.deliverySection.companyShipping.title}
                          onChange={(e) => updateConfig('deliverySection.companyShipping.title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={config.deliverySection.companyShipping.description}
                          onChange={(e) => updateConfig('deliverySection.companyShipping.description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={config.deliverySection.companyShipping.ctaText}
                          onChange={(e) => updateConfig('deliverySection.companyShipping.ctaText', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Employee Shipping Option
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          type="text"
                          value={config.deliverySection.employeeShipping.title}
                          onChange={(e) => updateConfig('deliverySection.employeeShipping.title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={config.deliverySection.employeeShipping.description}
                          onChange={(e) => updateConfig('deliverySection.employeeShipping.description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={config.deliverySection.employeeShipping.ctaText}
                          onChange={(e) => updateConfig('deliverySection.employeeShipping.ctaText', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Gift className="w-5 h-5 text-[#00B4CC]" />
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
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.features.show}
                      onChange={(e) => updateConfig('features.show', e.target.checked)}
                      className="w-5 h-5 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                    />
                    <span className="text-sm font-medium text-gray-700">Show Features Section</span>
                  </label>

                  {config.features.items.map((feature, index) => (
                    <div key={feature.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Feature {index + 1}</span>
                        <button
                          onClick={() => removeFeature(feature.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Icon (Lucide icon name)
                        </label>
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => updateFeature(feature.id, 'icon', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                          placeholder="Gift"
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
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#D91C81]" />
                  Preview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-[#D91C81] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-[#D91C81] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-[#D91C81] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`mx-auto transition-all ${previewWidthClass}`}>
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  {/* Hero Preview */}
                  <div className={`bg-gradient-to-br ${config.hero.gradientColors} text-white py-12 px-6`}>
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4">
                        <Gift className="w-4 h-4" />
                        <span className="text-xs font-medium">{config.hero.badgeText}</span>
                      </div>
                      <h1 className="text-3xl font-bold mb-3">{config.hero.title}</h1>
                      <p className="text-sm text-blue-100">{config.hero.subtitle}</p>
                    </div>
                  </div>

                  {/* Delivery Options Preview */}
                  <div className="py-8 px-6">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {config.deliverySection.sectionTitle}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {config.deliverySection.sectionSubtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Company Shipping */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">
                          {config.deliverySection.companyShipping.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          {config.deliverySection.companyShipping.description}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-blue-600 text-xs font-semibold">
                          {config.deliverySection.companyShipping.ctaText}
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Employee Shipping */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">
                          {config.deliverySection.employeeShipping.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          {config.deliverySection.employeeShipping.description}
                        </p>
                        <div className="flex items-center justify-center gap-1 text-blue-600 text-xs font-semibold">
                          {config.deliverySection.employeeShipping.ctaText}
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features Preview */}
                  {config.features.show && (
                    <div className="bg-white py-8 px-6 border-t border-gray-200">
                      <div className="grid grid-cols-3 gap-4">
                        {config.features.items.map((feature) => (
                          <div key={feature.id} className="text-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Gift className="w-5 h-5 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-xs mb-1">{feature.title}</h3>
                            <p className="text-xs text-gray-600">{feature.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}