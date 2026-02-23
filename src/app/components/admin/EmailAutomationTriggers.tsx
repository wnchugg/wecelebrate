import { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, Users, Package, Truck, Gift, AlertCircle, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, X } from 'lucide-react';
import { SiteTemplate } from '../../types/emailTemplates';
import { AutomationRule, fetchAutomationRules, createAutomationRule, updateAutomationRule, deleteAutomationRule } from '../../services/automationApi';
import { toast } from 'sonner';

interface EmailAutomationTriggersProps {
  siteId: string;
  templates: SiteTemplate[];
}

const TRIGGER_OPTIONS = [
  {
    value: 'employee_added',
    label: 'Employee Added',
    description: 'Send when an employee is added to the site',
    icon: Users,
    color: 'blue',
  },
  {
    value: 'gift_selected',
    label: 'Gift Selected',
    description: 'Send when employee selects their gift',
    icon: Gift,
    color: 'green',
  },
  {
    value: 'order_placed',
    label: 'Order Placed',
    description: 'Send order confirmation immediately',
    icon: Package,
    color: 'purple',
  },
  {
    value: 'order_shipped',
    label: 'Order Shipped',
    description: 'Send when order ships with tracking',
    icon: Truck,
    color: 'orange',
  },
  {
    value: 'order_delivered',
    label: 'Order Delivered',
    description: 'Send delivery confirmation',
    icon: Package,
    color: 'green',
  },
  {
    value: 'selection_expiring',
    label: 'Selection Expiring',
    description: 'Remind employees before deadline',
    icon: Clock,
    color: 'yellow',
  },
  {
    value: 'anniversary_approaching',
    label: 'Anniversary Approaching',
    description: 'Send before service anniversary',
    icon: Calendar,
    color: 'pink',
  },
];

