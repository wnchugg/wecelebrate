import { useState, useEffect } from 'react';
import { RefreshCw, Mail, CheckCircle, Send, Eye, Edit, Trash2, Plus, X, Copy, Type, Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { apiRequest } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { EmailContentEditor } from '../../components/EmailContentEditor';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  type: 'transactional' | 'marketing' | 'system';
  category: string;
  subjectLine: string;
  preheaderText?: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  status: 'active' | 'draft' | 'archived';
  language: string;
  lastModified: string;
  modifiedBy?: string;
  usageCount?: number;
}

interface TemplateVariable {
  key: string;
  label: string;
  example: string;
  required: boolean;
}

const TEMPLATE_CATEGORIES = [
  { value: 'all', label: 'All Templates' },
  { value: 'authentication', label: 'Authentication' },
  { value: 'orders', label: 'Orders' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'reminders', label: 'Reminders' },
  { value: 'admin', label: 'Admin Notifications' }
];

const COMMON_VARIABLES: TemplateVariable[] = [
  { key: 'userName', label: 'User Name', example: 'John Smith', required: false },
  { key: 'userEmail', label: 'User Email', example: 'john@example.com', required: false },
  { key: 'companyName', label: 'Company Name', example: 'TechCorp Inc.', required: false },
  { key: 'siteName', label: 'Site Name', example: 'Holiday Gifts 2026', required: false },
  { key: 'orderNumber', label: 'Order Number', example: 'ORD-2026-001', required: false },
  { key: 'orderTotal', label: 'Order Total', example: '149.99', required: false },
  { key: 'giftName', label: 'Gift Name', example: 'Wireless Headphones', required: false },
  { key: 'trackingNumber', label: 'Tracking Number', example: '1Z999AA10123456784', required: false },
  { key: 'magicLink', label: 'Magic Link', example: 'https://app.jala2.com/access/magic-link?token=...', required: false },
  { key: 'expiryDate', label: 'Expiry Date', example: 'December 31, 2026', required: false },
  { key: 'supportEmail', label: 'Support Email', example: 'support@jala2.com', required: false },
  { key: 'logoUrl', label: 'Company Logo URL', example: 'https://example.com/logo.png', required: false }
];

const DEFAULT_TEMPLATES: Partial<EmailTemplate>[] = [
  {
    id: 'magic-link',
    name: 'Magic Link Email',
    description: 'Sent when user requests a magic link for authentication',
    type: 'transactional',
    category: 'authentication',
    subjectLine: 'Your Magic Link for {{siteName}}',
    preheaderText: 'Click here to access your gift selection',
    variables: ['userName', 'siteName', 'magicLink', 'expiryDate', 'supportEmail'],
    status: 'active',
    language: 'en'
  },
  {
    id: 'order-confirmation',
    name: 'Order Confirmation',
    description: 'Sent immediately after order is placed',
    type: 'transactional',
    category: 'orders',
    subjectLine: 'Order Confirmed: {{orderNumber}}',
    preheaderText: 'Thank you for your order!',
    variables: ['userName', 'orderNumber', 'giftName', 'orderTotal', 'companyName'],
    status: 'active',
    language: 'en'
  },
  {
    id: 'shipping-notification',
    name: 'Shipping Notification',
    description: 'Sent when order has been shipped',
    type: 'transactional',
    category: 'shipping',
    subjectLine: 'Your gift is on the way! 🚚',
    preheaderText: 'Track your shipment',
    variables: ['userName', 'orderNumber', 'giftName', 'trackingNumber', 'companyName'],
    status: 'active',
    language: 'en'
  },
  {
    id: 'delivery-confirmation',
    name: 'Delivery Confirmation',
    description: 'Sent when order has been delivered',
    type: 'transactional',
    category: 'shipping',
    subjectLine: 'Your gift has been delivered! 🎉',
    preheaderText: 'Enjoy your gift from {{companyName}}',
    variables: ['userName', 'giftName', 'companyName'],
    status: 'active',
    language: 'en'
  },
  {
    id: 'selection-reminder',
    name: 'Gift Selection Reminder',
    description: 'Sent as reminder when selection period is ending soon',
    type: 'transactional',
    category: 'reminders',
    subjectLine: 'Reminder: Select your gift by {{expiryDate}}',
    preheaderText: 'Don\'t miss out on your gift!',
    variables: ['userName', 'siteName', 'expiryDate', 'companyName', 'magicLink'],
    status: 'active',
    language: 'en'
  },
  {
    id: 'access-granted',
    name: 'Access Granted',
    description: 'Sent when employee is added to a gift site',
    type: 'transactional',
    category: 'authentication',
    subjectLine: 'You\'ve been invited to select a gift from {{companyName}}',
    preheaderText: 'Browse and choose your perfect gift',
    variables: ['userName', 'siteName', 'companyName', 'expiryDate', 'magicLink'],
    status: 'active',
    language: 'en'
  }
];

