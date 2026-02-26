import { useState } from 'react';
import { 
  X, 
  Building2, 
  Globe,
  Sparkles,
  Check,
  ArrowRight,
  Palette,
  Link as LinkIcon
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/errorHandling';
import { apiRequest } from '../../utils/api';
import { getErrorMessage } from '../../utils/errorUtils';
import { logger } from '../../utils/logger';
import { sanitizeInput } from '../../utils/validators';
import type { CreateSiteFormData } from '../../../types';

interface CreateSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clients: Array<{ id: string; name: string }>;
}

const SITE_TEMPLATES = [
  { 
    id: 'gift-event', 
    name: 'Event Gifting', 
    description: 'For special events and occasions',
    icon: '🎁',
    useCase: 'Perfect for seasonal campaigns, holiday gifts, and special event recognition',
    features: [
      'Flexible gift selection periods',
      'Custom event branding',
      'Bulk ordering support',
      'Automated reminders'
    ],
    suggestedBranding: {
      primaryColor: '#D91C81',
      secondaryColor: '#6366F1',
      tertiaryColor: '#10B981'
    },
    defaultSettings: {
      validationMethod: 'email' as const,
      shippingMode: 'individual' as const
    }
  },
  { 
    id: 'service-awards', 
    name: 'Service Awards', 
    description: 'For employee anniversaries',
    icon: '🏆',
    useCase: 'Recognize employee milestones and service anniversaries automatically',
    features: [
      'Automated anniversary tracking',
      'Milestone-based catalogs',
      'Service year badges',
      'Personalized messages'
    ],
    suggestedBranding: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
      tertiaryColor: '#F59E0B'
    },
    defaultSettings: {
      validationMethod: 'employee_id' as const,
      shippingMode: 'individual' as const
    }
  },
  { 
    id: 'hybrid', 
    name: 'Hybrid', 
    description: 'Both events and service awards',
    icon: '⚡',
    useCase: 'Comprehensive recognition platform for all types of celebrations',
    features: [
      'Multi-purpose catalogs',
      'Flexible validation methods',
      'Advanced reporting',
      'Custom workflows'
    ],
    suggestedBranding: {
      primaryColor: '#D91C81',
      secondaryColor: '#8B5CF6',
      tertiaryColor: '#06B6D4'
    },
    defaultSettings: {
      validationMethod: 'email' as const,
      shippingMode: 'individual' as const
    }
  },
];

const VALIDATION_METHODS: Array<CreateSiteFormData['validationMethod']> = [
  'email',
  'employee_id',
  'serial_card',
  'magic_link',
];

const SHIPPING_MODES: Array<CreateSiteFormData['shippingMode']> = [
  'individual',
  'bulk',
  'store_pickup',
];

