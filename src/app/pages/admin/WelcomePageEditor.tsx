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
  Monitor,
  Smartphone,
  Tablet,
  Plus,
  GripVertical,
  Trash2,
  Video,
  MessageSquare,
  Heart,
  Gift,
  Award,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { apiRequest } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { logger } from '../../utils/logger';

// Block types for drag-and-drop builder
type BlockType = 
  | 'hero' 
  | 'text' 
  | 'image' 
  | 'video' 
  | 'celebration-wall' 
  | 'cta-button' 
  | 'testimonial'
  | 'gift-preview'
  | 'spacer'
  | 'custom-html';

type HeroBlockContent = {
  title: string;
  subtitle: string;
  backgroundGradient: string;
  textColor: string;
  height: string;
};

type TextBlockContent = {
  heading: string;
  body: string;
  textAlign: 'left' | 'center' | 'right';
};

type ImageBlockContent = {
  url: string;
  alt: string;
  caption: string;
  height: string;
};

type VideoBlockContent = {
  url: string;
  autoplay: boolean;
  controls: boolean;
  height: string;
};

type CTABlockContent = {
  text: string;
  url: string;
  style: 'primary' | 'secondary' | 'outline';
  alignment: 'left' | 'center' | 'right';
};

type BlockContent =
  | HeroBlockContent
  | TextBlockContent
  | ImageBlockContent
  | VideoBlockContent
  | CTABlockContent
  | Record<string, any>;

