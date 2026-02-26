import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Eye, Copy } from 'lucide-react';
import { useEmailTemplates } from '../../hooks/usePhase5A';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import type { EmailTemplate } from '../../lib/apiClientPhase5A';

export function EmailTemplatesManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEvent, setFilterEvent] = useState<string>('all');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate } = useEmailTemplates({
    templateType: filterType === 'all' ? undefined : filterType,
    eventType: filterEvent === 'all' ? undefined : filterEvent,
  });

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const templateData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      templateType: formData.get('templateType') as 'global' | 'site' | 'client',
      eventType: formData.get('eventType') as string,
      subject: formData.get('subject') as string,
      bodyHtml: formData.get('bodyHtml') as string,
      bodyText: formData.get('bodyText') as string,
      fromName: formData.get('fromName') as string,
      fromEmail: formData.get('fromEmail') as string,
      status: (formData.get('status') as string) || 'active',
    };

    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
        showSuccessToast('Template updated successfully');
      } else {
        await createTemplate(templateData);
        showSuccessToast('Template created successfully');
      }
      setShowTemplateModal(false);
      setEditingTemplate(null);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to save template');
    }
  };

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete "${templateName}"?`)) return;

    setIsDeleting(true);
    try {
      await deleteTemplate(templateId);
      showSuccessToast(`"${templateName}" deleted successfully`);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      await createTemplate({
        ...template,
        name: `${template.name} (Copy)`,
        isDefault: false,
      });
      showSuccessToast('Template duplicated successfully');
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to duplicate template');
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setShowTemplateModal(true);
  };

  const openEditModal = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowTemplateModal(true);
  };

  const openPreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading templates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Templates</h1>
        <p className="text-gray-600">Manage email templates for automated notifications</p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Types</option>
          <option value="global">Global</option>
          <option value="site">Site</option>
          <option value="client">Client</option>
        </select>

        <select
          value={filterEvent}
          onChange={(e) => setFilterEvent(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Events</option>
          <option value="order_confirmation">Order Confirmation</option>
          <option value="shipping_notification">Shipping Notification</option>
          <option value="delivery_confirmation">Delivery Confirmation</option>
          <option value="employee_added">Employee Welcome</option>
        </select>

        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  {template.isDefault && (
                    <Badge variant="default">Default</Badge>
                  )}
                  <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                    {template.status}
                  </Badge>
                  <Badge variant="outline">{template.templateType}</Badge>
                </div>

                {template.description && (
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Event:</span>{' '}
                    <span className="text-gray-900">{template.eventType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Subject:</span>{' '}
                    <span className="text-gray-900">{template.subject}</span>
                  </div>
                  {template.fromName && (
                    <div>
                      <span className="text-gray-500">From:</span>{' '}
                      <span className="text-gray-900">{template.fromName}</span>
                    </div>
                  )}
                  {template.fromEmail && (
                    <div>
                      <span className="text-gray-500">Email:</span>{' '}
                      <span className="text-gray-900">{template.fromEmail}</span>
                    </div>
                  )}
                </div>

                {template.variables && template.variables.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">Variables: </span>
                    <div className="inline-flex flex-wrap gap-1 mt-1">
                      {template.variables.map((variable) => (
                        <code key={variable} className="px-2 py-1 bg-gray-100 text-xs rounded">
                          {`{{${variable}}}`}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPreview(template)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleDuplicate(template)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(template)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleDelete(template.id, template.name)}
                  disabled={isDeleting || template.isDefault}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">Create your first email template</p>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
            <DialogDescription>
              {editingTemplate ? 'Update email template' : 'Add a new email template'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => void handleCreateOrUpdate(e)}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingTemplate?.name}
                    required
                    placeholder="e.g., Order Confirmation"
                  />
                </div>

                <div>
                  <Label htmlFor="eventType">Event Type *</Label>
                  <select
                    id="eventType"
                    name="eventType"
                    defaultValue={editingTemplate?.eventType}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="order_confirmation">Order Confirmation</option>
                    <option value="shipping_notification">Shipping Notification</option>
                    <option value="delivery_confirmation">Delivery Confirmation</option>
                    <option value="employee_added">Employee Welcome</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={editingTemplate?.description}
                  placeholder="Brief description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateType">Template Type *</Label>
                  <select
                    id="templateType"
                    name="templateType"
                    defaultValue={editingTemplate?.templateType || 'global'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="global">Global</option>
                    <option value="site">Site-Specific</option>
                    <option value="client">Client-Specific</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={editingTemplate?.status || 'active'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  defaultValue={editingTemplate?.subject}
                  required
                  placeholder="e.g., Your Order Confirmation - {{orderNumber}}"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    name="fromName"
                    defaultValue={editingTemplate?.fromName}
                    placeholder="e.g., WeCelebrate"
                  />
                </div>

                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    name="fromEmail"
                    type="email"
                    defaultValue={editingTemplate?.fromEmail}
                    placeholder="e.g., noreply@wecelebrate.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bodyHtml">HTML Body *</Label>
                <Textarea
                  id="bodyHtml"
                  name="bodyHtml"
                  defaultValue={editingTemplate?.bodyHtml}
                  required
                  placeholder="<html><body>...</body></html>"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="bodyText">Plain Text Body</Label>
                <Textarea
                  id="bodyText"
                  name="bodyText"
                  defaultValue={editingTemplate?.bodyText}
                  placeholder="Plain text version of the email"
                  rows={6}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-2">
                  {['userName', 'orderNumber', 'giftName', 'orderTotal', 'trackingNumber', 'companyName'].map((v) => (
                    <code key={v} className="px-2 py-1 bg-white text-xs rounded border border-blue-200">
                      {`{{${v}}}`}
                    </code>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowTemplateModal(false);
                  setEditingTemplate(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>Preview of the email template</DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Subject</Label>
                <div className="p-3 bg-gray-50 rounded border">{previewTemplate.subject}</div>
              </div>

              <div>
                <Label>HTML Preview</Label>
                <div className="border rounded-lg p-4 bg-white">
                  <iframe
                    srcDoc={previewTemplate.bodyHtml}
                    className="w-full h-96 border-0"
                    title="Email Preview"
                  />
                </div>
              </div>

              {previewTemplate.bodyText && (
                <div>
                  <Label>Plain Text</Label>
                  <pre className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                    {previewTemplate.bodyText}
                  </pre>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowPreviewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