export function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<EmailTemplate | null>(null);
  const [testingTemplate, setTestingTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{ templates: EmailTemplate[] }>('/email-templates');
      
      // If no templates exist, initialize with defaults
      if (!response.templates || response.templates.length === 0) {
        const initializedTemplates = DEFAULT_TEMPLATES.map(t => ({
          ...t,
          htmlContent: getDefaultHtmlContent(t.id),
          textContent: getDefaultTextContent(t.id),
          lastModified: new Date().toISOString(),
          usageCount: 0
        } as EmailTemplate));
        
        setTemplates(initializedTemplates);
        
        // Save to backend
        for (const template of initializedTemplates) {
          await apiRequest('/email-templates', {
            method: 'POST',
            body: JSON.stringify(template)
          });
        }
      } else {
        setTemplates(response.templates);
      }
    } catch (error: unknown) {
      showErrorToast('Failed to load email templates', error instanceof Error ? error.message : 'Unknown error');
      // Fallback to defaults
      setTemplates(DEFAULT_TEMPLATES.map(t => ({
        ...t,
        htmlContent: getDefaultHtmlContent(t.id),
        textContent: getDefaultTextContent(t.id),
        lastModified: new Date().toISOString(),
        usageCount: 0
      } as EmailTemplate)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async (template: EmailTemplate) => {
    try {
      await apiRequest(`/email-templates/${template.id}`, {
        method: 'PUT',
        body: JSON.stringify(template)
      });
      
      setTemplates(templates.map(t => t.id === template.id ? template : t));
      showSuccessToast('Template saved successfully');
      setEditingTemplate(null);
    } catch (error: unknown) {
      showErrorToast('Failed to save template', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleTestEmail = async (template: EmailTemplate, testEmail: string) => {
    try {
      await apiRequest(`/email-templates/${template.id}/test`, {
        method: 'POST',
        body: JSON.stringify({ email: testEmail })
      });
      
      showSuccessToast(`Test email sent to ${testEmail}`);
      setTestingTemplate(null);
    } catch (error: unknown) {
      showErrorToast('Failed to send test email', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const duplicateTemplate = async (template: EmailTemplate) => {
    const duplicate: EmailTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      status: 'draft',
      lastModified: new Date().toISOString(),
      usageCount: 0
    };
    
    try {
      await apiRequest('/email-templates', {
        method: 'POST',
        body: JSON.stringify(duplicate)
      });
      
      setTemplates([...templates, duplicate]);
      showSuccessToast('Template duplicated successfully');
    } catch (error: unknown) {
      showErrorToast('Failed to duplicate template', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const exportTemplate = (template: EmailTemplate) => {
    const data = JSON.stringify(template, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.id}-template.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccessToast('Template exported successfully');
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subjectLine.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = templates.filter(t => t.status === 'active').length;
  const draftCount = templates.filter(t => t.status === 'draft').length;
  const totalUsage = templates.reduce((sum, t) => sum + (t.usageCount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D91C81] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading email templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Customize transactional and marketing emails
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTemplates}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                <p className="text-sm text-gray-600">Total Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
                <p className="text-sm text-gray-600">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalUsage.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
          >
            {TEMPLATE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="draft">Drafts Only</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </Card>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No templates found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">{template.name}</h3>
                      <Badge className={
                        template.status === 'active' ? 'bg-green-100 text-green-800' :
                        template.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {template.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Type className="w-3 h-3" />
                        Subject: {template.subjectLine}
                      </span>
                      {template.usageCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          Sent {template.usageCount} times
                        </span>
                      )}
                    </div>
                    
                    {/* Variables */}
                    {template.variables && template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.variables.slice(0, 5).map(varName => (
                          <Badge key={varName} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {'{{' + varName + '}}'}
                          </Badge>
                        ))}
                        {template.variables.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.variables.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewingTemplate(template)}
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTestingTemplate(template)}
                      title="Send Test"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateTemplate(template)}
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportTemplate(template)}
                      title="Export"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTemplate && (
        <TemplateEditor
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={handleSaveTemplate}
        />
      )}

      {/* Preview Modal */}
      {previewingTemplate && (
        <TemplatePreview
          template={previewingTemplate}
          onClose={() => setPreviewingTemplate(null)}
        />
      )}

      {/* Test Email Modal */}
      {testingTemplate && (
        <TestEmailDialog
          template={testingTemplate}
          onClose={() => setTestingTemplate(null)}
          onSend={handleTestEmail}
        />
      )}
    </div>
  );
}

// Template Editor Component
function TemplateEditor({
  template,
  onClose,
  onSave
}: {
  template: EmailTemplate;
  onClose: () => void;
  onSave: (template: EmailTemplate) => void;
}) {
  const [formData, setFormData] = useState<EmailTemplate>(template);
  const [activeTab, setActiveTab] = useState<'content' | 'html' | 'text' | 'settings'>('content');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const insertVariable = (variable: string) => {
    const placeholder = `{{${variable}}}`;
    setFormData({
      ...formData,
      htmlContent: formData.htmlContent + placeholder
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-[#D91C81]" />
            Edit Email Template
          </DialogTitle>
          <DialogDescription>
            Customize the email template content and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="text">Plain Text</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4">
              <div>
                <Label>Subject Line</Label>
                <Input
                  value={formData.subjectLine}
                  onChange={(e) => setFormData({ ...formData, subjectLine: e.target.value })}
                  placeholder="Your subject line..."
                />
              </div>

              <div>
                <Label>Preheader Text</Label>
                <Input
                  value={formData.preheaderText || ''}
                  onChange={(e) => setFormData({ ...formData, preheaderText: e.target.value })}
                  placeholder="Preview text that appears in inbox..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This appears as preview text in email clients
                </p>
              </div>

              {/* Visual Email Editor with HTML Toggle */}
              <EmailContentEditor
                content={formData.htmlContent}
                onChange={(html) => setFormData({ ...formData, htmlContent: html })}
                placeholder="Start creating your email..."
                availableVariables={COMMON_VARIABLES.map(v => v.key)}
                label="Email Content"
                showLabel={true}
              />
            </TabsContent>

            {/* HTML Tab */}
            <TabsContent value="html" className="space-y-4">
              <div>
                <Label>HTML Content</Label>
                <Textarea
                  value={formData.htmlContent}
                  onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Enter HTML content..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{{variableName}}'} for dynamic content
                </p>
              </div>
            </TabsContent>

            {/* Text Tab */}
            <TabsContent value="text" className="space-y-4">
              <div>
                <Label>Plain Text Content</Label>
                <Textarea
                  value={formData.textContent}
                  onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                  rows={20}
                  placeholder="Enter plain text fallback content..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Fallback for email clients that don't support HTML
                </p>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  >
                    {TEMPLATE_CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-base font-semibold">Active Status</Label>
                  <p className="text-sm text-gray-600">Make this template available for sending</p>
                </div>
                <Switch
                  checked={formData.status === 'active'}
                  onCheckedChange={(checked) => setFormData({ 
                    ...formData, 
                    status: checked ? 'active' : 'draft' 
                  })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#D91C81] hover:bg-[#B01669] text-white">
              Save Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Template Preview Component
function TemplatePreview({
  template,
  onClose
}: {
  template: EmailTemplate;
  onClose: () => void;
}) {
  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  useEffect(() => {
    // Generate sample data for all variables
    const sampleData: Record<string, string> = {};
    template.variables.forEach(varName => {
      const varDef = COMMON_VARIABLES.find(v => v.key === varName);
      sampleData[varName] = varDef?.example || `Sample ${varName}`;
    });
    setPreviewData(sampleData);
  }, [template]);

  const renderPreview = () => {
    let html = template.htmlContent;
    
    // Replace all variables with sample data
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    });
    
    return html;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#D91C81]" />
            Preview: {template.name}
          </DialogTitle>
          <DialogDescription>
            Preview how this email will look to recipients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Header Info */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Subject:</span>
              <span className="text-sm text-gray-900">{template.subjectLine}</span>
            </div>
            {template.preheaderText && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">Preheader:</span>
                <span className="text-sm text-gray-600">{template.preheaderText}</span>
              </div>
            )}
          </div>

          {/* Email Preview */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div 
              className="p-6 bg-white"
              dangerouslySetInnerHTML={{ __html: renderPreview() }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close Preview</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Test Email Dialog
function TestEmailDialog({
  template,
  onClose,
  onSend
}: {
  template: EmailTemplate;
  onClose: () => void;
  onSend: (template: EmailTemplate, email: string) => void;
}) {
  const [testEmail, setTestEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (testEmail && testEmail.includes('@')) {
      onSend(template, testEmail);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-[#D91C81]" />
            Send Test Email
          </DialogTitle>
          <DialogDescription>
            Send a test email to verify the template looks correct
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Test Email Address</Label>
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Template: {template.name}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#D91C81] hover:bg-[#B01669] text-white">
              <Send className="w-4 h-4 mr-2" />
              Send Test
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions for default content
function getDefaultHtmlContent(templateId: string): string {
  const baseStyle = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #D91C81;">
        <h1 style="color: #1B2A5E; margin: 0;">{{companyName}}</h1>
      </div>
      <div style="padding: 30px 20px;">
  `;
  
  const baseFooter = `
      </div>
      <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
        <p style="color: #6c757d; font-size: 12px; margin: 0;">
          © 2026 {{companyName}}. All rights reserved.
        </p>
      </div>
    </div>
  `;

  switch (templateId) {
    case 'magic-link':
      return baseStyle + `
        <h2 style="color: #1B2A5E;">Hello {{userName}}!</h2>
        <p>Click the button below to access your gift selection for {{siteName}}:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{magicLink}}" style="background-color: #D91C81; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Access Gift Selection
          </a>
        </div>
        <p style="color: #6c757d; font-size: 14px;">
          This link will expire on {{expiryDate}}.
        </p>
        <p style="color: #6c757d; font-size: 14px;">
          If you have any questions, contact us at {{supportEmail}}
        </p>
      ` + baseFooter;
      
    case 'order-confirmation':
      return baseStyle + `
        <h2 style="color: #1B2A5E;">Order Confirmed!</h2>
        <p>Hi {{userName}},</p>
        <p>Thank you for your order! Your gift is being prepared for shipment.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> {{orderNumber}}</p>
          <p style="margin: 5px 0;"><strong>Gift:</strong> {{giftName}}</p>
          <p style="margin: 5px 0;"><strong>Total:</strong> {{orderTotal}}</p>
        </div>
        <p>We'll send you a shipping notification once your order is on its way!</p>
      ` + baseFooter;
      
    case 'shipping-notification':
      return baseStyle + `
        <h2 style="color: #1B2A5E;">Your Gift is On the Way! 🚚</h2>
        <p>Hi {{userName}},</p>
        <p>Great news! Your order has shipped and is on its way to you.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> {{orderNumber}}</p>
          <p style="margin: 5px 0;"><strong>Gift:</strong> {{giftName}}</p>
          <p style="margin: 5px 0;"><strong>Tracking Number:</strong> {{trackingNumber}}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://tracking.example.com/{{trackingNumber}}" style="background-color: #D91C81; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Track Your Package
          </a>
        </div>
      ` + baseFooter;
      
    default:
      return baseStyle + `
        <h2 style="color: #1B2A5E;">Hello {{userName}}!</h2>
        <p>This is a template email from {{companyName}}.</p>
      ` + baseFooter;
  }
}

function getDefaultTextContent(templateId: string): string {
  switch (templateId) {
    case 'magic-link':
      return `Hello {{userName}}!\n\nClick the link below to access your gift selection for {{siteName}}:\n\n{{magicLink}}\n\nThis link will expire on {{expiryDate}}.\n\nIf you have any questions, contact us at {{supportEmail}}`;
      
    case 'order-confirmation':
      return `Order Confirmed!\n\nHi {{userName}},\n\nThank you for your order!\n\nOrder Number: {{orderNumber}}\nGift: {{giftName}}\nTotal: {{orderTotal}}\n\nWe'll send you a shipping notification once your order is on its way!`;
      
    case 'shipping-notification':
      return `Your Gift is On the Way!\n\nHi {{userName}},\n\nYour order has shipped!\n\nOrder Number: {{orderNumber}}\nGift: {{giftName}}\nTracking Number: {{trackingNumber}}`;
      
    default:
      return `Hello {{userName}}!\n\nThis is a template email from {{companyName}}.`;
  }
}