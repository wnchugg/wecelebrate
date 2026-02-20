import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Eye, 
  Settings, 
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { useAdmin } from '../../context/AdminContext';

export interface AccessGroup {
  id: string;
  name: string;
  description: string;
  type: 'predefined' | 'custom';
  clientId: string | null;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string;
  category: string;
}

export function AccessGroupManagement() {
  const { adminUser, accessToken } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'predefined' | 'custom'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AccessGroup | null>(null);
  
  // Loading and data states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [accessGroups, setAccessGroups] = useState<AccessGroup[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'custom' as 'predefined' | 'custom',
    clientId: '',
    permissions: [] as string[],
    isActive: true,
  });

  // Populate form when editing an access group
  useEffect(() => {
    if (selectedGroup) {
      setFormData({
        name: selectedGroup.name,
        description: selectedGroup.description,
        type: selectedGroup.type,
        clientId: selectedGroup.clientId || '',
        permissions: selectedGroup.permissions || [],
        isActive: selectedGroup.isActive,
      });
    }
  }, [selectedGroup]);

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/permissions`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Access-Token': accessToken || '',
            'X-Environment-ID': 'development',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch permissions');
      }

      const data = await response.json();
      setPermissions(data.permissions || []);
    } catch (err: any) {
      console.error('Error fetching permissions:', err);
      setError(err.message);
    }
  };

  // Fetch access groups from backend
  const fetchAccessGroups = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/access-groups`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Access-Token': accessToken || '',
            'X-Environment-ID': 'development',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch access groups');
      }

      const data = await response.json();
      setAccessGroups(data.accessGroups || []);
    } catch (err: any) {
      console.error('Error fetching access groups:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load access groups and permissions on mount
  useEffect(() => {
    if (accessToken) {
      fetchPermissions();
      fetchAccessGroups();
    }
  }, [accessToken]);

  // Handle create/update access group
  const handleSaveAccessGroup = async () => {
    // Validation
    if (!formData.name || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.type === 'custom' && !formData.clientId) {
      alert('Custom access groups must have a client ID');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = selectedGroup
        ? `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/access-groups/${selectedGroup.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/access-groups`;

      const method = selectedGroup ? 'PUT' : 'POST';

      const body: any = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        clientId: formData.type === 'custom' ? formData.clientId : null,
        permissions: formData.permissions,
        isActive: formData.isActive,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-Access-Token': accessToken || '',
          'X-Environment-ID': 'development',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${selectedGroup ? 'update' : 'create'} access group`);
      }

      toast.success(`Access group ${selectedGroup ? 'updated' : 'created'} successfully!`);
      
      // Close modal and reset form
      setShowAddModal(false);
      setSelectedGroup(null);
      setFormData({
        name: '',
        description: '',
        type: 'custom',
        clientId: '',
        permissions: [],
        isActive: true,
      });

      // Refresh the list
      await fetchAccessGroups();
    } catch (err: any) {
      console.error('Error saving access group:', err);
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete access group
  const handleDeleteAccessGroup = async (group: AccessGroup) => {
    if (!confirm(`Are you sure you want to delete the access group "${group.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/access-groups/${group.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Access-Token': accessToken || '',
            'X-Environment-ID': 'development',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete access group');
      }

      toast.success('Access group deleted successfully!');
      
      // Refresh the list
      await fetchAccessGroups();
    } catch (err: any) {
      console.error('Error deleting access group:', err);
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggle permission
  const handleTogglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const filteredGroups = accessGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || group.type === filterType;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? group.isActive : !group.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Access Group Management</h1>
          <p className="text-gray-600 mt-1">Define what components and resources users can see</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-[#D91C81] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#B71569] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add Access Group
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900">Error</p>
              <p className="text-orange-800 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
        <div className="flex items-start gap-3">
          <Eye className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Understanding Access Groups</h2>
            <p className="text-gray-700 mb-3">
              <strong>Access Groups define WHAT users can SEE</strong> - which components and resources are visible to them.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Predefined Groups:</strong> System-wide groups like "Peer", "Manager", "HR Admin" that apply across all clients</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Custom Groups:</strong> Client-specific groups tailored to unique visibility needs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Multiple Groups:</strong> Employees can belong to multiple access groups (e.g., "Peer" + "Manager")</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong>Example:</strong> A manager may have access to the "Gift Redemption Report" component, but their role determines if they see all data or just their team's data</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search access groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'predefined' | 'custom')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
          >
            <option value="all">All Types</option>
            <option value="predefined">Predefined Groups</option>
            <option value="custom">Custom Groups</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Access Groups</p>
          <p className="text-2xl font-bold text-gray-900">{accessGroups.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Active Groups</p>
          <p className="text-2xl font-bold text-green-600">
            {accessGroups.filter(g => g.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Predefined Groups</p>
          <p className="text-2xl font-bold text-purple-600">
            {accessGroups.filter(g => g.type === 'predefined').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Custom Groups</p>
          <p className="text-2xl font-bold text-blue-600">
            {accessGroups.filter(g => g.type === 'custom').length}
          </p>
        </div>
      </div>

      {/* Access Groups Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#D91C81] animate-spin" />
            <span className="ml-3 text-gray-600">Loading access groups...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Group Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGroups.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{group.name}</p>
                          <p className="text-sm text-gray-600">{group.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          group.type === 'predefined' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {group.type === 'predefined' ? <Eye className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                          {group.type === 'predefined' ? 'Predefined' : 'Custom'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {group.permissions?.length || 0} permission{group.permissions?.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          group.isActive 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {group.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {group.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedGroup(group)}
                            disabled={isSaving}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit Access Group"
                          >
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAccessGroup(group)}
                            disabled={isSaving}
                            className="p-2 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Access Group"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredGroups.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No access groups found matching your filters.</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Add/Edit Access Group Modal */}
      {(showAddModal || selectedGroup) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedGroup ? 'Edit Access Group' : 'Add New Access Group'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedGroup(null);
                  setFormData({
                    name: '',
                    description: '',
                    type: 'custom',
                    clientId: '',
                    permissions: [],
                    isActive: true,
                  });
                }}
                disabled={isSaving}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-cyan-600" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Peer, Manager, HR Admin"
                      disabled={isSaving}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'predefined' | 'custom' })}
                      disabled={isSaving || (selectedGroup?.type === 'predefined')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="custom">Custom (Client-specific)</option>
                      {adminUser?.role === 'super_admin' && <option value="predefined">Predefined (System-wide)</option>}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this access group can see..."
                    disabled={isSaving}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {formData.type === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID * (for custom groups)
                    </label>
                    <input
                      type="text"
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      placeholder="Enter client ID"
                      disabled={isSaving}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    disabled={isSaving}
                    className="w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-pink-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">
                    Active (group can be assigned to employees)
                  </label>
                </div>
              </div>
              
              {/* Permissions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Component Visibility Permissions ({formData.permissions.length} selected)
                </h3>

                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                  <p className="text-sm text-cyan-900">
                    <strong>Select permissions</strong> that define which components and resources users in this group can see. 
                    Within those components, their assigned Roles determine what actions they can perform.
                  </p>
                </div>

                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 capitalize">{category} Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((permission) => (
                        <div key={permission.id} className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={`ag-${permission.id}`}
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handleTogglePermission(permission.id)}
                            disabled={isSaving}
                            className="mt-1 w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-pink-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <div className="flex-1">
                            <label htmlFor={`ag-${permission.id}`} className="block text-sm font-medium text-gray-900 cursor-pointer">
                              {permission.description}
                            </label>
                            <p className="text-xs text-gray-600">
                              {permission.resource}.{permission.action}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedGroup(null);
                  setFormData({
                    name: '',
                    description: '',
                    type: 'custom',
                    clientId: '',
                    permissions: [],
                    isActive: true,
                  });
                }}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAccessGroup}
                disabled={isSaving}
                className="px-4 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {selectedGroup ? 'Save Changes' : 'Create Access Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}