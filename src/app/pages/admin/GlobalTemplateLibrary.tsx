import { useState, useEffect } from 'react';
import { 
  Mail, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Code,
  Bell,
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useEmailTemplate } from '../../context/EmailTemplateContext';
import { GlobalTemplate } from '../../types/emailTemplates';
import { toast } from 'sonner';
import { EmailContentEditor } from '../../components/EmailContentEditor';

export default function GlobalTemplateLibrary() {
  const { 
    globalTemplates, 
    refreshGlobalTemplates, 
    seedGlobalTemplates,
    isLoadingGlobal 
  } = useEmailTemplate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; template: GlobalTemplate | null }>(
{
    open: false,
    template: null,
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; template: GlobalTemplate | null }>({
    open: false,
    template: null,
  });
  const [createDialog, setCreateDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    defaultSubject: '',
    defaultHtmlContent: '',
    defaultTextContent: '',
    defaultPushTitle: '',
    defaultPushBody: '',
    defaultSmsContent: '',
  });
  const [createFormData, setCreateFormData] = useState({
    type: '',
    name: '',
    description: '',
    category: 'transactional' as 'transactional' | 'marketing' | 'system',
    defaultSubject: '',
    defaultHtmlContent: '',
    defaultTextContent: '',
    defaultPushTitle: '',
    defaultPushBody: '',
    defaultSmsContent: '',
    variables: [] as string[],
  });

  // Load templates on mount
  useEffect(() => {
    refreshGlobalTemplates();
  }, []);

  // Filter templates
  const filteredTemplates = globalTemplates.filter((template) => {
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handlePreview = (template: GlobalTemplate) => {
    setPreviewDialog({ open: true, template });
  };

  const handleEdit = (template: GlobalTemplate) => {
    setEditDialog({ open: true, template });
    setEditFormData({
      name: template.name,
      description: template.description,
      defaultSubject: template.defaultSubject,
      defaultHtmlContent: template.defaultHtmlContent,
      defaultTextContent: template.defaultTextContent,
      defaultPushTitle: template.defaultPushTitle,
      defaultPushBody: template.defaultPushBody,
      defaultSmsContent: template.defaultSmsContent,
    });
  };

  const handleDuplicate = (template: GlobalTemplate) => {
    toast.success(`Template "${template.name}" duplicated`);
    // In a real implementation, this would create a copy
  };

  const handleDelete = (template: GlobalTemplate) => {
    if (template.isSystem) {
      toast.error('System templates cannot be deleted');
      return;
    }
    toast.success(`Template "${template.name}" deleted`);
    // In a real implementation, this would delete the template
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transactional':
        return <Mail className="w-4 h-4" />;
      case 'marketing':
        return <MessageSquare className="w-4 h-4" />;
      case 'system':
        return <Bell className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transactional':
        return 'bg-blue-100 text-blue-700';
      case 'marketing':
        return 'bg-purple-100 text-purple-700';
      case 'system':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Template Library</h1>
          <p className="text-gray-600">
            Manage master email, SMS, and push notification templates used across all sites
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={refreshGlobalTemplates}
            disabled={isLoadingGlobal}
            className="hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingGlobal ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {globalTemplates.length === 0 && (
            <Button 
              onClick={seedGlobalTemplates}
              disabled={isLoadingGlobal}
              className="bg-[#D91C81] hover:bg-[#B01566] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Seed Templates
            </Button>
          )}
        </div>
      </div>

      {/* Info Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p key="info-1" className="text-sm text-gray-700">
                <strong>Global templates</strong> are master templates that serve as defaults for all sites.
                Sites can customize these templates to fit their specific needs, but changes here will update
                the defaults for new site configurations.
              </p>
              <p key="info-2" className="text-sm text-gray-600">
                Templates marked as <Badge variant="secondary" className="text-xs">System</Badge> are
                core templates required for platform functionality and cannot be deleted.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{globalTemplates.length}</p>
              </div>
              <FileText className="w-8 h-8 text-[#D91C81]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transactional</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalTemplates.filter((t) => t.category === 'transactional').length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Marketing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalTemplates.filter((t) => t.category === 'marketing').length}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">System</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalTemplates.filter((t) => t.isSystem).length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates by name, type, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-[#D91C81] hover:bg-[#B01566] text-white" onClick={() => setCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTemplates.map((template) => {
            const isExpanded = expandedTemplate === template.id;

            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                          <Badge className={getCategoryColor(template.category)}>
                            {getCategoryIcon(template.category)}
                            <span className="ml-1.5 capitalize">{template.category}</span>
                          </Badge>
                          {template.isSystem && (
                            <Badge variant="secondary" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Type: <span className="font-medium">{template.type}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated: {new Date(template.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(template)}
                          className="hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          className="hover:bg-gray-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicate(template)}
                          className="hover:bg-gray-50"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {!template.isSystem && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(template)}
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="pt-4 border-t space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Default Subject Line
                          </Label>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                            {template.defaultSubject}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                              Push Notification
                            </Label>
                            <div className="bg-gray-50 p-3 rounded border space-y-2">
                              <p className="text-xs text-gray-500">Title:</p>
                              <p className="text-sm text-gray-900">{template.defaultPushTitle}</p>
                              <p className="text-xs text-gray-500 mt-2">Body:</p>
                              <p className="text-sm text-gray-900">{template.defaultPushBody}</p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                              SMS Content
                            </Label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                              {template.defaultSmsContent}
                            </p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Available Variables
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {template.variables.map((variable) => (
                              <Badge
                                key={variable.key}
                                variant="outline"
                                className="text-xs font-mono bg-white"
                              >
                                {`{{${variable.key}}}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewDialog.open} onOpenChange={(open) => setPreviewDialog({ open, template: null })}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview: {previewDialog.template?.name}</DialogTitle>
            <DialogDescription>
              Preview of the HTML email content. Variables shown with example values.
            </DialogDescription>
          </DialogHeader>
          {previewDialog.template && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Subject Line</Label>
                <p className="text-sm bg-gray-50 p-3 rounded border">
                  {previewDialog.template.defaultSubject}
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">HTML Content</Label>
                <div
                  className="border rounded p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: previewDialog.template.defaultHtmlContent }}
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block">Plain Text Version</Label>
                <pre className="text-xs bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                  {previewDialog.template.defaultTextContent}
                </pre>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialog({ open: false, template: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, template: null })}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template: {editDialog.template?.name}</DialogTitle>
            <DialogDescription>
              Update the master template. Sites using this template can override these defaults.
            </DialogDescription>
          </DialogHeader>
          {editDialog.template && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Template Name</Label>
                  <Input 
                    id="edit-name" 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Input id="edit-type" defaultValue={editDialog.template.type} disabled />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={2} 
                />
              </div>

              <div>
                <Label htmlFor="edit-subject">Default Subject Line</Label>
                <Input 
                  id="edit-subject" 
                  value={editFormData.defaultSubject} 
                  onChange={(e) => setEditFormData({ ...editFormData, defaultSubject: e.target.value })}
                />
              </div>

              {/* Visual Email Editor with HTML Toggle */}
              <EmailContentEditor
                content={editFormData.defaultHtmlContent}
                onChange={(html) => setEditFormData({ ...editFormData, defaultHtmlContent: html })}
                label="HTML Content"
                availableVariables={editDialog.template.variables.map(v => v.key)}
              />

              <div>
                <Label htmlFor="edit-text">Plain Text Content</Label>
                <Textarea
                  id="edit-text"
                  value={editFormData.defaultTextContent}
                  onChange={(e) => setEditFormData({ ...editFormData, defaultTextContent: e.target.value })}
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-push-title">Push Notification Title</Label>
                  <Input 
                    id="edit-push-title" 
                    value={editFormData.defaultPushTitle}
                    onChange={(e) => setEditFormData({ ...editFormData, defaultPushTitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-push-body">Push Notification Body</Label>
                  <Input 
                    id="edit-push-body" 
                    value={editFormData.defaultPushBody}
                    onChange={(e) => setEditFormData({ ...editFormData, defaultPushBody: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-sms">SMS Content</Label>
                <Textarea
                  id="edit-sms"
                  value={editFormData.defaultSmsContent}
                  onChange={(e) => setEditFormData({ ...editFormData, defaultSmsContent: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-gray-700">
                  <strong>Available Variables:</strong>
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editDialog.template.variables.map((variable) => (
                    <Badge key={variable.key} variant="outline" className="text-xs font-mono">
                      {`{{${variable.key}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, template: null })}>
              Cancel
            </Button>
            <Button
              className="bg-[#D91C81] hover:bg-[#B01566] text-white"
              onClick={() => {
                toast.success('Template updated successfully');
                setEditDialog({ open: false, template: null });
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Global Template</DialogTitle>
            <DialogDescription>
              Create a new master template that can be used across all sites
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-type">Template Type *</Label>
                <Input 
                  id="create-type" 
                  value={createFormData.type}
                  onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value })}
                  placeholder="e.g., custom_notification"
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier for this template type</p>
              </div>
              <div>
                <Label htmlFor="create-category">Category *</Label>
                <Select 
                  value={createFormData.category} 
                  onValueChange={(value: any) => setCreateFormData({ ...createFormData, category: value })}
                >
                  <SelectTrigger id="create-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="create-name">Template Name *</Label>
              <Input 
                id="create-name" 
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                placeholder="e.g., Custom Notification Template"
              />
            </div>

            <div>
              <Label htmlFor="create-description">Description *</Label>
              <Textarea 
                id="create-description" 
                value={createFormData.description}
                onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                rows={2}
                placeholder="Brief description of when this template is used..."
              />
            </div>

            <div>
              <Label htmlFor="create-subject">Default Subject Line *</Label>
              <Input 
                id="create-subject" 
                value={createFormData.defaultSubject} 
                onChange={(e) => setCreateFormData({ ...createFormData, defaultSubject: e.target.value })}
                placeholder="e.g., Important Update from {{company_name}}"
              />
            </div>

            {/* Visual Email Editor with HTML Toggle */}
            <EmailContentEditor
              content={createFormData.defaultHtmlContent}
              onChange={(html) => setCreateFormData({ ...createFormData, defaultHtmlContent: html })}
              label="HTML Content *"
              availableVariables={createFormData.variables}
            />

            <div>
              <Label htmlFor="create-text">Plain Text Content *</Label>
              <Textarea
                id="create-text"
                value={createFormData.defaultTextContent}
                onChange={(e) => setCreateFormData({ ...createFormData, defaultTextContent: e.target.value })}
                rows={4}
                className="font-mono text-xs"
                placeholder="Plain text version for email clients that don't support HTML..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-push-title">Push Notification Title</Label>
                <Input 
                  id="create-push-title" 
                  value={createFormData.defaultPushTitle}
                  onChange={(e) => setCreateFormData({ ...createFormData, defaultPushTitle: e.target.value })}
                  placeholder="e.g., New Update Available"
                />
              </div>
              <div>
                <Label htmlFor="create-push-body">Push Notification Body</Label>
                <Input 
                  id="create-push-body" 
                  value={createFormData.defaultPushBody}
                  onChange={(e) => setCreateFormData({ ...createFormData, defaultPushBody: e.target.value })}
                  placeholder="e.g., Check out the latest updates..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="create-sms">SMS Content</Label>
              <Textarea
                id="create-sms"
                value={createFormData.defaultSmsContent}
                onChange={(e) => setCreateFormData({ ...createFormData, defaultSmsContent: e.target.value })}
                rows={2}
                placeholder="SMS message (keep it short, 160 characters max)"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">{createFormData.defaultSmsContent.length}/160 characters</p>
            </div>

            <div>
              <Label htmlFor="create-variables">Variables (comma-separated)</Label>
              <Input 
                id="create-variables" 
                value={createFormData.variables.join(', ')}
                onChange={(e) => setCreateFormData({ 
                  ...createFormData, 
                  variables: e.target.value.split(',').map(v => v.trim()).filter(v => v) 
                })}
                placeholder="e.g., recipient_name, company_name, order_id"
              />
              <p className="text-xs text-gray-500 mt-1">
                These variables can be used in your content with {'{{'} variable_name {'}}'} syntax
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#D91C81] hover:bg-[#B01566] text-white"
              onClick={() => {
                if (!createFormData.type || !createFormData.name || !createFormData.defaultSubject) {
                  toast.error('Please fill in all required fields');
                  return;
                }
                toast.success('Template created successfully');
                setCreateDialog(false);
                // Reset form
                setCreateFormData({
                  type: '',
                  name: '',
                  description: '',
                  category: 'transactional',
                  defaultSubject: '',
                  defaultHtmlContent: '',
                  defaultTextContent: '',
                  defaultPushTitle: '',
                  defaultPushBody: '',
                  defaultSmsContent: '',
                  variables: [],
                });
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}