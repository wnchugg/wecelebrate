import { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import { useEmailTemplate } from '../../context/EmailTemplateContext';
import { Plus, Mail, Bell, MessageSquare, ChevronDown, ChevronUp, Edit, Trash2, RotateCcw, Check, X, Send, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { GlobalTemplate, SiteTemplate } from '../../types/emailTemplates';
import { TestEmailModal } from '../../components/admin/TestEmailModal';
import { EmailAutomationTriggers } from '../../components/admin/EmailAutomationTriggers';

export function EmailNotificationConfiguration() {
  const { currentSite } = useSite();
  const {
    globalTemplates,
    siteTemplates,
    getSiteTemplatesBySite,
    addSiteTemplate,
    updateSiteTemplate,
    deleteSiteTemplate,
    resetSiteTemplateToDefault,
    refreshSiteTemplates,
    isLoadingSite,
  } = useEmailTemplate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SiteTemplate | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [testingTemplate, setTestingTemplate] = useState<SiteTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'automation'>('templates');

  // Refresh site templates when currentSite changes
  useEffect(() => {
    if (currentSite) {
      refreshSiteTemplates(currentSite.id);
    }
  }, [currentSite?.id]);

  if (!currentSite) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">
          <p>Please select a site to configure email and notification templates.</p>
        </div>
      </div>
    );
  }

  const activeSiteTemplates = getSiteTemplatesBySite(currentSite.id);
  const availableGlobalTemplates = globalTemplates.filter(
    gt => !activeSiteTemplates.some(st => st.globalTemplateId === gt.id)
  );

  const handleAddTemplate = async (globalTemplateId: string) => {
    await addSiteTemplate(currentSite.id, globalTemplateId);
    setShowAddModal(false);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Are you sure you want to remove this template from the site?')) {
      await deleteSiteTemplate(id);
    }
  };

  const handleResetTemplate = (id: string) => {
    if (confirm('Reset this template to default settings? All customizations will be lost.')) {
      resetSiteTemplateToDefault(id);
      toast.success('Template reset to defaults');
    }
  };

  const getCategoryBadgeColor = (category: string) => {
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
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email & Notifications</h1>
          <p className="text-gray-600">
            Manage email templates, push notifications, and SMS messages for <span className="font-semibold">{currentSite.name}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveTab('templates')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'templates' ? 'bg-[#D91C81] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Mail className="w-5 h-5" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === 'automation' ? 'bg-[#D91C81] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Zap className="w-5 h-5" />
            Automation
          </button>
        </div>

        {/* Active Templates */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Active Templates</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {activeSiteTemplates.length} template{activeSiteTemplates.length !== 1 ? 's' : ''} configured for this site
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-[#D91C81] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#B71569] transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Template
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {activeSiteTemplates.length === 0 ? (
                <div className="p-12 text-center">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No templates added yet</p>
                  <p className="text-gray-400 text-sm">Click "Add Template" to get started</p>
                </div>
              ) : (
                activeSiteTemplates.map((template) => {
                  const globalTemplate = globalTemplates.find(gt => gt.id === template.globalTemplateId);
                  const isExpanded = expandedTemplate === template.id;

                  return (
                    <div key={template.id} className="bg-white">
                      {/* Template Header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                              {globalTemplate && (
                                <span className={`text-xs font-medium px-2 py-1 rounded ${getCategoryBadgeColor(globalTemplate.category)}`}>
                                  {globalTemplate.category}
                                </span>
                              )}
                            </div>
                            {globalTemplate && (
                              <p className="text-sm text-gray-600 mb-3">{globalTemplate.description}</p>
                            )}

                            {/* Channel Status */}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className={`w-4 h-4 ${template.emailEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                                <span className={template.emailEnabled ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                  Email {template.emailEnabled ? 'ON' : 'OFF'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Bell className={`w-4 h-4 ${template.pushEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                                <span className={template.pushEnabled ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                  Push {template.pushEnabled ? 'ON' : 'OFF'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MessageSquare className={`w-4 h-4 ${template.smsEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                                <span className={template.smsEnabled ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                  SMS {template.smsEnabled ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={template.enabled}
                                onChange={(e) => updateSiteTemplate(template.id, { enabled: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D91C81]"></div>
                            </label>

                            <button
                              onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                              className="p-2 text-gray-600 hover:text-[#D91C81] hover:bg-pink-50 rounded-lg transition-colors"
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>

                            <button
                              onClick={() => setEditingTemplate(template)}
                              className="p-2 text-gray-600 hover:text-[#D91C81] hover:bg-pink-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleResetTemplate(template.id)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Reset to defaults"
                            >
                              <RotateCcw className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => setTestingTemplate(template)}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Test Email"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-gray-100">
                          <div className="mt-4 space-y-4">
                            {/* Email Preview */}
                            {template.emailEnabled && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  Email Preview
                                </h4>
                                <div className="text-sm text-gray-600 mb-2">
                                  <strong>Subject:</strong> {template.subject}
                                </div>
                                <div className="bg-white border border-gray-200 rounded p-3 text-sm text-gray-700 max-h-48 overflow-auto">
                                  <div dangerouslySetInnerHTML={{ __html: template.htmlContent }} />
                                </div>
                              </div>
                            )}

                            {/* Push Preview */}
                            {template.pushEnabled && template.pushTitle && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <Bell className="w-4 h-4" />
                                  Push Notification Preview
                                </h4>
                                <div className="bg-white border border-gray-200 rounded p-3">
                                  <div className="font-medium text-gray-900 text-sm mb-1">{template.pushTitle}</div>
                                  <div className="text-sm text-gray-600">{template.pushBody}</div>
                                </div>
                              </div>
                            )}

                            {/* SMS Preview */}
                            {template.smsEnabled && template.smsContent && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4" />
                                  SMS Preview
                                </h4>
                                <div className="bg-white border border-gray-200 rounded p-3 text-sm text-gray-700">
                                  {template.smsContent}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Email Automation Triggers */}
        {activeTab === 'automation' && (
          <EmailAutomationTriggers 
            siteId={currentSite.id}
            templates={activeSiteTemplates}
          />
        )}

        {/* Add Template Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Template</h2>
              <p className="text-gray-600 mb-6">Select a template to add to this site. You can customize it after adding.</p>

              <div className="space-y-3">
                {availableGlobalTemplates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>All available templates have been added to this site.</p>
                  </div>
                ) : (
                  availableGlobalTemplates.map((globalTemplate) => (
                    <div
                      key={globalTemplate.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#D91C81] hover:bg-pink-50 transition-all cursor-pointer"
                      onClick={() => handleAddTemplate(globalTemplate.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{globalTemplate.name}</h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${getCategoryBadgeColor(globalTemplate.category)}`}>
                              {globalTemplate.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{globalTemplate.description}</p>
                        </div>
                        <Plus className="w-5 h-5 text-[#D91C81] flex-shrink-0 ml-4" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Template Modal */}
        {editingTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Template: {editingTemplate.name}</h2>

              <div className="space-y-6">
                {/* Channel Toggles */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Enabled Channels</h3>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={editingTemplate.emailEnabled}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, emailEnabled: e.target.checked })}
                        className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                      />
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={editingTemplate.pushEnabled}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, pushEnabled: e.target.checked })}
                        className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                      />
                      <Bell className="w-4 h-4" />
                      Push Notifications
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={editingTemplate.smsEnabled}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, smsEnabled: e.target.checked })}
                        className="rounded border-gray-300 text-[#D91C81] focus:ring-[#D91C81]"
                      />
                      <MessageSquare className="w-4 h-4" />
                      SMS
                    </label>
                  </div>
                </div>

                {/* Email Settings */}
                {editingTemplate.emailEnabled && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Email Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                        <input
                          type="text"
                          value={editingTemplate.subject}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">HTML Content</label>
                        <textarea
                          value={editingTemplate.htmlContent}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, htmlContent: e.target.value })}
                          rows={10}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Plain Text Content</label>
                        <textarea
                          value={editingTemplate.textContent}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, textContent: e.target.value })}
                          rows={5}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Push Settings */}
                {editingTemplate.pushEnabled && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Push Notification Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Push Title</label>
                        <input
                          type="text"
                          value={editingTemplate.pushTitle || ''}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, pushTitle: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Push Body</label>
                        <textarea
                          value={editingTemplate.pushBody || ''}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, pushBody: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SMS Settings */}
                {editingTemplate.smsEnabled && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      SMS Settings
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMS Content (160 chars recommended)</label>
                      <textarea
                        value={editingTemplate.smsContent || ''}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, smsContent: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                        maxLength={320}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingTemplate.smsContent || '').length} / 320 characters
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateSiteTemplate(editingTemplate.id, editingTemplate);
                    setEditingTemplate(null);
                    toast.success('Template updated successfully');
                  }}
                  className="px-6 py-2.5 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Email Modal */}
        {testingTemplate && (
          <TestEmailModal
            template={testingTemplate}
            onClose={() => setTestingTemplate(null)}
          />
        )}
      </div>
    </div>
  );
}