import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Users, 
  Upload, 
  Download, 
  Search,
  MapPin,
  Server,
  Database,
  Building2,
  RefreshCw
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { apiRequest } from '../../utils/api';
import { showSuccessToast, showErrorToast } from '../../utils/errorHandling';
import { ManualEmployeeUpload } from '../../components/admin/ManualEmployeeUpload';
import { SFTPConfiguration } from '../../components/admin/SFTPConfiguration';
import { HRISIntegrationTab } from '../../components/admin/HRISIntegrationTab';
import { SiteMappingRules } from '../../components/admin/SiteMappingRules';

interface Employee {
  id: string;
  clientId: string;
  siteId?: string;
  email: string;
  employeeId: string;
  serialCard: string;
  name: string;
  department: string;
  country: string;
  region: string;
  location: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

type TabType = 'manual' | 'sftp' | 'hris' | 'mapping' | 'employees';

export function EmployeeManagement() {
  const { currentClient, sites: allSites, isLoading: contextLoading } = useSite();
  const [activeTab, setActiveTab] = useState<TabType>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterSite, setFilterSite] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    mapped: 0,
    unmapped: 0
  });

  // Filter sites based on current client
  const sites = currentClient 
    ? allSites.filter(site => site.clientId === currentClient.id)
    : allSites;

  // Load employees when client changes
  useEffect(() => {
    if (currentClient) {
      loadEmployees();
    } else {
      setEmployees([]);
    }
  }, [currentClient]);

  const loadEmployees = async () => {
    if (!currentClient) return;

    setIsLoading(true);
    try {
      const { employees } = await apiRequest<{ employees: Employee[] }>(`/clients/${currentClient.id}/employees`);
      setEmployees(employees);
      
      // Calculate stats
      const total = employees.length;
      const active = employees.filter(e => e.status === 'active').length;
      const inactive = employees.filter(e => e.status === 'inactive').length;
      const mapped = employees.filter(e => e.siteId).length;
      const unmapped = employees.filter(e => !e.siteId).length;
      
      setStats({ total, active, inactive, mapped, unmapped });
    } catch (error: unknown) {
      showErrorToast('Failed to load employees', error instanceof Error ? error.message : 'Unknown error');
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportEmployees = () => {
    if (filteredEmployees.length === 0) {
      showErrorToast('No employees to export', '');
      return;
    }

    const csv = [
      ['Name', 'Email', 'Employee ID', 'Serial Card', 'Department', 'Country', 'Region', 'Location', 'Site', 'Status'].join(','),
      ...filteredEmployees.map(emp => [
        emp.name || '',
        emp.email || '',
        emp.employeeId || '',
        emp.serialCard || '',
        emp.department || '',
        emp.country || '',
        emp.region || '',
        emp.location || '',
        emp.siteId ? sites.find(s => s.id === emp.siteId)?.name || 'Unknown' : 'Not Mapped',
        emp.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees-${currentClient?.name}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showSuccessToast('Employees exported successfully');
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;
    const matchesSite = filterSite === 'all' || 
                        (filterSite === 'unmapped' && !emp.siteId) ||
                        emp.siteId === filterSite;
    
    return matchesSearch && matchesStatus && matchesSite;
  });

  const tabs = [
    { id: 'employees' as TabType, label: 'All Employees', icon: Users, count: stats.total },
    { id: 'mapping' as TabType, label: 'Site Mapping Rules', icon: MapPin, badge: `${stats.unmapped} unmapped` },
    { id: 'manual' as TabType, label: 'Manual Upload', icon: Upload },
    { id: 'sftp' as TabType, label: 'SFTP Integration', icon: Server },
    { id: 'hris' as TabType, label: 'HRIS Integration', icon: Database },
  ];

  if (!currentClient) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Client Selected</h2>
          <p className="text-gray-600">Please select a client to manage employees</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage employee data and site assignments</p>
          {currentClient && (
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-[#D91C81] text-white px-3 py-1">
                <Building2 className="w-3 h-3 mr-1.5" />
                {currentClient.name}
              </Badge>
              <span className="text-xs text-gray-500">
                {sites.length} {sites.length === 1 ? 'site' : 'sites'}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadEmployees}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={exportEmployees}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={employees.length === 0}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-600">Total Employees</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.inactive}</div>
                <div className="text-xs text-gray-600">Inactive</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.mapped}</div>
                <div className="text-xs text-gray-600">Mapped to Sites</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.unmapped}</div>
                <div className="text-xs text-gray-600">Unmapped</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Card className="p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#D91C81] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{tab.label}</span>
                {tab.count !== undefined && (
                  <Badge 
                    className={activeTab === tab.id ? 'bg-white text-[#D91C81]' : 'bg-gray-200 text-gray-700'}
                  >
                    {tab.count}
                  </Badge>
                )}
                {tab.badge && (
                  <Badge 
                    className={activeTab === tab.id ? 'bg-white text-[#D91C81]' : 'bg-orange-100 text-orange-700'}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'employees' && (
        <Card>
          <CardContent className="p-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, employee ID, department, or country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={filterSite}
                  onChange={(e) => setFilterSite(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
                >
                  <option value="all">All Sites</option>
                  <option value="unmapped">Unmapped</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employee Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-[#D91C81] mx-auto mb-2" />
                <p className="text-gray-600">Loading employees...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Employees Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try adjusting your search or filters' : 'Get started by uploading employee data'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setActiveTab('manual')}
                    className="bg-[#D91C81] hover:bg-[#B01669] text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Employees
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Site Assignment</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => {
                      const assignedSite = employee.siteId ? sites.find(s => s.id === employee.siteId) : null;
                      
                      return (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{employee.name}</div>
                              <div className="text-sm text-gray-600">{employee.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-sm text-gray-900">{employee.employeeId}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-900">{employee.department || '-'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm">
                              <div className="text-gray-900">{employee.country || '-'}</div>
                              {employee.region && (
                                <div className="text-gray-600 text-xs">{employee.region}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {assignedSite ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Building2 className="w-3 h-3 mr-1" />
                                {assignedSite.name}
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-800">
                                Not Mapped
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <Badge className={
                              employee.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }>
                              {employee.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination info */}
            {filteredEmployees.length > 0 && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'mapping' && (
        <SiteMappingRules 
          client={currentClient} 
          sites={sites} 
          onRulesUpdated={loadEmployees}
        />
      )}

      {activeTab === 'manual' && (
        <ManualEmployeeUpload 
          client={currentClient} 
          onUploadComplete={loadEmployees}
        />
      )}

      {activeTab === 'sftp' && (
        <SFTPConfiguration 
          client={currentClient}
          onConfigUpdated={loadEmployees}
        />
      )}

      {activeTab === 'hris' && (
        <HRISIntegrationTab
          client={currentClient}
          sites={sites.map(s => ({ ...s, isActive: s.status === 'active' })) as any}
          onSyncComplete={loadEmployees}
        />
      )}
    </div>
  );
}