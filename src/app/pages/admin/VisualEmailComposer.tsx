import React, { useState } from 'react';
import { Eye, Code, Wand2, Save, X } from 'lucide-react';
import { RichTextEditor } from '../../components/RichTextEditor';

interface EmailTemplate {
  id?: string;
  name: string;
  type: string;
  category: 'transactional' | 'marketing' | 'notification';
  defaultSubject: string;
  defaultHtmlContent: string;
  defaultTextContent: string;
  defaultSmsContent?: string;
  defaultPushTitle?: string;
  defaultPushBody?: string;
  description?: string;
}

interface VisualEmailComposerProps {
  template: Partial<EmailTemplate>;
  availableVariables: string[];
  onSave: (template: Partial<EmailTemplate>) => void;
  onCancel: () => void;
}

export function VisualEmailComposer({
  template,
  availableVariables,
  onSave,
  onCancel,
}: VisualEmailComposerProps) {
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({
    name: template.name || '',
    type: template.type || '',
    category: template.category || 'transactional',
    description: template.description || '',
    defaultSubject: template.defaultSubject || '',
    defaultHtmlContent: template.defaultHtmlContent || '',
    defaultTextContent: template.defaultTextContent || '',
    defaultSmsContent: template.defaultSmsContent || '',
    defaultPushTitle: template.defaultPushTitle || '',
    defaultPushBody: template.defaultPushBody || '',
  });

  const [editMode, setEditMode] = useState<'visual' | 'code'>('visual');
  const [previewMode, setPreviewMode] = useState(false);

  // Generate text content from HTML
  const generateTextContent = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const handleHtmlChange = (html: string) => {
    setFormData((prev) => ({
      ...prev,
      defaultHtmlContent: html,
      defaultTextContent: generateTextContent(html),
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  // Generate preview HTML with styles
  const getPreviewHtml = () => {
    let html = formData.defaultHtmlContent || '';
    
    // Replace variables with example values for preview
    availableVariables.forEach((variable) => {
      const exampleValues: Record<string, string> = {
        userName: 'John Doe',
        employeeName: 'John Doe',
        companyName: 'ACME Corporation',
        siteName: 'Employee Recognition Program',
        giftName: 'Premium Wireless Headphones',
        orderNumber: 'ORD-2026-123456',
        trackingNumber: '1Z999AA10123456784',
        carrier: 'UPS',
        anniversaryDate: 'March 15, 2026',
        yearsOfService: '5',
        expiryDate: 'December 31, 2026',
        daysRemaining: '7',
        magicLink: 'https://example.com/select',
        supportEmail: 'support@example.com',
      };

      const regex = new RegExp(`{{${variable}}}`, 'g');
      html = html.replace(regex, exampleValues[variable] || `[${variable}]`);
    });

    // Wrap in email-friendly template
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #374151;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .email-container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 32px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            h1 { color: #1B2A5E; font-size: 28px; margin-top: 0; }
            h2 { color: #1B2A5E; font-size: 24px; }
            h3 { color: #1B2A5E; font-size: 20px; }
            a { color: #D91C81; text-decoration: none; }
            a:hover { color: #B71569; text-decoration: underline; }
            .btn {
              display: inline-block;
              background-color: #D91C81;
              color: #ffffff;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              margin: 16px 0;
            }
            .btn:hover {
              background-color: #B71569;
            }
            blockquote {
              border-left: 4px solid #D91C81;
              padding-left: 16px;
              margin-left: 0;
              font-style: italic;
              color: #6b7280;
            }
            code {
              background-color: #f3f4f6;
              color: #D91C81;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: Monaco, 'Courier New', monospace;
            }
            .footer {
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            ${html}
            <div class="footer">
              <p>This is a preview. Actual emails may appear differently in various email clients.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Visual Email Composer</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create beautiful emails with the visual editor
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                placeholder="e.g., Welcome Email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as 'transactional' | 'marketing' | 'notification',
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              >
                <option value="transactional">Transactional</option>
                <option value="marketing">Marketing</option>
                <option value="notification">Notification</option>
              </select>
            </div>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={formData.defaultSubject}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, defaultSubject: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              placeholder="e.g., Welcome to {{companyName}}!"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use variables like {'{{userName}}'} to personalize
            </p>
          </div>

          {/* Editor Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode('visual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                editMode === 'visual'
                  ? 'bg-[#D91C81] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              Visual Editor
            </button>
            <button
              onClick={() => setEditMode('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                editMode === 'code'
                  ? 'bg-[#D91C81] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Code className="w-4 h-4" />
              HTML Code
            </button>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                previewMode
                  ? 'bg-[#D91C81] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Hide' : 'Show'} Preview
            </button>
          </div>

          {/* Available Variables */}
          {!previewMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Available Variables</h3>
              <div className="flex flex-wrap gap-2">
                {availableVariables.map((variable) => (
                  <code
                    key={variable}
                    className="text-xs bg-white border border-blue-300 px-2 py-1 rounded text-[#D91C81]"
                  >
                    {'{{' + variable + '}}'}
                  </code>
                ))}
              </div>
            </div>
          )}

          {/* Editor / Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Area */}
            {!previewMode && (
              <div className="lg:col-span-2">
                {editMode === 'visual' ? (
                  <RichTextEditor
                    content={formData.defaultHtmlContent || ''}
                    onChange={handleHtmlChange}
                    placeholder="Start composing your email..."
                    availableVariables={availableVariables}
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HTML Content
                    </label>
                    <textarea
                      value={formData.defaultHtmlContent}
                      onChange={(e) => handleHtmlChange(e.target.value)}
                      className="w-full h-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono text-sm"
                      placeholder="<div>Your HTML here...</div>"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Preview Area */}
            {previewMode && (
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 text-sm text-gray-600">
                      <strong>Subject:</strong> {formData.defaultSubject || '(No subject)'}
                    </div>
                    <iframe
                      srcDoc={getPreviewHtml()}
                      className="w-full h-[500px] border-0"
                      title="Email Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Text Content (Auto-generated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plain Text Version
              <span className="text-xs text-gray-500 ml-2">(auto-generated from HTML)</span>
            </label>
            <textarea
              value={formData.defaultTextContent}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, defaultTextContent: e.target.value }))
              }
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none text-sm"
              placeholder="Plain text version..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            {editMode === 'visual' ? (
              <span className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#D91C81]" />
                Using Visual Editor
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#D91C81]" />
                Using HTML Code
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91669] transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}