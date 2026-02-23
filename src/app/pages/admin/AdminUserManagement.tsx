import { useState, useEffect } from 'react';
import { Plus, Search, Shield, Edit, Trash2, Mail, CheckCircle, XCircle, Key, AlertCircle, Eye, Loader2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { logger } from '../../utils/logger';
import { useDateFormat } from '../../hooks/useDateFormat';

// Admin roles with different permission levels
export type AdminRole = 'super_admin' | 'site_manager' | 'content_editor' | 'viewer';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: AdminRole;
  status: 'active' | 'inactive';
  clientAccess: 'all' | string[]; // 'all' or array of client IDs
  siteAccess: 'all' | string[]; // 'all' or array of site IDs
  requirePasswordChange: boolean;
  lastLogin?: string;
  lastPasswordChange?: string;
  createdAt: string;
  createdBy: string;
}

const roleDefinitions = {
  super_admin: {
    name: 'Super Admin',
    color: 'text-purple-600 bg-purple-100 border-purple-200',
    icon: Shield,
    permissions: [
      'Full system access',
      'Create, edit, delete all sites',
      'Manage admin users and roles',
      'Access all orders and reports',
      'Configure global settings',
      'Manage gift catalog'
    ]
  },
  site_manager: {
    name: 'Site Manager',
    color: 'text-blue-600 bg-blue-100 border-blue-200',
    icon: Shield,
    permissions: [
      'Create and manage assigned sites',
      'Configure site settings',
      'Manage site access controls',
      'View and manage orders',
      'Assign products to sites',
      'Cannot manage admin users'
    ]
  },
  content_editor: {
    name: 'Content Editor',
    color: 'text-green-600 bg-green-100 border-green-200',
    icon: Edit,
    permissions: [
      'Edit site content and branding',
      'Manage email templates',
      'Update product descriptions',
      'View orders (read-only)',
      'Cannot change access controls',
      'Cannot delete sites'
    ]
  },
  viewer: {
    name: 'Viewer',
    color: 'text-gray-600 bg-gray-100 border-gray-200',
    icon: Eye,
    permissions: [
      'Read-only access',
      'View sites and configurations',
      'View orders and reports',
      'Cannot make any changes',
      'Cannot access user management'
    ]
  }
};