export function CreateSiteModal({ isOpen, onClose, onSuccess, clients }: CreateSiteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(SITE_TEMPLATES[0]);
  const [formData, setFormData] = useState<CreateSiteFormData>({
    name: '',
    clientId: '',
    domain: '',
    templateId: selectedTemplate?.id,
    type: selectedTemplate?.id || 'custom',
    validationMethod: 'email',
    shippingMode: 'individual',
    branding: {
      primaryColor: '#D91C81',
      secondaryColor: '#6366F1',
      accentColor: '#10B981',
    },
  });

  const handleTemplateSelect = (template: typeof SITE_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      templateId: template.id,
      type: template.id || 'custom',
      branding: {
        primaryColor: template.suggestedBranding.primaryColor,
        secondaryColor: template.suggestedBranding.secondaryColor,
        accentColor: template.suggestedBranding.tertiaryColor,
      },
      validationMethod: template.defaultSettings.validationMethod,
      shippingMode: template.defaultSettings.shippingMode,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest<{ success: boolean; site?: any; error?: string }>('/api/sites', { method: 'POST', body: JSON.stringify(formData) });
      if (response.success) {
        showSuccessToast('Site created successfully!');
        onSuccess();
      } else {
        showErrorToast('Failed to create site. Please try again.');
      }
    } catch (error) {
      logger.error('Error creating site:', error);
      showErrorToast(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create New Site
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {step + 1} of 4
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            <div className={`flex-1 h-2 rounded-full ${step >= 0 ? 'bg-[#D91C81]' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-[#D91C81]' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-[#D91C81]' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 3 ? 'bg-[#D91C81]' : 'bg-gray-200'}`} />
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex-1 overflow-y-auto">
          {/* Step 0: Template Selection */}
          {step === 0 && (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#D91C81]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Choose a Template</h3>
                  <p className="text-sm text-gray-600">Start with a pre-configured site template</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SITE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className={`relative text-left p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                      selectedTemplate?.id === template.id
                        ? 'border-[#D91C81] bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[#D91C81] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-3xl">{template.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Use Case</p>
                      <p className="text-sm text-gray-700">{template.useCase}</p>
                    </div>

                    <div className="space-y-1">
                      {template.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#D91C81] rounded-full" />
                          <p className="text-xs text-gray-600">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[#D91C81]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Basic Information</h3>
                  <p className="text-sm text-gray-600">Set up the site details</p>
                </div>
              </div>

              {selectedTemplate && (
                <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl p-4 border border-pink-100">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{selectedTemplate.icon}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Selected: {selectedTemplate.name}</p>
                      <p className="text-xs text-gray-600">{selectedTemplate.description}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="site-name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Name *
                </label>
                <input
                  id="site-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: sanitizeInput(e.target.value) })}
                  placeholder="e.g., TechCorp Employee Gifts 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                />
              </div>

              <div>
                <label htmlFor="site-client" className="block text-sm font-semibold text-gray-700 mb-2">
                  Client Name *
                </label>
                <select
                  id="site-client"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="site-domain" className="block text-sm font-semibold text-gray-700 mb-2">
                  Domain *
                </label>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-gray-400" />
                  <input
                    id="site-domain"
                    type="text"
                    required
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: sanitizeInput(e.target.value) })}
                    placeholder="techcorp-gifts.wecelebrate.com"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {step === 2 && (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Palette className="w-6 h-6 text-[#D91C81]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Branding</h3>
                  <p className="text-sm text-gray-600">Customize the site appearance</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="site-primary-color-text" className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      aria-label="Primary color picker"
                      value={formData.branding.primaryColor}
                      onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, primaryColor: e.target.value } })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      id="site-primary-color-text"
                      type="text"
                      value={formData.branding.primaryColor}
                      onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, primaryColor: e.target.value } })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="site-secondary-color-text" className="block text-sm font-semibold text-gray-700 mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      aria-label="Secondary color picker"
                      value={formData.branding.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, secondaryColor: e.target.value } })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      id="site-secondary-color-text"
                      type="text"
                      value={formData.branding.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, secondaryColor: e.target.value } })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="site-accent-color-text" className="block text-sm font-semibold text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      aria-label="Accent color picker"
                      value={formData.branding.accentColor}
                      onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, accentColor: e.target.value } })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      id="site-accent-color-text"
                      type="text"
                      value={formData.branding.accentColor}
                      onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, accentColor: e.target.value } })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">Color Preview</p>
                <div className="flex gap-3">
                  <div className="flex-1 h-16 rounded-lg" style={{ backgroundColor: formData.branding.primaryColor }} />
                  <div className="flex-1 h-16 rounded-lg" style={{ backgroundColor: formData.branding.secondaryColor }} />
                  <div className="flex-1 h-16 rounded-lg" style={{ backgroundColor: formData.branding.accentColor }} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {step === 3 && (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-[#D91C81]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Site Settings</h3>
                  <p className="text-sm text-gray-600">Configure site behavior</p>
                </div>
              </div>

              <div>
                <label htmlFor="site-validation-method" className="block text-sm font-semibold text-gray-700 mb-2">
                  Validation Method
                </label>
                <select
                  id="site-validation-method"
                  value={formData.validationMethod}
                  onChange={(e) => setFormData({ ...formData, validationMethod: e.target.value as 'email' | 'employee_id' | 'serial_card' | 'magic_link' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="email">Email Address</option>
                  <option value="employee_id">Employee ID</option>
                  <option value="serial_card">Serial Card Number</option>
                  <option value="magic_link">Magic Link</option>
                </select>
              </div>

              <div>
                <label htmlFor="site-shipping-mode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Shipping Mode
                </label>
                <select
                  id="site-shipping-mode"
                  value={formData.shippingMode}
                  onChange={(e) => setFormData({ ...formData, shippingMode: e.target.value as 'individual' | 'bulk' | 'store_pickup' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="individual">Allow Employee to Choose</option>
                  <option value="bulk">Ship to Company Address</option>
                  <option value="store_pickup">Ship to Store Address</option>
                </select>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => step === 0 ? onClose() : setStep(step - 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex gap-2">
            {step === 0 && (
              <button
                type="button"
                disabled={!selectedTemplate}
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step > 0 && step < 3 && (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all"
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                onClick={(e) => void handleSubmit(e as React.FormEvent)}
                className="px-6 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all"
              >
                Create Site
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}