interface Block {
  id: string;
  type: BlockType;
  content: BlockContent & Record<string, any>;
  styles?: {
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

interface WelcomePageConfig {
  mode: 'visual' | 'blocks' | 'custom';
  visual: {
    title: string;
    message: string;
    authorName?: string;
    authorTitle?: string;
    imageUrl?: string;
    videoUrl?: string;
    ctaText: string;
    ctaUrl: string;
    showCelebrationMessages: boolean;
    backgroundColor: string;
    primaryColor: string;
    layout: 'side-by-side' | 'centered' | 'full-width';
    customCSS?: string;
  };
  blocks: Block[];
  custom: {
    html: string;
    css: string;
    javascript: string;
  };
}

const defaultConfig: WelcomePageConfig = {
  mode: 'visual',
  visual: {
    title: 'Congratulations on Your Anniversary!',
    message: 'Your dedication and commitment over the years have been invaluable to our team. Today, we celebrate your contributions and the positive impact you\'ve made on our organization.\n\nAs a token of our appreciation for your continued service, we invite you to select a special gift. Thank you for being such an important part of our success.',
    authorName: 'John Smith',
    authorTitle: 'Chief Executive Officer',
    imageUrl: '',
    videoUrl: '',
    ctaText: 'Choose Your Gift',
    ctaUrl: '/gift-selection',
    showCelebrationMessages: true,
    backgroundColor: '#F9FAFB',
    primaryColor: '#D91C81',
    layout: 'side-by-side',
  },
  blocks: [
    {
      id: '1',
      type: 'hero',
      content: {
        title: 'Congratulations on Your Milestone!',
        subtitle: 'We celebrate your dedication and success',
        backgroundGradient: 'linear-gradient(135deg, #D91C81 0%, #1B2A5E 100%)',
        textColor: '#FFFFFF',
        height: '500px',
      }
    },
    {
      id: '2',
      type: 'text',
      content: {
        heading: 'A Message For You',
        body: 'Thank you for your continued dedication and hard work. Your contributions have made a significant impact on our success.',
        textAlign: 'center',
      },
      styles: {
        padding: '4rem 2rem',
        backgroundColor: '#FFFFFF',
      }
    },
    {
      id: '3',
      type: 'celebration-wall',
      content: {
        title: 'Messages from Your Colleagues',
        showAll: true,
      },
      styles: {
        padding: '4rem 2rem',
        backgroundColor: '#F9FAFB',
      }
    }
  ],
  custom: {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>
<body>
  <div class="welcome-container">
    <h1>Congratulations!</h1>
    <p>Welcome to your gift selection portal</p>
    <button id="cta-button">Choose Your Gift</button>
  </div>
</body>
</html>`,
    css: `body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #D91C81 0%, #1B2A5E 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-container {
  text-align: center;
  color: white;
  padding: 3rem;
  max-width: 800px;
}

.welcome-container h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.welcome-container p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

#cta-button {
  background: white;
  color: #D91C81;
  border: none;
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
  font-weight: bold;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

#cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}`,
    javascript: `document.addEventListener('DOMContentLoaded', function() {
  const ctaButton = document.getElementById('cta-button');
  
  if (ctaButton) {
    ctaButton.addEventListener('click', function() {
      window.location.href = '/gift-selection';
    });
  }
});`
  }
};

const blockTypeOptions: { type: BlockType; label: string; icon: any; description: string }[] = [
  { type: 'hero', label: 'Hero Section', icon: Sparkles, description: 'Large banner with title and background' },
  { type: 'text', label: 'Text Block', icon: Type, description: 'Heading and paragraph content' },
  { type: 'image', label: 'Image', icon: ImageIcon, description: 'Single image with caption' },
  { type: 'video', label: 'Video', icon: Video, description: 'Embedded video player' },
  { type: 'celebration-wall', label: 'Celebration Wall', icon: Heart, description: 'Display celebration messages' },
  { type: 'cta-button', label: 'CTA Button', icon: Award, description: 'Call-to-action button' },
  { type: 'testimonial', label: 'Testimonial', icon: MessageSquare, description: 'Quote or testimonial block' },
  { type: 'gift-preview', label: 'Gift Preview', icon: Gift, description: 'Preview of available gifts' },
  { type: 'spacer', label: 'Spacer', icon: Layout, description: 'Empty space divider' },
  { type: 'custom-html', label: 'Custom HTML', icon: Code, description: 'Custom HTML content' },
];

export function WelcomePageEditor() {
  const { currentSite, updateSite } = useSite();
  const [config, setConfig] = useState<WelcomePageConfig>(defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('content');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showBlockPicker, setShowBlockPicker] = useState(false);

  useEffect(() => {
    // Load saved config from site settings
    if (currentSite?.settings) {
      const savedConfig = (currentSite.settings as any).welcomePageConfig;
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
        welcomePageConfig: config,
        welcomePageContent: {
          title: config.visual.title,
          message: config.visual.message,
          authorName: config.visual.authorName,
          authorTitle: config.visual.authorTitle,
          imageUrl: config.visual.imageUrl,
          videoUrl: config.visual.videoUrl,
          ctaText: config.visual.ctaText,
          ctaUrl: config.visual.ctaUrl,
        }
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

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: getDefaultBlockContent(type),
      styles: {
        padding: '2rem',
        backgroundColor: type === 'hero' ? '#D91C81' : '#FFFFFF',
      }
    };

    setConfig(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
    setHasChanges(true);
    setShowBlockPicker(false);
  };

  const removeBlock = (id: string) => {
    setConfig(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== id)
    }));
    setHasChanges(true);
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setConfig(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => 
        b.id === id ? { ...b, ...updates } : b
      )
    }));
    setHasChanges(true);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setConfig(prev => {
      const blocks = [...prev.blocks];
      const index = blocks.findIndex(b => b.id === id);
      
      if (direction === 'up' && index > 0) {
        [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
      } else if (direction === 'down' && index < blocks.length - 1) {
        [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
      }
      
      return { ...prev, blocks };
    });
    setHasChanges(true);
  };

  function getDefaultBlockContent(type: BlockType): BlockContent {
    switch (type) {
      case 'hero':
        return {
          title: 'Welcome!',
          subtitle: 'Your journey begins here',
          backgroundGradient: 'linear-gradient(135deg, #D91C81 0%, #1B2A5E 100%)',
          textColor: '#FFFFFF',
          height: '500px',
        };
      case 'text':
        return {
          heading: 'Heading',
          body: 'Your content here...',
          textAlign: 'left' as const,
        };
      case 'image':
        return {
          url: '',
          alt: 'Image',
          caption: '',
          height: '400px',
        };
      case 'video':
        return {
          url: '',
          autoplay: false,
          controls: true,
          height: '400px',
        };
      case 'celebration-wall':
        return {
          title: 'Celebration Messages',
          showAll: true,
          limit: 10,
        };
      case 'cta-button':
        return {
          text: 'Get Started',
          url: '/gift-selection',
          style: 'primary' as const,
          alignment: 'center' as const,
        };
      case 'testimonial':
        return {
          quote: 'This is an amazing experience!',
          author: 'John Doe',
          role: 'Customer',
        };
      case 'gift-preview':
        return {
          title: 'Available Gifts',
          showCount: 3,
        };
      case 'spacer':
        return {
          height: '60px',
        };
      case 'custom-html':
        return {
          html: '<div>Your custom HTML here</div>',
        };
      default:
        return {};
    }
  }

  if (!currentSite) {
    return (
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Please select a site to edit its welcome page.
        </AlertDescription>
      </Alert>
    );
  }

  const previewWidthClass = {
    desktop: 'max-w-full',
    tablet: 'max-w-3xl',
    mobile: 'max-w-sm'
  }[previewMode];

  const selectedBlock = config.blocks.find(b => b.id === selectedBlockId);

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
          <CardDescription>Choose your preferred editing method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
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
                Simple form-based editor for quick customization
              </p>
            </button>

            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, mode: 'blocks' }));
                setHasChanges(true);
              }}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                config.mode === 'blocks'
                  ? 'border-[#D91C81] bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Layout className={`w-8 h-8 mb-3 ${config.mode === 'blocks' ? 'text-[#D91C81]' : 'text-gray-400'}`} />
              <h3 className="font-bold text-gray-900 mb-2">Block Builder</h3>
              <p className="text-sm text-gray-600">
                Drag-and-drop blocks like Wix for flexible layouts
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
                Full control with HTML, CSS, and JavaScript
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Visual Editor Mode */}
      {config.mode === 'visual' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-[#00B4CC]" />
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Welcome Title
                  </label>
                  <input
                    type="text"
                    value={config.visual.title}
                    onChange={(e) => updateVisualConfig('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    placeholder="Congratulations!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Welcome Message
                  </label>
                  <textarea
                    value={config.visual.message}
                    onChange={(e) => updateVisualConfig('message', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    rows={6}
                    placeholder="Your personalized message..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={config.visual.authorName || ''}
                    onChange={(e) => updateVisualConfig('authorName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author Title
                  </label>
                  <input
                    type="text"
                    value={config.visual.authorTitle || ''}
                    onChange={(e) => updateVisualConfig('authorTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    placeholder="Chief Executive Officer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={config.visual.imageUrl || ''}
                    onChange={(e) => updateVisualConfig('imageUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL (YouTube/Vimeo)
                  </label>
                  <input
                    type="text"
                    value={config.visual.videoUrl || ''}
                    onChange={(e) => updateVisualConfig('videoUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    placeholder="https://youtube.com/embed/..."
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
                    placeholder="Choose Your Gift"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Layout Style
                  </label>
                  <select
                    value={config.visual.layout}
                    onChange={(e) => updateVisualConfig('layout', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  >
                    <option value="side-by-side">Side by Side</option>
                    <option value="centered">Centered</option>
                    <option value="full-width">Full Width</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.visual.showCelebrationMessages}
                    onChange={(e) => updateVisualConfig('showCelebrationMessages', e.target.checked)}
                    className="w-5 h-5 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                  />
                  <span className="text-sm font-medium text-gray-700">Show Celebration Messages</span>
                </label>

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
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-[#1B2A5E]" />
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
                <div className="bg-gray-100 rounded-lg p-4 overflow-auto max-h-[800px]">
                  <div className={`mx-auto transition-all duration-300 ${previewWidthClass}`}>
                    <div 
                      className="bg-white rounded-lg shadow-lg overflow-hidden"
                      style={{ backgroundColor: config.visual.backgroundColor }}
                    >
                      {/* Preview content */}
                      {config.visual.layout === 'side-by-side' ? (
                        <div className="grid md:grid-cols-2 gap-0">
                          <div className="h-64 bg-gray-300 flex items-center justify-center">
                            {config.visual.imageUrl ? (
                              <img src={config.visual.imageUrl} alt="Welcome" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                            )}
                          </div>
                          <div className="p-8">
                            <h1 
                              className="text-2xl font-bold mb-4"
                              style={{ color: config.visual.primaryColor }}
                            >
                              {config.visual.title}
                            </h1>
                            <p className="text-gray-700 mb-6 whitespace-pre-wrap text-sm">
                              {config.visual.message}
                            </p>
                            {(config.visual.authorName || config.visual.authorTitle) && (
                              <div className="pt-4 border-t border-gray-200">
                                <p className="font-semibold text-sm">{config.visual.authorName}</p>
                                <p className="text-gray-600 text-xs">{config.visual.authorTitle}</p>
                              </div>
                            )}
                            <button
                              className="mt-6 px-6 py-3 rounded-lg text-white font-semibold text-sm"
                              style={{ backgroundColor: config.visual.primaryColor }}
                            >
                              {config.visual.ctaText}
                            </button>
                          </div>
                        </div>
                      ) : config.visual.layout === 'centered' ? (
                        <div className="text-center p-12">
                          <h1 
                            className="text-3xl font-bold mb-6"
                            style={{ color: config.visual.primaryColor }}
                          >
                            {config.visual.title}
                          </h1>
                          {config.visual.imageUrl && (
                            <img 
                              src={config.visual.imageUrl} 
                              alt="Welcome" 
                              className="mx-auto w-48 h-48 object-cover rounded-full mb-6" 
                            />
                          )}
                          <p className="text-gray-700 mb-8 max-w-2xl mx-auto whitespace-pre-wrap">
                            {config.visual.message}
                          </p>
                          {(config.visual.authorName || config.visual.authorTitle) && (
                            <div className="mb-8">
                              <p className="font-semibold">{config.visual.authorName}</p>
                              <p className="text-gray-600 text-sm">{config.visual.authorTitle}</p>
                            </div>
                          )}
                          <button
                            className="px-8 py-4 rounded-lg text-white font-semibold"
                            style={{ backgroundColor: config.visual.primaryColor }}
                          >
                            {config.visual.ctaText}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div 
                            className="relative h-96 flex items-center justify-center text-white"
                            style={{ 
                              background: config.visual.imageUrl 
                                ? `url(${config.visual.imageUrl}) center/cover` 
                                : `linear-gradient(135deg, ${config.visual.primaryColor} 0%, ${config.visual.backgroundColor} 100%)`
                            }}
                          >
                            <div className="text-center z-10 px-8">
                              <h1 className="text-4xl font-bold mb-4">{config.visual.title}</h1>
                              <p className="text-lg mb-6 max-w-2xl">{config.visual.message.split('\n')[0]}</p>
                              <button
                                className="px-8 py-4 bg-white rounded-lg font-semibold"
                                style={{ color: config.visual.primaryColor }}
                              >
                                {config.visual.ctaText}
                              </button>
                            </div>
                          </div>
                          <div className="p-12">
                            <p className="text-gray-700 whitespace-pre-wrap mb-8">
                              {config.visual.message}
                            </p>
                            {(config.visual.authorName || config.visual.authorTitle) && (
                              <div className="pt-6 border-t border-gray-200">
                                <p className="font-semibold">{config.visual.authorName}</p>
                                <p className="text-gray-600">{config.visual.authorTitle}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {config.visual.showCelebrationMessages && (
                        <div className="p-8 bg-gray-50">
                          <h2 className="text-xl font-bold mb-4" style={{ color: config.visual.primaryColor }}>
                            Celebration Messages
                          </h2>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-500 italic">
                              Celebration messages will appear here
                            </p>
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

      {/* Block Builder Mode */}
      {config.mode === 'blocks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Block List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5 text-[#D91C81]" />
                    Page Blocks
                  </CardTitle>
                  <button
                    onClick={() => setShowBlockPicker(!showBlockPicker)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00B4CC] text-white rounded-lg hover:bg-[#0099B3] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Block
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {config.blocks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Layout className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No blocks yet. Add your first block to get started!</p>
                  </div>
                ) : (
                  config.blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedBlockId === block.id
                          ? 'border-[#D91C81] bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedBlockId(block.id)}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {blockTypeOptions.find(opt => opt.type === block.type)?.icon && (
                              (() => {
                                const Icon = blockTypeOptions.find(opt => opt.type === block.type)!.icon;
                                return <Icon className="w-4 h-4 text-gray-600" />;
                              })()
                            )}
                            <span className="font-semibold text-gray-900">
                              {blockTypeOptions.find(opt => opt.type === block.type)?.label || block.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {JSON.stringify(block.content).substring(0, 60)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveBlock(block.id, 'up');
                            }}
                            disabled={index === 0}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveBlock(block.id, 'down');
                            }}
                            disabled={index === config.blocks.length - 1}
                            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this block?')) {
                                removeBlock(block.id);
                              }
                            }}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Block Picker Modal */}
                {showBlockPicker && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Add a Block</h3>
                        <button
                          onClick={() => setShowBlockPicker(false)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {blockTypeOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.type}
                              onClick={() => addBlock(option.type)}
                              className="p-6 border-2 border-gray-200 rounded-lg hover:border-[#D91C81] hover:bg-pink-50 transition-all text-left group"
                            >
                              <Icon className="w-8 h-8 text-gray-400 group-hover:text-[#D91C81] mb-3" />
                              <h4 className="font-bold text-gray-900 mb-1">{option.label}</h4>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Block Editor */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#1B2A5E]" />
                  Block Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedBlock ? (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Select a block to edit its settings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Block Type
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {blockTypeOptions.find(opt => opt.type === selectedBlock.type)?.label}
                      </p>
                    </div>

                    {/* Dynamic block content editor based on type */}
                    {selectedBlock.type === 'hero' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.content.title || ''}
                            onChange={(e) => updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, title: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.content.subtitle || ''}
                            onChange={(e) => updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, subtitle: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Background Gradient
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.content.backgroundGradient || ''}
                            onChange={(e) => updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, backgroundGradient: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                          />
                        </div>
                      </>
                    )}

                    {selectedBlock.type === 'text' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Heading
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.content.heading || ''}
                            onChange={(e) => updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, heading: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Body Text
                          </label>
                          <textarea
                            value={selectedBlock.content.body || ''}
                            onChange={(e) => updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, body: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                            rows={4}
                          />
                        </div>
                      </>
                    )}

                    {selectedBlock.type === 'cta-button' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.content.text || ''}
                            onChange={(e) => updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, text: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Button URL
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.content.url || ''}
                            onChange={(e) => updateBlock(selectedBlock.id, {
                              content: { ...selectedBlock.content, url: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                          />
                        </div>
                      </>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Styling</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Padding
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.styles?.padding || ''}
                            onChange={(e) => updateBlock(selectedBlock.id, {
                              styles: { ...selectedBlock.styles, padding: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                            placeholder="2rem"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Background Color
                          </label>
                          <input
                            type="text"
                            value={selectedBlock.styles?.backgroundColor || ''}
                            onChange={(e) => updateBlock(selectedBlock.id, {
                              styles: { ...selectedBlock.styles, backgroundColor: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Custom Code Mode */}
      {config.mode === 'custom' && (
        <div className="space-y-6">
          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-[#D91C81]" />
                    HTML Code
                  </CardTitle>
                  <CardDescription>
                    Custom HTML for your welcome page. The CTA button should navigate to /gifts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={config.custom.html}
                    onChange={(e) => updateCustomCode('html', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                    rows={20}
                    spellCheck={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="css" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#00B4CC]" />
                    CSS Styles
                  </CardTitle>
                  <CardDescription>
                    Custom CSS to style your welcome page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={config.custom.css}
                    onChange={(e) => updateCustomCode('css', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                    rows={20}
                    spellCheck={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="javascript" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-[#1B2A5E]" />
                    JavaScript
                  </CardTitle>
                  <CardDescription>
                    Custom JavaScript for interactivity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={config.custom.javascript}
                    onChange={(e) => updateCustomCode('javascript', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent font-mono text-sm"
                    rows={20}
                    spellCheck={false}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Note:</strong> Custom code mode gives you full control but requires HTML/CSS/JS knowledge. 
              Make sure your code is valid and secure. The page will be rendered in an isolated iframe.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}