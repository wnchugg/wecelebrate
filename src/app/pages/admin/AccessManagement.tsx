import { useState } from 'react';
import { Plus, Search, Mail, IdCard, CreditCard, Edit, Trash2, Upload, ArrowLeft, AlertCircle, Settings, Download, Server, Zap, Globe } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { Link } from 'react-router';
import { EmployeeImportModal, EmployeeRecord } from '../../components/admin/EmployeeImportModal';
import { SftpConfigModal, SftpConfig } from '../../components/admin/SftpConfigModal';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';

// SECURITY NOTE: This file only exports data to Excel (ExcelJS.writeBuffer).
// It does NOT import/parse external Excel files, so there are no security concerns.
// We migrated from xlsx to exceljs for better security and active maintenance.

export function AccessManagement() {
  const { currentSite, currentClient } = useSite();
  const [validationSettings, setValidationSettings] = useState({
    method: currentSite?.settings.validationMethod || 'email',
    requireApproval: false,
    allowSelfRegistration: true,
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSftpModal, setShowSftpModal] = useState(false);
  const [employeeData, setEmployeeData] = useState<EmployeeRecord[]>([]);
  const [sftpConfig, setSftpConfig] = useState<SftpConfig | undefined>(undefined);

  const handleImport = (records: EmployeeRecord[]) => {
    setEmployeeData(records);
    toast.success(`Successfully imported ${records.length} records`);
  };

  const handleSftpSave = (config: SftpConfig) => {
    setSftpConfig(config);
    toast.success('SFTP configuration saved successfully');
  };

  const exportTemplate = () => {
    const validationType = validationSettings.method;
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
    workbook.xlsx.writeBuffer().then(buffer => {
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
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: currentSite.branding.primaryColor }}
          >
            {currentClient.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Access Management</h1>
        <p className="text-gray-600 mt-1">Manage user access and validation methods for {currentClient.name}</p>
      </div>

      {/* Validation Method Selector */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Validation Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setValidationSettings({ ...validationSettings, method: 'email' })}
            className={`p-4 rounded-lg border-2 transition-all ${
              validationSettings.method === 'email'
                ? 'border-[#D91C81] bg-pink-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Mail className={`w-8 h-8 mb-2 ${validationSettings.method === 'email' ? 'text-[#D91C81]' : 'text-gray-400'}`} />
            <h3 className="font-semibold text-gray-900 mb-1">Email Address</h3>
            <p className="text-sm text-gray-600">Validate using employee email addresses</p>
          </button>

          <button
            onClick={() => setValidationSettings({ ...validationSettings, method: 'employeeId' })}
            className={`p-4 rounded-lg border-2 transition-all ${
              validationSettings.method === 'employeeId'
                ? 'border-[#D91C81] bg-pink-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <IdCard className={`w-8 h-8 mb-2 ${validationSettings.method === 'employeeId' ? 'text-[#D91C81]' : 'text-gray-400'}`} />
            <h3 className="font-semibold text-gray-900 mb-1">Employee ID</h3>
            <p className="text-sm text-gray-600">Validate using employee ID numbers</p>
          </button>

          <button
            onClick={() => setValidationSettings({ ...validationSettings, method: 'serialCard' })}
            className={`p-4 rounded-lg border-2 transition-all ${
              validationSettings.method === 'serialCard'
                ? 'border-[#D91C81] bg-pink-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard className={`w-8 h-8 mb-2 ${validationSettings.method === 'serialCard' ? 'text-[#D91C81]' : 'text-gray-400'}`} />
            <h3 className="font-semibold text-gray-900 mb-1">Serial Card</h3>
            <p className="text-sm text-gray-600">Validate using unique card numbers</p>
          </button>
        </div>
      </div>

      {/* SFTP Automation Card */}
      <div className="bg-gradient-to-r from-[#1B2A5E] to-[#D91C81] rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" />
              <h3 className="font-bold text-lg">Automated Employee Data Import</h3>
            </div>
            <p className="text-white/90 text-sm mb-4">
              Configure SFTP automation to automatically import employee data on a schedule
            </p>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowSftpModal(true)}
                variant="secondary"
                className="bg-white text-[#1B2A5E] hover:bg-white/90"
              >
                <Server className="w-4 h-4 mr-2" />
                Configure SFTP
              </Button>
              {sftpConfig?.enabled && (
                <Badge className="bg-green-500 text-white">
                  Automation Active
                </Badge>
              )}
            </div>
          </div>
          <Server className="w-16 h-16 text-white/20" />
        </div>
      </div>

      {/* Email Management */}
      {validationSettings.method === 'email' && (
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
              <Button className="bg-[#D91C81] hover:bg-[#B01669] text-white">
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
            <input
              type="text"
              placeholder="e.g., company.com, business.org"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">Comma-separated list of allowed email domains</p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search email addresses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            />
          </div>

          {/* Email List */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {['john.doe@company.com', 'jane.smith@company.com', 'mike.wilson@company.com', 'sarah.johnson@company.com', 'david.brown@company.com'].map((email, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="font-mono text-sm">{email}</span>
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

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">5 authorized email addresses</p>
            <button className="text-sm text-[#D91C81] hover:text-[#B71569] font-medium">
              View all →
            </button>
          </div>
        </div>
      )}

      {/* Employee ID Management */}
      {validationSettings.method === 'employeeId' && (
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
      {validationSettings.method === 'serialCard' && (
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

      {/* Modals */}
      <EmployeeImportModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        validationType={validationSettings.method as 'email' | 'employeeId' | 'serialCard' | 'magicLink'}
        onImport={handleImport}
      />

      <SftpConfigModal
        open={showSftpModal}
        onClose={() => setShowSftpModal(false)}
        config={sftpConfig}
        onSave={handleSftpSave}
      />
    </div>
  );
}