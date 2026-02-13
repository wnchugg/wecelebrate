import { useState, useEffect } from 'react';
import { 
  FileText,
  Download,
  Calendar,
  Send,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  FileImage,
  Mail,
  Settings,
  Plus,
  Trash2,
  Edit,
  Eye,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Gift,
  Award,
  DollarSign,
  Activity,
  AlertCircle
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  format: 'pdf' | 'csv' | 'xlsx';
  schedule: string;
  lastGenerated: string;
  recipients: number;
  status: 'active' | 'paused';
}

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  format: string;
  generatedAt: string;
  generatedBy: string;
  size: string;
  downloads: number;
  status: 'completed' | 'failed' | 'processing';
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: string;
  nextRun: string;
  lastRun: string;
  recipients: string[];
  format: string;
  status: 'active' | 'paused';
}

export default function ExportReportingSystem() {
  const [activeTab, setActiveTab] = useState<'templates' | 'scheduled' | 'history' | 'custom'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Report templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'tmpl_001',
      name: 'Monthly Analytics Summary',
      description: 'Comprehensive monthly analytics across all metrics',
      category: 'Analytics',
      format: 'pdf',
      schedule: 'Monthly',
      lastGenerated: '2026-02-01',
      recipients: 12,
      status: 'active'
    },
    {
      id: 'tmpl_002',
      name: 'Weekly Order Report',
      description: 'Order volume, revenue, and fulfillment metrics',
      category: 'Orders',
      format: 'xlsx',
      schedule: 'Weekly',
      lastGenerated: '2026-02-10',
      recipients: 8,
      status: 'active'
    },
    {
      id: 'tmpl_003',
      name: 'Employee Recognition Summary',
      description: 'Milestone tracking and recognition program performance',
      category: 'Recognition',
      format: 'pdf',
      schedule: 'Quarterly',
      lastGenerated: '2026-01-15',
      recipients: 5,
      status: 'active'
    },
    {
      id: 'tmpl_004',
      name: 'Catalog Performance',
      description: 'Product catalog analytics and vendor metrics',
      category: 'Catalogs',
      format: 'xlsx',
      schedule: 'Monthly',
      lastGenerated: '2026-02-01',
      recipients: 6,
      status: 'active'
    },
    {
      id: 'tmpl_005',
      name: 'Gift Selection Trends',
      description: 'Popular gifts, categories, and selection patterns',
      category: 'Gifting',
      format: 'csv',
      schedule: 'Weekly',
      lastGenerated: '2026-02-12',
      recipients: 4,
      status: 'active'
    },
    {
      id: 'tmpl_006',
      name: 'Executive Dashboard',
      description: 'High-level KPIs and strategic metrics',
      category: 'Executive',
      format: 'pdf',
      schedule: 'Weekly',
      lastGenerated: '2026-02-14',
      recipients: 15,
      status: 'active'
    }
  ];

  // Generated reports history
  const generatedReports: GeneratedReport[] = [
    {
      id: 'rep_001',
      name: 'Executive Dashboard - Week 7',
      type: 'Executive',
      format: 'PDF',
      generatedAt: '2026-02-14 09:30',
      generatedBy: 'System Admin',
      size: '2.4 MB',
      downloads: 15,
      status: 'completed'
    },
    {
      id: 'rep_002',
      name: 'Weekly Order Report - Week 7',
      type: 'Orders',
      format: 'Excel',
      generatedAt: '2026-02-14 08:00',
      generatedBy: 'Automated',
      size: '1.8 MB',
      downloads: 8,
      status: 'completed'
    },
    {
      id: 'rep_003',
      name: 'Gift Selection Trends - Week 7',
      type: 'Gifting',
      format: 'CSV',
      generatedAt: '2026-02-13 10:15',
      generatedBy: 'Sarah Johnson',
      size: '156 KB',
      downloads: 4,
      status: 'completed'
    },
    {
      id: 'rep_004',
      name: 'Monthly Analytics Summary - February',
      type: 'Analytics',
      format: 'PDF',
      generatedAt: '2026-02-01 07:00',
      generatedBy: 'Automated',
      size: '3.2 MB',
      downloads: 12,
      status: 'completed'
    },
    {
      id: 'rep_005',
      name: 'Catalog Performance - January',
      type: 'Catalogs',
      format: 'Excel',
      generatedAt: '2026-02-01 07:30',
      generatedBy: 'Automated',
      size: '2.1 MB',
      downloads: 6,
      status: 'completed'
    }
  ];

  // Scheduled reports
  const scheduledReports: ScheduledReport[] = [
    {
      id: 'sched_001',
      name: 'Executive Dashboard',
      frequency: 'Weekly (Monday 9:00 AM)',
      nextRun: '2026-02-17 09:00',
      lastRun: '2026-02-10 09:00',
      recipients: ['executives@company.com', 'board@company.com'],
      format: 'PDF',
      status: 'active'
    },
    {
      id: 'sched_002',
      name: 'Weekly Order Report',
      frequency: 'Weekly (Monday 8:00 AM)',
      nextRun: '2026-02-17 08:00',
      lastRun: '2026-02-10 08:00',
      recipients: ['operations@company.com', 'fulfillment@company.com'],
      format: 'Excel',
      status: 'active'
    },
    {
      id: 'sched_003',
      name: 'Monthly Analytics Summary',
      frequency: 'Monthly (1st day 7:00 AM)',
      nextRun: '2026-03-01 07:00',
      lastRun: '2026-02-01 07:00',
      recipients: ['analytics@company.com', 'management@company.com'],
      format: 'PDF',
      status: 'active'
    },
    {
      id: 'sched_004',
      name: 'Employee Recognition Summary',
      frequency: 'Quarterly (1st day 7:30 AM)',
      nextRun: '2026-04-01 07:30',
      lastRun: '2026-01-01 07:30',
      recipients: ['hr@company.com', 'people-ops@company.com'],
      format: 'PDF',
      status: 'active'
    }
  ];

  // Report statistics
  const reportStats = {
    totalReports: 1247,
    thisMonth: 156,
    scheduled: 24,
    activeRecipients: 87,
    avgGenerationTime: '2.3s',
    totalDownloads: 3542
  };

  // Quick export options
  const quickExportOptions = [
    { id: 'analytics', name: 'Analytics Dashboard', icon: BarChart3, color: 'bg-purple-500' },
    { id: 'orders', name: 'Order Summary', icon: Package, color: 'bg-blue-500' },
    { id: 'gifting', name: 'Gifting Report', icon: Gift, color: 'bg-pink-500' },
    { id: 'recognition', name: 'Recognition Report', icon: Award, color: 'bg-green-500' },
    { id: 'catalogs', name: 'Catalog Performance', icon: FileSpreadsheet, color: 'bg-orange-500' },
    { id: 'executive', name: 'Executive Summary', icon: TrendingUp, color: 'bg-red-500' }
  ];

  const categories = ['all', 'Analytics', 'Orders', 'Gifting', 'Recognition', 'Catalogs', 'Executive'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Export & Reporting System</h1>
          <p className="text-gray-600 mt-1">Generate, schedule, and manage all reports</p>
        </div>
        
        <button className="px-6 py-3 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors flex items-center gap-2 font-medium">
          <Plus className="w-5 h-5" />
          Create Custom Report
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-[#D91C81]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{reportStats.totalReports.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Total Reports</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-[#E94B9E]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{reportStats.thisMonth}</p>
          <p className="text-sm text-gray-600 mt-1">This Month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-[#F47BB6]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{reportStats.scheduled}</p>
          <p className="text-sm text-gray-600 mt-1">Scheduled</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-[#FF9ECE]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{reportStats.activeRecipients}</p>
          <p className="text-sm text-gray-600 mt-1">Recipients</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{reportStats.avgGenerationTime}</p>
          <p className="text-sm text-gray-600 mt-1">Avg Gen Time</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Download className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{reportStats.totalDownloads.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Downloads</p>
        </div>
      </div>

      {/* Quick Export Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Export</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickExportOptions.map((option) => (
            <button
              key={option.id}
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#D91C81] transition-colors group"
            >
              <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center text-white`}>
                <option.icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-[#D91C81]">{option.name}</p>
                <p className="text-sm text-gray-500">Export now</p>
              </div>
              <Download className="w-5 h-5 text-gray-400 ml-auto group-hover:text-[#D91C81]" />
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-2 p-2">
            {[
              { id: 'templates', label: 'Report Templates', icon: FileText },
              { id: 'scheduled', label: 'Scheduled Reports', icon: Clock },
              { id: 'history', label: 'Report History', icon: Calendar },
              { id: 'custom', label: 'Custom Builder', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#D91C81] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Report Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D91C81]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTemplates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:border-[#D91C81] transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#D91C81]" />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(template.status)}`}>
                          {template.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-[#D91C81]">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium text-gray-900">{template.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Format:</span>
                        <span className="font-medium text-gray-900">{template.format.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Schedule:</span>
                        <span className="font-medium text-gray-900">{template.schedule}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Recipients:</span>
                        <span className="font-medium text-gray-900">{template.recipients}</span>
                      </div>
                    </div>
                    
                    <button className="w-full py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Generate Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Reports Tab */}
          {activeTab === 'scheduled' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Run</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scheduledReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 text-[#D91C81] mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{report.name}</div>
                              <div className="text-xs text-gray-500">{report.format}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.frequency}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.nextRun}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.recipients.length} recipient(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button className="text-gray-400 hover:text-[#D91C81]">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Report History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generatedReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-[#D91C81] mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{report.name}</div>
                              <div className="text-xs text-gray-500">{report.type} • {report.format}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.generatedAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.generatedBy}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.size}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.downloads}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button className="text-gray-400 hover:text-[#D91C81]">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-blue-600">
                              <Mail className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Custom Builder Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 text-center">
                <Settings className="w-16 h-16 text-[#D91C81] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Custom Report Builder</h3>
                <p className="text-gray-600 mb-6">Build custom reports with your choice of metrics, filters, and formatting</p>
                <button className="px-6 py-3 bg-[#D91C81] text-white rounded-lg hover:bg-[#B91670] transition-colors font-medium">
                  Launch Builder
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D91C81] transition-colors cursor-pointer">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Select Metrics</h4>
                  <p className="text-sm text-gray-500">Choose data points to include</p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D91C81] transition-colors cursor-pointer">
                  <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Apply Filters</h4>
                  <p className="text-sm text-gray-500">Filter by date, category, etc.</p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#D91C81] transition-colors cursor-pointer">
                  <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Format Output</h4>
                  <p className="text-sm text-gray-500">Choose PDF, Excel, or CSV</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
