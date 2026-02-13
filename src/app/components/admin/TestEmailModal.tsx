import { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle, Loader2, User, Mail as MailIcon, Building, Package, Truck, Calendar } from 'lucide-react';
import { SiteTemplate } from '../../types/emailTemplates';
import { toast } from 'sonner';
import { sendTestEmail } from '../../services/emailTemplateApi';

interface TestEmailModalProps {
  template: SiteTemplate;
  onClose: () => void;
}

const SAMPLE_VARIABLES: Record<string, string> = {
  userName: 'John Smith',
  userEmail: 'john.smith@example.com',
  companyName: 'Acme Corporation',
  siteName: 'Holiday Celebration 2026',
  orderNumber: 'ORD-2026-001234',
  orderTotal: '$149.99',
  giftName: 'Premium Wireless Headphones',
  trackingNumber: '1Z999AA10123456784',
  magicLink: 'https://app.wecelebrate.com/access/abc123xyz',
  expiryDate: 'December 31, 2026',
  supportEmail: 'support@wecelebrate.com',
  logoUrl: 'https://example.com/logo.png',
};

const VARIABLE_ICONS: Record<string, any> = {
  userName: User,
  userEmail: MailIcon,
  companyName: Building,
  giftName: Package,
  trackingNumber: Truck,
  expiryDate: Calendar,
};

export function TestEmailModal({ template, onClose }: TestEmailModalProps) {
  const [testEmail, setTestEmail] = useState('');
  const [customVariables, setCustomVariables] = useState<Record<string, string>>(SAMPLE_VARIABLES);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Extract variables from template content
  const extractVariables = (): string[] => {
    const variables = new Set<string>();
    const regex = /\{\{(\w+)\}\}/g;
    
    [template.subject, template.htmlContent, template.textContent].forEach(content => {
      if (content) {
        let match;
        while ((match = regex.exec(content)) !== null) {
          variables.add(match[1]);
        }
      }
    });

    return Array.from(variables);
  };

  const templateVariables = extractVariables();

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      toast.error('Please enter a test email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    setSendStatus('idle');
    setErrorMessage('');

    try {
      await sendTestEmail(template.id, testEmail, customVariables);
      setSendStatus('success');
      toast.success(`Test email sent to ${testEmail}`);
    } catch (error: unknown) {
      setSendStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send test email');
      toast.error(error instanceof Error ? error.message : 'Failed to send test email');
    } finally {
      setIsSending(false);
    }
  };

  const previewContent = (content: string): string => {
    let preview = content;
    Object.entries(customVariables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      preview = preview.replace(regex, `<span class="bg-yellow-100 px-1 font-semibold">${value}</span>`);
    });
    return preview;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Send className="w-6 h-6 text-[#D91C81]" />
              Test Email: {template.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Send a test email to verify the template looks correct
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Test Email Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Send Test Email To
            </label>
            <div className="flex gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendTest();
                  }
                }}
              />
              <button
                onClick={handleSendTest}
                disabled={isSending}
                className="inline-flex items-center gap-2 bg-[#D91C81] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#B71569] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Test
                  </>
                )}
              </button>
            </div>

            {/* Send Status */}
            {sendStatus === 'success' && (
              <div className="mt-3 flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Test email sent successfully!</p>
                  <p className="text-xs text-green-700 mt-1">Check your inbox at {testEmail}</p>
                </div>
              </div>
            )}

            {sendStatus === 'error' && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Failed to send test email</p>
                  <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Template Variables */}
          {templateVariables.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Template Variables
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Customize the sample data that will be used in the test email
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templateVariables.map((varName) => {
                  const Icon = VARIABLE_ICONS[varName] || User;
                  return (
                    <div key={varName} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        {varName}
                      </label>
                      <input
                        type="text"
                        value={customVariables[varName] || ''}
                        onChange={(e) =>
                          setCustomVariables({
                            ...customVariables,
                            [varName]: e.target.value,
                          })
                        }
                        placeholder={`Enter ${varName}...`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none text-sm"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Email Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Preview</h3>

            {/* Subject Line */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Subject Line</label>
              <div
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-900"
                dangerouslySetInnerHTML={{ __html: previewContent(template.subject) }}
              />
            </div>

            {/* HTML Preview */}
            {template.emailEnabled && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email Body</label>
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 max-h-96 overflow-auto">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewContent(template.htmlContent) }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">About Test Emails</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Test emails use sample data to show how the template will look</li>
                  <li>Highlighted text shows where variables are replaced</li>
                  <li>Test emails are sent via your configured email service (Resend)</li>
                  <li>Test emails don't count toward usage statistics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}