export function AdminUserManagement() {
  const { adminUser, accessToken } = useAdmin();
  const { formatDate } = useDateFormat();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<AdminRole | ''>('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive' | ''>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [requireChangeOnNextLogin, setRequireChangeOnNextLogin] = useState(false);
  
  // Loading and data states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'viewer' as AdminRole,
    status: 'active' as 'active' | 'inactive',
    clientAccess: 'all' as 'all' | string[],
    siteAccess: 'all' as 'all' | string[],
    requirePasswordChange: false,
    password: '',
    confirmPassword: ''
  });

  // Populate form when editing a user
  useEffect(() => {
    if (selectedUser) {
      setFormData({
        username: selectedUser.username,
        email: selectedUser.email,
        role: selectedUser.role,
        status: selectedUser.status,
        clientAccess: selectedUser.clientAccess,
        siteAccess: selectedUser.siteAccess,
        requirePasswordChange: selectedUser.requirePasswordChange,
        password: '',
        confirmPassword: ''
      });
    }
  }, [selectedUser]);

  // Fetch admin users from backend
  const fetchAdminUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/admin-users`,
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
        
        // If we get a 403, it means the current user isn't a super_admin in the admin_users table
        if (response.status === 403) {
          logger.log('[Admin Users] User is not a super_admin in admin_users table');
          setError('You need to be added as a super_admin in the Admin User Management system. Please create your admin user account first using the "Add Admin User" button.');
          setAdminUsers([]);
          setIsLoading(false);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to fetch admin users');
      }

      const data = await response.json();
      setAdminUsers(data.users || []);
    } catch (err: any) {
      logger.error('Error fetching admin users:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load admin users on mount
  useEffect(() => {
    if (adminUser?.role === 'super_admin' && accessToken) {
      fetchAdminUsers();
    }
  }, [adminUser, accessToken]);

  // Handle create/update admin user
  const handleSaveUser = async () => {
    // Validation
    if (!formData.username || !formData.email || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }

    if (!selectedUser) {
      // Creating new user - password required
      if (!formData.password || !formData.confirmPassword) {
        alert('Password and confirmation are required for new users');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      if (formData.password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      const url = selectedUser
        ? `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/admin-users/${selectedUser.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/admin-users`;

      const method = selectedUser ? 'PUT' : 'POST';

      const body: Record<string, unknown> = {
        username: formData.username,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        clientAccess: formData.clientAccess,
        siteAccess: formData.siteAccess,
        requirePasswordChange: formData.requirePasswordChange,
      };

      // Only include password for new users
      if (!selectedUser) {
        body.password = formData.password;
      }

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
        throw new Error(errorData.error || `Failed to ${selectedUser ? 'update' : 'create'} admin user`);
      }

      // Success!
      alert(`Admin user ${selectedUser ? 'updated' : 'created'} successfully!`);
      
      // Close modal and reset form
      setShowAddModal(false);
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        role: 'viewer',
        status: 'active',
        clientAccess: 'all',
        siteAccess: 'all',
        requirePasswordChange: false,
        password: '',
        confirmPassword: ''
      });

      // Refresh the list
      await fetchAdminUsers();
    } catch (err: any) {
      logger.error('Error saving admin user:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete admin user
  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to delete the admin user "${user.username}"? This action cannot be undone.`)) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/admin-users/${user.id}`,
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
        throw new Error(errorData.error || 'Failed to delete admin user');
      }

      alert('Admin user deleted successfully!');
      
      // Refresh the list
      await fetchAdminUsers();
    } catch (err: any) {
      logger.error('Error deleting admin user:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (user: AdminUser, newStatus: 'active' | 'inactive') => {
    if (!confirm(`Are you sure you want to change ${user.username}'s status to ${newStatus}?`)) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/admin-users/${user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Access-Token': accessToken || '',
            'X-Environment-ID': 'development',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      alert(`User status updated to ${newStatus} successfully!`);
      
      // Refresh the list
      await fetchAdminUsers();
    } catch (err: any) {
      logger.error('Error updating user status:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!userToResetPassword) return;

    if (!newPassword || !confirmNewPassword) {
      alert('Please enter and confirm the new password');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/admin-users/${userToResetPassword.id}/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Access-Token': accessToken || '',
            'X-Environment-ID': 'development',
          },
          body: JSON.stringify({ newPassword, requireChangeOnNextLogin }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      alert('Password reset successfully!');
      
      // Close modal and reset form
      setShowPasswordReset(false);
      setUserToResetPassword(null);
      setNewPassword('');
      setConfirmNewPassword('');
      setRequireChangeOnNextLogin(false);
    } catch (err: any) {
      logger.error('Error resetting password:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Only super_admin can access this page
  if (adminUser?.role !== 'super_admin') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Access Denied</h3>
              <p className="text-red-800">
                You do not have permission to access Admin User Management. This feature requires Super Admin privileges.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDateDisplay = (dateString: string) => {
    return formatDate(dateString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin User Management</h1>
          <p className="text-gray-600 mt-1">Manage HALO employee access to the admin platform</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-[#D91C81] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#B71569] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add Admin User
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-900">Getting Started</p>
              <p className="text-orange-800 text-sm">{error}</p>
              {adminUsers.length === 0 && (
                <p className="text-orange-800 text-sm mt-2">
                  Click the "Add Admin User" button above to create the first super admin account in the system.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Role Definitions */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Admin Roles & Permissions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(roleDefinitions).map(([key, role]) => (
            <div key={key} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${role.color}`}>
                <role.icon className="w-3 h-3" />
                {role.name}
              </div>
              <ul className="space-y-1.5">
                {role.permissions.map((permission, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as AdminRole | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="site_manager">Site Manager</option>
            <option value="content_editor">Content Editor</option>
            <option value="viewer">Viewer</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'active' | 'inactive' | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total Admin Users</p>
          <p className="text-2xl font-bold text-gray-900">{adminUsers.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Active Users</p>
          <p className="text-2xl font-bold text-green-600">
            {adminUsers.filter(u => u.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Super Admins</p>
          <p className="text-2xl font-bold text-purple-600">
            {adminUsers.filter(u => u.role === 'super_admin').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Site Managers</p>
          <p className="text-2xl font-bold text-blue-600">
            {adminUsers.filter(u => u.role === 'site_manager').length}
          </p>
        </div>
      </div>

      {/* Admin Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#D91C81] animate-spin" />
            <span className="ml-3 text-gray-600">Loading admin users...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Site Access
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const roleInfo = roleDefinitions[user.role] || {
                      name: 'Unknown Role',
                      color: 'text-gray-600 bg-gray-100 border-gray-200',
                      icon: AlertCircle,
                      permissions: ['Invalid role - please edit user to assign a valid role']
                    };
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.username}</p>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${roleInfo.color}`}>
                            <roleInfo.icon className="w-3 h-3" />
                            {roleInfo.name}
                            {!roleDefinitions[user.role] && (
                              <span className="text-xs opacity-70">({user.role})</span>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {user.siteAccess === 'all' ? (
                              <span className="flex items-center gap-1 text-purple-600 font-medium">
                                <Shield className="w-4 h-4" />
                                All Sites
                              </span>
                            ) : Array.isArray(user.siteAccess) ? (
                              <span className="text-gray-600">
                                {user.siteAccess.length} site{user.siteAccess.length !== 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-gray-400">Not configured</span>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={user.status}
                            onChange={(e) => void handleToggleStatus(user, e.target.value as 'active' | 'inactive')}
                            disabled={isSaving}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              user.status === 'active' 
                                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            <option value="active">✓ Active</option>
                            <option value="inactive">✕ Inactive</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {user.lastLogin ? formatDateDisplay(user.lastLogin) : 'Never'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedUser(user)}
                              disabled={isSaving}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button 
                              onClick={() => {
                                setUserToResetPassword(user);
                                setShowPasswordReset(true);
                              }}
                              disabled={isSaving}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reset Password"
                            >
                              <Key className="w-4 h-4 text-blue-600" />
                            </button>
                            <button 
                              onClick={() => void handleDeleteUser(user)}
                              disabled={isSaving}
                              className="p-2 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No admin users found matching your filters.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Security Best Practices</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Regularly review admin user access and permissions</li>
              <li>Deactivate accounts for employees who leave the company</li>
              <li>Use the principle of least privilege - grant only necessary permissions</li>
              <li>Enforce strong password policies and MFA for all admin accounts</li>
              <li>Audit admin activity logs regularly for suspicious behavior</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Add/Edit Admin User Modal */}
      {(showAddModal || selectedUser) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedUser ? 'Edit Admin User' : 'Add New Admin User'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUser(null);
                  setFormData({
                    username: '',
                    email: '',
                    role: 'viewer',
                    status: 'active',
                    clientAccess: 'all',
                    siteAccess: 'all',
                    requirePasswordChange: false,
                    password: '',
                    confirmPassword: ''
                  });
                }}
                disabled={isSaving}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Account Information
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="user-mgmt-username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      id="user-mgmt-username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="john.doe"
                      disabled={isSaving}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="user-mgmt-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      id="user-mgmt-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john.doe@halobranded.com"
                      disabled={isSaving}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </div>
                
                {!selectedUser && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="user-mgmt-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        id="user-mgmt-password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        disabled={isSaving}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="user-mgmt-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <input
                        id="user-mgmt-confirm-password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        disabled={isSaving}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Role & Permissions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Role & Permissions</h3>
                
                <div>
                  <label htmlFor="user-mgmt-role" className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Role *
                  </label>
                  <select
                    id="user-mgmt-role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="viewer">Viewer - Read-only access</option>
                    <option value="content_editor">Content Editor - Edit site content</option>
                    <option value="site_manager">Site Manager - Manage assigned sites</option>
                    <option value="super_admin">Super Admin - Full system access</option>
                  </select>
                </div>
                
                {/* Role Permissions Preview */}
                {formData.role && roleDefinitions[formData.role] && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {roleDefinitions[formData.role].name} Permissions:
                    </p>
                    <ul className="space-y-1.5">
                      {roleDefinitions[formData.role].permissions.map((permission, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{permission}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Client Access */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Client Access</h3>
                
                <div>
                  <label htmlFor="user-mgmt-client-access" className="block text-sm font-medium text-gray-700 mb-2">
                    Client Access Level *
                  </label>
                  <select
                    id="user-mgmt-client-access"
                    value={formData.clientAccess === 'all' ? 'all' : 'specific'}
                    onChange={(e) => setFormData({
                      ...formData,
                      clientAccess: e.target.value === 'all' ? 'all' : []
                    })}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Clients (Full Access)</option>
                    <option value="specific">Specific Clients Only</option>
                  </select>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.clientAccess === 'all' 
                      ? 'This user will have access to all current and future clients and their sites.'
                      : 'This user will only have access to clients you specifically assign.'}
                  </p>
                </div>
              </div>
              
              {/* Site Access */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Site Access</h3>
                
                <div>
                  <label htmlFor="user-mgmt-site-access" className="block text-sm font-medium text-gray-700 mb-2">
                    Site Access Level *
                  </label>
                  <select
                    id="user-mgmt-site-access"
                    value={formData.siteAccess === 'all' ? 'all' : 'specific'}
                    onChange={(e) => setFormData({
                      ...formData,
                      siteAccess: e.target.value === 'all' ? 'all' : []
                    })}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Sites (Full Access)</option>
                    <option value="specific">Specific Sites Only</option>
                  </select>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.siteAccess === 'all' 
                      ? 'This user will have access to all current and future sites.'
                      : 'This user will only have access to sites you specifically assign.'}
                  </p>
                </div>
              </div>
              
              {/* Account Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Account Status</h3>
                
                <div>
                  <label htmlFor="user-mgmt-status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    id="user-mgmt-status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="active">Active - Can log in and access system</option>
                    <option value="inactive">Inactive - Cannot log in</option>
                  </select>
                </div>
                
                {/* Require Password Change Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="requirePasswordChange"
                    checked={formData.requirePasswordChange}
                    onChange={(e) => setFormData({ ...formData, requirePasswordChange: e.target.checked })}
                    disabled={isSaving}
                    className="mt-1 w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-pink-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <label htmlFor="requirePasswordChange" className="block text-sm font-medium text-gray-900 cursor-pointer">
                      Require password change on next login
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedUser 
                        ? 'User will be prompted to create a new password on their next login'
                        : 'User will be required to change their password immediately after first login'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Security Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-900">
                    <p className="font-semibold mb-1">Security Reminder</p>
                    <p className="text-yellow-800">
                      {selectedUser 
                        ? 'Changes to user permissions will take effect immediately upon saving.'
                        : 'The new admin user will be created with the specified credentials. Make sure the email address is correct.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUser(null);
                  setFormData({
                    username: '',
                    email: '',
                    role: 'viewer',
                    status: 'active',
                    clientAccess: 'all',
                    siteAccess: 'all',
                    requirePasswordChange: false,
                    password: '',
                    confirmPassword: ''
                  });
                }}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleSaveUser()}
                disabled={isSaving}
                className="px-4 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {selectedUser ? 'Save Changes' : 'Create Admin User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordReset && userToResetPassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
              <button
                onClick={() => {
                  setShowPasswordReset(false);
                  setUserToResetPassword(null);
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setRequireChangeOnNextLogin(false);
                }}
                disabled={isSaving}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Reset password for <span className="font-semibold text-gray-900">{userToResetPassword.username}</span>
              </p>
              
              <div>
                <label htmlFor="user-mgmt-new-password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <input
                  id="user-mgmt-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSaving}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label htmlFor="user-mgmt-confirm-new-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <input
                  id="user-mgmt-confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSaving}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requireChangeOnNextLogin"
                  checked={requireChangeOnNextLogin}
                  onChange={(e) => setRequireChangeOnNextLogin(e.target.checked)}
                  disabled={isSaving}
                  className="mt-1 w-4 h-4 text-[#D91C81] border-gray-300 rounded focus:ring-pink-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <label htmlFor="requireChangeOnNextLogin" className="block text-sm font-medium text-gray-900 cursor-pointer">
                  Require password change on next login
                </label>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  The user will need to use this new password on their next login.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => {
                  setShowPasswordReset(false);
                  setUserToResetPassword(null);
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setRequireChangeOnNextLogin(false);
                }}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleResetPassword()}
                disabled={isSaving}
                className="px-4 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#B71569] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}