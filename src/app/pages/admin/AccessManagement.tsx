import { useState, useEffect } from 'react';
import { Plus, Search, Mail, IdCard, CreditCard, Edit, Trash2, Upload, Download, Globe, Loader2, Users } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { EmployeeImportModal, EmployeeRecord } from '../../components/admin/EmployeeImportModal';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, importEmployees, type Employee } from '../../services/employeeApi';
import { AdvancedUserList } from '../../components/admin/AdvancedUserList';
import { EditUserModal } from '../../components/admin/EditUserModal';
import { SetPasswordModal } from '../../components/admin/SetPasswordModal';
import { getUsers, updateUser, setUserPassword } from '../../services/userApi';
import { AdvancedAuthUser } from '../../../types/advancedAuth';
import { useNameFormat } from '../../hooks/useNameFormat';
import { hasPermission } from '../../services/permissionService';

// SECURITY NOTE: This file only exports data to Excel (ExcelJS.writeBuffer).
// It does NOT import/parse external Excel files, so there are no security concerns.
// We migrated from xlsx to exceljs for better security and active maintenance.

interface AccessManagementProps {
  mode?: 'simple' | 'advanced';
  validationMethod?: 'email' | 'employeeId' | 'serialCard' | 'magic_link' | 'sso';
}

