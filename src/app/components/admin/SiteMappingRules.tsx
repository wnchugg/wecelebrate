import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, MapPin, Building2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { apiRequest } from '../../utils/api';
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling';
import { kv } from '../../utils/kv';
import { authApi } from '../../utils/authApi';

interface Client {
  id: string;
  name: string;
}

interface Site {
  id: string;
  name: string;
  clientId: string;
}

interface MappingRule {
  id?: string;
  clientId: string;
  siteId: string;
  siteName?: string;
  priority: number;
  conditions: {
    field: 'country' | 'region' | 'department' | 'location';
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
    value: string;
  }[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SiteMappingRulesProps {
  client: Client;
  sites: Site[];
  onRulesUpdated: () => void;
}

export function SiteMappingRules({ client, sites, onRulesUpdated }: SiteMappingRulesProps) {
  const [rules, setRules] = useState<MappingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<MappingRule | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const [formData, setFormData] = useState<MappingRule>({
    clientId: client.id,
    siteId: '',
    priority: 1,
    conditions: [
      { field: 'country', operator: 'equals', value: '' }
    ],
    isActive: true
  });

  useEffect(() => {
    loadRules();
  }, [client.id]);

  const loadRules = async () => {
    setIsLoading(true);
    try {
      const { rules: loadedRules } = await apiRequest<{ rules: MappingRule[] }>(
        `/clients/${client.id}/mapping-rules`
      );
      setRules(loadedRules);
    } catch (error: unknown) {
      showErrorToast('Failed to load mapping rules', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRule = () => {
    setFormData({
      clientId: client.id,
      siteId: '',
      priority: rules.length + 1,
      conditions: [
        { field: 'country', operator: 'equals', value: '' }
      ],
      isActive: true
    });
    setEditingRule(null);
    setShowRuleModal(true);
  };

  const handleEditRule = (rule: MappingRule) => {
    setFormData(rule);
    setEditingRule(rule);
    setShowRuleModal(true);
  };

  const handleSaveRule = async () => {
    if (!editingRule) return;

    try {
      const key = editingRule.id 
        ? `site_mapping_rule:${editingRule.id}` 
        : `site_mapping_rule:${Date.now()}`;

      const ruleToSave = {
        ...editingRule,
        id: editingRule.id || `rule_${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };

      await kv.set(key, ruleToSave);
      showSuccessToast(
        editingRule.id ? 'Rule updated' : 'Rule created',
        'Site mapping rule saved successfully'
      );
      loadRules();
      setShowRuleModal(false);
    } catch (error: unknown) {
      showErrorToast('Failed to save rule', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!window.confirm('Are you sure you want to delete this mapping rule?')) return;

    try {
      await kv.del(`site_mapping_rule:${ruleId}`);
      showSuccessToast('Mapping rule deleted successfully');
      loadRules();
    } catch (error: unknown) {
      showErrorToast('Failed to delete rule', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleToggleRule = async (rule: MappingRule) => {
    try {
      const updatedRule = { ...rule, isActive: !rule.isActive };
      await kv.set(`site_mapping_rule:${rule.id}`, updatedRule);
      showSuccessToast(`Rule ${!rule.isActive ? 'enabled' : 'disabled'}`);
      loadRules();
    } catch (error: unknown) {
      showErrorToast('Failed to update rule', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleApplyRules = async () => {
    try {
      setIsApplying(true);
      // This would call a backend endpoint to apply all active rules
      await authApi.post(
        'erp/site-mappings/apply-rules',
        { erpConnectionId: client.id }
      );
      onRulesUpdated();
    } catch (error: unknown) {
      showErrorToast('Failed to apply rules', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsApplying(false);
    }
  };

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [
        ...formData.conditions,
        { field: 'country', operator: 'equals', value: '' }
      ]
    });
  };

  const removeCondition = (index: number) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index)
    });
  };

  const updateCondition = (index: number, updates: Partial<MappingRule['conditions'][0]>) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.map((c, i) =>
        i === index ? { ...c, ...updates } : c
      )
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <MapPin className="w-6 h-6 text-[#D91C81] mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Site Mapping Rules</h3>
                <p className="text-sm text-gray-600">
                  Automatically assign employees to sites based on their attributes like country, department, or region
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => void handleApplyRules()}
                disabled={isApplying || rules.length === 0}
                variant="outline"
                size="sm"
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Apply Rules
                  </>
                )}
              </Button>
              <Button
                onClick={handleAddRule}
                className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">How Mapping Rules Work</p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>Rules are evaluated in priority order (lower numbers first)</li>
            <li>All conditions in a rule must match for an employee to be mapped</li>
            <li>Once an employee matches a rule, they are assigned to that site</li>
            <li>Click "Apply Rules" to run the mapping process on all employees</li>
          </ul>
        </div>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#D91C81] mx-auto mb-2" />
            <p className="text-gray-600">Loading mapping rules...</p>
          </CardContent>
        </Card>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Mapping Rules</h3>
            <p className="text-gray-600 mb-4">
              Create your first mapping rule to automatically assign employees to sites
            </p>
            <Button
              onClick={handleAddRule}
              className="bg-[#D91C81] hover:bg-[#B01669] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules
            .sort((a, b) => a.priority - b.priority)
            .map((rule) => {
              const site = sites.find(s => s.id === rule.siteId);
              
              return (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-gray-100 text-gray-700 text-xs">
                            Priority {rule.priority}
                          </Badge>
                          <Badge className={
                            rule.isActive
                              ? 'bg-green-100 text-green-800 text-xs'
                              : 'bg-gray-100 text-gray-600 text-xs'
                          }>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {site && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              {site.name}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            Map employees to <span className="text-[#D91C81]">{site?.name || 'Unknown Site'}</span> when:
                          </p>
                          {rule.conditions.map((condition, idx) => (
                            <div key={idx} className="text-sm text-gray-600 ml-4">
                              {idx > 0 && <span className="font-semibold text-gray-900">AND </span>}
                              <span className="font-medium">{condition.field}</span>{' '}
                              <span className="text-gray-500">{condition.operator}</span>{' '}
                              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">"{condition.value}"</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => void handleToggleRule(rule)}
                          variant="outline"
                          size="sm"
                        >
                          {rule.isActive ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          onClick={() => handleEditRule(rule)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => rule.id && handleDeleteRule(rule.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {/* Rule Editor Modal */}
      <Dialog open={showRuleModal} onOpenChange={setShowRuleModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Mapping Rule' : 'Create Mapping Rule'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteId">Target Site *</Label>
                <select
                  id="siteId"
                  value={formData.siteId}
                  onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="">Select a site...</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min={1}
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-gray-600 mt-1">Lower numbers = higher priority</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Conditions (All must match)</Label>
                <Button
                  onClick={addCondition}
                  variant="outline"
                  size="sm"
                  type="button"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Condition
                </Button>
              </div>

              <div className="space-y-2">
                {formData.conditions.map((condition, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <div>
                        <select
                          value={condition.field}
                          onChange={(e) => updateCondition(index, { field: e.target.value as 'country' | 'region' | 'department' | 'location' })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-[#D91C81] outline-none"
                        >
                          <option value="country">Country</option>
                          <option value="region">Region</option>
                          <option value="department">Department</option>
                          <option value="location">Location</option>
                        </select>
                      </div>

                      <div>
                        <select
                          value={condition.operator}
                          onChange={(e) => updateCondition(index, { operator: e.target.value as 'equals' | 'contains' | 'startsWith' | 'endsWith' })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-[#D91C81] outline-none"
                        >
                          <option value="equals">Equals</option>
                          <option value="contains">Contains</option>
                          <option value="startsWith">Starts With</option>
                          <option value="endsWith">Ends With</option>
                        </select>
                      </div>

                      <div>
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                          placeholder="Value"
                          className="text-sm"
                        />
                      </div>
                    </div>

                    {formData.conditions.length > 1 && (
                      <Button
                        onClick={() => removeCondition(index)}
                        variant="outline"
                        size="sm"
                        type="button"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowRuleModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSaveRule()}
              className="bg-[#D91C81] hover:bg-[#B01669] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}