export function EmailAutomationTriggers({ siteId, templates }: EmailAutomationTriggersProps) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: '',
    templateId: '',
    enabled: true,
    daysBeforeExpiry: '',
    daysBeforeAnniversary: '',
  });

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const fetchedRules = await fetchAutomationRules(siteId);
        setRules(fetchedRules);
      } catch (error) {
        toast.error('Failed to fetch automation rules');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRules();
  }, [siteId]);

  const getTriggerConfig = (trigger: string) => {
    return TRIGGER_OPTIONS.find(opt => opt.value === trigger);
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      pink: 'bg-pink-100 text-pink-600',
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  const toggleRule = async (ruleId: string) => {
    try {
      const rule = rules.find(r => r.id === ruleId);
      if (!rule) return;
      
      const updated = await updateAutomationRule(ruleId, { enabled: !rule.enabled });
      setRules(rules.map(r => r.id === ruleId ? updated : r));
      toast.success(`Rule ${updated.enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to toggle rule');
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      try {
        await deleteAutomationRule(ruleId);
        setRules(rules.filter(rule => rule.id !== ruleId));
        toast.success('Rule deleted successfully');
      } catch (error) {
        toast.error('Failed to delete rule');
      }
    }
  };

  const getTemplateName = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template?.name || 'No template selected';
  };

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      trigger: '',
      templateId: '',
      enabled: true,
      daysBeforeExpiry: '',
      daysBeforeAnniversary: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (rule: AutomationRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      trigger: rule.trigger,
      templateId: rule.templateId,
      enabled: rule.enabled,
      daysBeforeExpiry: rule.conditions?.daysBeforeExpiry?.toString() || '',
      daysBeforeAnniversary: rule.conditions?.daysBeforeAnniversary?.toString() || '',
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      trigger: '',
      templateId: '',
      enabled: true,
      daysBeforeExpiry: '',
      daysBeforeAnniversary: '',
    });
  };

  const handleSaveRule = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a rule name');
      return;
    }
    if (!formData.trigger) {
      toast.error('Please select a trigger event');
      return;
    }
    if (!formData.templateId) {
      toast.error('Please select an email template');
      return;
    }

    setIsSaving(true);
    try {
      const ruleData: Record<string, unknown> = {
        siteId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        trigger: formData.trigger,
        templateId: formData.templateId,
        enabled: formData.enabled,
      };

      // Add conditions based on trigger type
      const conditions: Record<string, unknown> = {};
      if (formData.trigger === 'selection_expiring' && formData.daysBeforeExpiry) {
        conditions.daysBeforeExpiry = parseInt(formData.daysBeforeExpiry);
      }
      if (formData.trigger === 'anniversary_approaching' && formData.daysBeforeAnniversary) {
        conditions.daysBeforeAnniversary = parseInt(formData.daysBeforeAnniversary);
      }
      if (Object.keys(conditions).length > 0) {
        ruleData.conditions = conditions;
      }

      if (editingRule) {
        // Update existing rule
        const updated = await updateAutomationRule(editingRule.id, ruleData);
        setRules(rules.map(r => r.id === editingRule.id ? updated : r));
        toast.success('Automation rule updated successfully');
      } else {
        // Create new rule
        const newRule = await createAutomationRule(ruleData);
        setRules([...rules, newRule]);
        toast.success('Automation rule created successfully');
      }

      handleCloseModal();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save automation rule');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D91C81] to-[#B71569] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Bell className="w-7 h-7" />
              Email Automation
            </h2>
            <p className="mt-2 text-pink-100">
              Configure when emails are automatically sent to employees
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-white text-[#D91C81] px-4 py-2.5 rounded-lg font-semibold hover:bg-pink-50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">About Email Automation</p>
            <p className="text-blue-800">
              Automation rules trigger emails based on specific events in your gifting program. 
              Enable rules to automate your communication workflow and ensure timely notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Automation Rules */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <Loader2 className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 text-lg mb-2">Loading automation rules</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No automation rules configured</p>
            <p className="text-gray-500 text-sm mb-4">Add your first rule to get started</p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-[#D91C81] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#B71569] transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Rule
            </button>
          </div>
        ) : (
          rules.map((rule) => {
            const triggerConfig = getTriggerConfig(rule.trigger);
            const Icon = triggerConfig?.icon || Bell;

            return (
              <div
                key={rule.id}
                className={`bg-white border-2 rounded-xl p-6 transition-all ${
                  rule.enabled ? 'border-gray-200' : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconColor(triggerConfig?.color || 'gray')}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{rule.name}</h3>
                        {rule.enabled ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">
                            <ToggleRight className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            <ToggleLeft className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rule.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Trigger:</span>
                          <span className="font-medium text-gray-900">{triggerConfig?.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Template:</span>
                          <span className="font-medium text-gray-900">{getTemplateName(rule.templateId)}</span>
                        </div>
                        {rule.conditions?.daysBeforeExpiry && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{rule.conditions.daysBeforeExpiry} days before</span>
                          </div>
                        )}
                        {rule.conditions?.daysBeforeAnniversary && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{rule.conditions.daysBeforeAnniversary} days before</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void toggleRule(rule.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        rule.enabled
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                    >
                      {rule.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(rule)}
                      className="p-2 text-gray-600 hover:text-[#D91C81] hover:bg-pink-50 rounded-lg transition-colors"
                      title="Edit rule"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => void deleteRule(rule.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <ToggleRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">{rules.filter(r => r.enabled).length}</p>
              <p className="text-sm text-green-700">Active Rules</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
              <ToggleLeft className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rules.filter(r => !r.enabled).length}</p>
              <p className="text-sm text-gray-700">Inactive Rules</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{rules.length}</p>
              <p className="text-sm text-blue-700">Total Rules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Rule Name */}
              <div>
                <label htmlFor="auto-rule-name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Rule Name *
                </label>
                <input
                  id="auto-rule-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  placeholder="e.g., Welcome Email on Employee Added"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="auto-rule-description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="auto-rule-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                  placeholder="Brief description of when this rule applies..."
                />
              </div>

              {/* Trigger Event */}
              <div>
                <label htmlFor="auto-rule-trigger" className="block text-sm font-semibold text-gray-700 mb-2">
                  Trigger Event *
                </label>
                <select
                  id="auto-rule-trigger"
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                >
                  <option value="">Select a trigger event...</option>
                  {TRIGGER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Template */}
              <div>
                <label htmlFor="auto-rule-template" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Template *
                </label>
                <select
                  id="auto-rule-template"
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                >
                  <option value="">Select an email template...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional Fields */}
              {formData.trigger === 'selection_expiring' && (
                <div>
                  <label htmlFor="auto-rule-days-expiry" className="block text-sm font-semibold text-gray-700 mb-2">
                    Days Before Expiry
                  </label>
                  <input
                    id="auto-rule-days-expiry"
                    type="number"
                    min="1"
                    value={formData.daysBeforeExpiry}
                    onChange={(e) => setFormData({ ...formData, daysBeforeExpiry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    placeholder="e.g., 7"
                  />
                  <p className="text-xs text-gray-500 mt-1">Send email this many days before selection deadline</p>
                </div>
              )}

              {formData.trigger === 'anniversary_approaching' && (
                <div>
                  <label htmlFor="auto-rule-days-anniversary" className="block text-sm font-semibold text-gray-700 mb-2">
                    Days Before Anniversary
                  </label>
                  <input
                    id="auto-rule-days-anniversary"
                    type="number"
                    min="1"
                    value={formData.daysBeforeAnniversary}
                    onChange={(e) => setFormData({ ...formData, daysBeforeAnniversary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
                    placeholder="e.g., 30"
                  />
                  <p className="text-xs text-gray-500 mt-1">Send email this many days before anniversary date</p>
                </div>
              )}

              {/* Enable Rule */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-[#D91C81]"
                />
                <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                  Enable this rule immediately
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSaveRule()}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B71569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}