export function AccessManagement({ 
  mode = 'simple', 
  validationMethod = 'email' 
}: AccessManagementProps) {
  const { currentSite, currentClient, updateSite } = useSite();
  const { formatFullName } = useNameFormat();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allowedDomains, setAllowedDomains] = useState<string>('');
  
  // Form state for adding/editing employee
  const [formData, setFormData] = useState({
    email: '',
    employeeId: '',
    serialCard: '',
    name: '',
    department: '',
  });

  // Advanced Auth state
  const [users, setUsers] = useState<AdvancedAuthUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdvancedAuthUser | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [hasProxyPermission, setHasProxyPermission] = useState(false);

  // Check permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const proxyPermission = await hasPermission('proxy_login');
      setHasProxyPermission(proxyPermission);
    };
    
    void checkPermissions();
  }, []);

  // Load employees when site changes
  useEffect(() => {
    if (currentSite?.id) {
      if (mode === 'advanced') {
        void loadUsers();
      } else {
        void loadEmployees();
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      const domains = (currentSite.settings as any).allowedDomains;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      setAllowedDomains(domains ? domains.join(', ') : '');
    }
  }, [currentSite?.id, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    if (!currentSite?.id) return;
    
    setLoading(true);
    try {
      const data = await getUsers(currentSite.id);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    if (!currentSite?.id) return;
    
    setLoading(true);
    try {
      const data = await getEmployees(currentSite.id);
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
      // Only show error toast if it's not just an empty table
      if (error instanceof Error && !error.message.includes('PGRST116')) {
        toast.error('Failed to load employees');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!currentSite?.id) return;
    
    // Validate at least one identifier
    if (!formData.email && !formData.employeeId && !formData.serialCard) {
      toast.error('Please provide at least one identifier (email, employee ID, or serial card)');
      return;
    }
    
    setLoading(true);
    try {
      await createEmployee(currentSite.id, formData);
      toast.success('Employee added successfully');
      setShowAddModal(false);
      setFormData({ email: '', employeeId: '', serialCard: '', name: '', department: '' });
      await loadEmployees();
    } catch (error) {
      console.error('Failed to add employee:', error);
      toast.error('Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!currentSite?.id || !editingEmployee) return;
    
    setLoading(true);
    try {
      await updateEmployee(editingEmployee.id, currentSite.id, formData);
      toast.success('Employee updated successfully');
      setEditingEmployee(null);
      setFormData({ email: '', employeeId: '', serialCard: '', name: '', department: '' });
      await loadEmployees();
    } catch (error) {
      console.error('Failed to update employee:', error);
      toast.error('Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!currentSite?.id) return;
    
    if (!confirm('Are you sure you want to deactivate this employee?')) return;
    
    setLoading(true);
    try {
      await deleteEmployee(employeeId, currentSite.id);
      toast.success('Employee deactivated successfully');
      await loadEmployees();
    } catch (error) {
      console.error('Failed to delete employee:', error);
      toast.error('Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (records: EmployeeRecord[]) => {
    if (!currentSite?.id) return;
    
    setLoading(true);
    try {
      const result = await importEmployees(currentSite.id, records);
      setEmployeeData(records);
      toast.success(`Successfully imported ${result.imported} employees`);
      if (result.errors && result.errors.length > 0) {
        toast.warning(`${result.errors.length} records had errors`);
      }
      await loadEmployees();
    } catch (error) {
      console.error('Failed to import employees:', error);
      toast.error('Failed to import employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllowedDomains = async () => {
    if (!currentSite?.id) return;
    
    setLoading(true);
    try {
      const domains = allowedDomains
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);
      
       
      await updateSite(currentSite.id, {
        settings: {
          ...currentSite.settings,
          allowedDomains: domains,
        } as any,
      });
      
      toast.success('Allowed domains saved successfully');
    } catch (error) {
      console.error('Failed to save allowed domains:', error);
      toast.error('Failed to save allowed domains');
    } finally {
      setLoading(false);
    }
  };

  // Advanced Auth handlers
  const handleEditUser = (user: AdvancedAuthUser) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const handleSetPassword = (user: AdvancedAuthUser) => {
    setSelectedUser(user);
    setShowSetPasswordModal(true);
  };

  const handleProxyLogin = async (user: AdvancedAuthUser) => {
    if (!currentSite?.id) return;
    
    try {
      setLoading(true);
      
      // Create proxy session
      const { createProxySession } = await import('../../services/proxyLoginApi');
      const session = await createProxySession({
        adminId: '', // Will be set by backend from auth token
        employeeId: user.id,
        siteId: currentSite.id,
        durationMinutes: 30,
      });
      
      // Store token in localStorage
      localStorage.setItem('proxy_session_token', session.token);
      
      // Open site in new tab with proxy session
      const siteUrl = `${window.location.origin}/site/${currentSite.slug}`;
      window.open(siteUrl, '_blank');
      
      toast.success(`Proxy session created for ${formatFullName(user.firstName, user.lastName)}`);
    } catch (error) {
      console.error('Failed to create proxy session:', error);
      toast.error('Failed to create proxy session');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (userId: string, updates: Partial<AdvancedAuthUser>) => {
    if (!currentSite?.id) return;
    
    try {
      await updateUser({
        userId,
        siteId: currentSite.id,
        firstName: updates.firstName,
        lastName: updates.lastName,
        email: updates.email,
        employeeId: updates.employeeId,
        role: updates.role,
        status: updates.status,
      });
      toast.success('User updated successfully');
      await loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
      throw error;
    }
  };

  const handleSavePassword = async (userId: string, password: string, forceReset: boolean) => {
    if (!currentSite?.id) return;
    
    try {
      await setUserPassword({
        userId,
        siteId: currentSite.id,
        temporaryPassword: password,
        forcePasswordReset: forceReset,
        sendEmail: true,
      });
      toast.success('Password set successfully. Email sent to user.');
      await loadUsers();
    } catch (error) {
      console.error('Failed to set password:', error);
      toast.error('Failed to set password');
      throw error;
    }
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      email: employee.email || '',
      employeeId: employee.employeeId || '',
      serialCard: employee.serialCard || '',
      name: employee.name || '',
      department: employee.department || '',
    });
  };

  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.toLowerCase();
    return (
      emp.email?.toLowerCase().includes(query) ||
      emp.employeeId?.toLowerCase().includes(query) ||
      emp.serialCard?.toLowerCase().includes(query) ||
      emp.name?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query)
    );
  });

  const exportTemplate = () => {
    const validationType = validationMethod;
    let headers: string[] = [];
    let sampleData: string[][] = [];

    switch (validationType) {
      case 'email':
        headers = ['Email Address', 'First Name', 'Last Name', 'Department'];
        sampleData = [
          ['john.doe@company.com', 'John', 'Doe', 'Engineering'],
          ['jane.smith@company.com', 'Jane', 'Smith', 'Marketing'],
        ];
        break;
      case 'employeeId':
        headers = ['Employee ID', 'First Name', 'Last Name', 'Department'];
        sampleData = [
          ['EMP-001', 'John', 'Doe', 'Engineering'],
          ['EMP-002', 'Jane', 'Smith', 'Marketing'],
        ];
        break;
      case 'serialCard':
        headers = ['Card Number', 'Employee Name', 'Department', 'Status'];
        sampleData = [
          ['CARD-ABC123XYZ', 'John Doe', 'Engineering', 'Active'],
          ['CARD-DEF456UVW', 'Jane Smith', 'Marketing', 'Active'],
        ];
        break;
      default:
        headers = ['Identifier', 'Name'];
        sampleData = [['sample@email.com', 'Sample User']];
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template');
    worksheet.addRow(headers);
    sampleData.forEach(row => worksheet.addRow(row));

    // Generate filename
    const filename = `${validationType}_import_template.xlsx`;

    // Download file
    void workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([new Uint8Array(buffer as unknown as ArrayBuffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
    toast.success('Template downloaded successfully');
  };

  if (!currentSite || !currentClient) {
    return (
      <div className="text-center py-12">
        <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Please select a site to manage access</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Management */}
      {validationMethod === 'email' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Authorized Email Addresses</h2>
              <p className="text-sm text-gray-600 mt-1">
                {employeeData.length} employee{employeeData.length !== 1 ? 's' : ''} imported
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={exportTemplate}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button 
                className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Email
              </Button>
            </div>
          </div>

          {/* Domain Filter */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Allowed Domains (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., company.com, business.org"
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
              />
              <Button
                onClick={() => void handleSaveAllowedDomains()}
                disabled={loading}
                className="bg-[#D91C81] hover:bg-[#B01669] text-white"
              >
                Save
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Comma-separated list of allowed email domains</p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search email addresses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            />
          </div>

          {/* Email List */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#D91C81] animate-spin" />
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No employees found</p>
                <p className="text-sm text-gray-500 mt-1">Add employees to manage access</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <span className="font-mono text-sm block">{employee.email}</span>
                        {employee.name && <span className="text-xs text-gray-500">{employee.name}</span>}
                      </div>
                      {employee.status === 'inactive' && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                        onClick={() => openEditModal(employee)}
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        className="p-2 hover:bg-red-50 rounded-lg transition-all"
                        onClick={() => void handleDeleteEmployee(employee.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        </div>
      )}

      {/* Employee ID Management */}
      {validationMethod === 'employeeId' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Authorized Employee IDs</h2>
              <p className="text-sm text-gray-600 mt-1">
                {employeeData.length} employee{employeeData.length !== 1 ? 's' : ''} imported
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={exportTemplate}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button className="bg-[#D91C81] hover:bg-[#B01669] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee ID
              </Button>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee IDs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            />
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005'].map((id, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <IdCard className="w-5 h-5 text-gray-400" />
                    <span className="font-mono text-sm font-semibold">{id}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Serial Card Management */}
      {validationMethod === 'serialCard' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Serial Card Numbers</h2>
              <p className="text-sm text-gray-600 mt-1">
                {employeeData.length} card{employeeData.length !== 1 ? 's' : ''} imported
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={exportTemplate}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button className="bg-[#D91C81] hover:bg-[#B01669] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Generate Cards
              </Button>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search serial numbers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            />
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {['CARD-ABC123XYZ', 'CARD-DEF456UVW', 'CARD-GHI789RST', 'CARD-JKL012MNO', 'CARD-PQR345JKL'].map((card, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="font-mono text-sm font-semibold">{card}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200">
                      Active
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Auth User Management */}
      {mode === 'advanced' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D91C81]" />
                User Management
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage employee accounts, passwords, and permissions
              </p>
            </div>
          </div>

          <AdvancedUserList
            users={users}
            loading={loading}
            onEditUser={handleEditUser}
            onSetPassword={handleSetPassword}
            onProxyLogin={handleProxyLogin}
            hasProxyPermission={hasProxyPermission}
          />
        </div>
      )}

      {/* Modals */}
      <EmployeeImportModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        validationType={validationMethod as 'email' | 'employeeId' | 'serialCard' | 'magicLink'}
        onImport={(records) => void handleImport(records)}
      />

      {/* Add/Edit Employee Modal */}
      {(showAddModal || editingEmployee) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingEmployee ? 'Edit Employee' : 'Add Employee'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address {validationMethod === 'email' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  placeholder="john.doe@company.com"
                />
              </div>

              {validationMethod === 'employeeId' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    placeholder="EMP-001"
                  />
                </div>
              )}

              {validationMethod === 'serialCard' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Card <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.serialCard}
                    onChange={(e) => setFormData({ ...formData, serialCard: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                    placeholder="CARD-ABC123XYZ"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  placeholder="Engineering"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEmployee(null);
                  setFormData({ email: '', employeeId: '', serialCard: '', name: '', department: '' });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void (editingEmployee ? handleUpdateEmployee() : handleAddEmployee())}
                disabled={loading}
                className="flex-1 bg-[#D91C81] hover:bg-[#B01669] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingEmployee ? 'Update' : 'Add'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Auth Modals */}
      <EditUserModal
        open={showEditUserModal}
        user={selectedUser}
        onClose={() => {
          setShowEditUserModal(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
      />

      <SetPasswordModal
        open={showSetPasswordModal}
        user={selectedUser}
        onClose={() => {
          setShowSetPasswordModal(false);
          setSelectedUser(null);
        }}
        onSetPassword={handleSavePassword}
      />
    </div>
  );
}