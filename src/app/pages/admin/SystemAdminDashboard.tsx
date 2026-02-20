import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Database, Server, Settings, Shield, Key, AlertCircle, CheckCircle, RefreshCw, TrendingUp, TrendingDown, Clock, Globe, Users, Activity, XCircle, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { BackendConnectionDiagnostic } from '../../components/BackendConnectionDiagnostic';
import { useAdmin } from '../../context/AdminContext';
import { useSite } from '../../context/SiteContext';
import { logger } from '../../utils/logger';
import { JWTDiagnosticBanner } from '../../components/admin/JWTDiagnosticBanner';
import { setPublicSiteDomain, clearPublicSiteDomain } from '../../utils/url';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { showSuccessToast, showErrorToast } from '../../utils/errorHandling';

const systemStats = [
  {
    name: 'System Uptime',
    value: '99.9%',
    change: '+0.1%',
    trend: 'up',
    icon: Settings,
    color: 'bg-green-500',
  },
  {
    name: 'Total Sites',
    value: '24',
    change: '+3',
    trend: 'up',
    icon: Database,
    color: 'bg-blue-500',
  },
  {
    name: 'Active Admins',
    value: '12',
    change: '+2',
    trend: 'up',
    icon: Shield,
    color: 'bg-[#D91C81]',
  },
  {
    name: 'API Response Time',
    value: '145ms',
    change: '-12ms',
    trend: 'up',
    icon: Server,
    color: 'bg-[#00B4CC]',
  },
];

const recentActivity = [
  { id: '1', action: 'New site created', user: 'admin@company.com', timestamp: '2 minutes ago', type: 'success' },
  { id: '2', action: 'Configuration updated', user: 'manager@company.com', timestamp: '15 minutes ago', type: 'info' },
  { id: '3', action: 'Failed login attempt', user: 'unknown@test.com', timestamp: '32 minutes ago', type: 'warning' },
  { id: '4', action: 'Database backup completed', user: 'system', timestamp: '1 hour ago', type: 'success' },
  { id: '5', action: 'New admin user added', user: 'superadmin@company.com', timestamp: '2 hours ago', type: 'success' },
];

const systemHealth = [
  { name: 'Database', status: 'healthy', latency: '12ms', icon: Database },
  { name: 'API Server', status: 'healthy', latency: '145ms', icon: Server },
  { name: 'Auth Service', status: 'healthy', latency: '23ms', icon: Shield },
  { name: 'Storage', status: 'warning', latency: '289ms', icon: Key },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <Activity className="w-5 h-5 text-blue-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'warning':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function SystemAdminDashboard() {
  const { adminUser } = useAdmin();
  const { sites, clients } = useSite();
  
  // State for deployment domain configuration
  const [deploymentDomain, setDeploymentDomain] = useState('');
  const [isEditingDomain, setIsEditingDomain] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [isSavingDomain, setIsSavingDomain] = useState(false);
  
  // Check if we're in preview environment
  const isPreviewEnv = window.location.hostname.includes('-v2-figmaiframepreview.figma.site');
  
  useEffect(() => {
    // Load stored domain on mount
    const storedDomain = localStorage.getItem('figma-public-site-domain');
    if (storedDomain) {
      setDeploymentDomain(storedDomain);
      setDomainInput(storedDomain);
    }
  }, []);
  
  const handleSaveDomain = () => {
    if (!domainInput.trim()) {
      showErrorToast(new Error('Please enter a valid domain'));
      return;
    }
    
    try {
      const url = new URL(domainInput.startsWith('http') ? domainInput : `https://${domainInput}`);
      const normalizedDomain = `https://${url.hostname}`;
      
      setIsSavingDomain(true);
      setPublicSiteDomain(normalizedDomain);
      setDeploymentDomain(normalizedDomain);
      
      setTimeout(() => {
        setIsSavingDomain(false);
        setIsEditingDomain(false);
        showSuccessToast('Deployment domain configured successfully!');
        logger.info('[SystemAdminDashboard] Deployment domain saved:', normalizedDomain);
      }, 500);
    } catch (err) {
      showErrorToast(new Error('Please enter a valid domain (e.g., https://your-site.figma.site or your-site.figma.site)'));
    }
  };
  
  const handleClearDomain = () => {
    clearPublicSiteDomain();
    setDeploymentDomain('');
    setDomainInput('');
    setIsEditingDomain(false);
    showSuccessToast('Deployment domain cleared');
    logger.info('[SystemAdminDashboard] Deployment domain cleared');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor system health, performance, and activity</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/audit-logs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Audit Logs
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D91C81] to-[#B71569] text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Shield className="w-4 h-4" />
            Admin Users
          </Link>
        </div>
      </div>

      {/* Backend Connection Diagnostic */}
      <BackendConnectionDiagnostic />

      {/* JWT Diagnostic Banner */}
      <JWTDiagnosticBanner />

      {/* System Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl p-6 border border-gray-200"
              style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.name}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-xl border border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">System Health</h2>
              <Link to="/admin/connection-test" className="text-sm text-[#D91C81] hover:text-[#B71569] font-medium">
                Run diagnostics →
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {systemHealth.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <div key={service.name} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ServiceIcon className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-600">Latency: {service.latency}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <Link to="/admin/audit-logs" className="text-sm text-[#D91C81] hover:text-[#B71569] font-medium">
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Globe className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-80">Total Sites</span>
          </div>
          <p className="text-4xl font-bold mb-2">{sites.length}</p>
          <p className="text-sm opacity-80">Across {clients.length} clients</p>
        </div>

        <div className="bg-gradient-to-br from-[#D91C81] to-[#B71569] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-80">Active Sites</span>
          </div>
          <p className="text-4xl font-bold mb-2">{sites.filter(s => s.status === 'active').length}</p>
          <p className="text-sm opacity-80">Currently operational</p>
        </div>

        <div className="bg-gradient-to-br from-[#00B4CC] to-[#0094A8] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-80">System Status</span>
          </div>
          <p className="text-4xl font-bold mb-2">Healthy</p>
          <p className="text-sm opacity-80">All systems operational</p>
        </div>
      </div>

      {/* Deployment Configuration */}
      {isPreviewEnv && (
        <div className="bg-white rounded-xl p-6 border border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Deployment Configuration</h2>
              <p className="text-sm text-gray-600 mt-1">Configure your deployed public site domain for correct link generation</p>
            </div>
            <Globe className="w-8 h-8 text-[#D91C81]" />
          </div>

          {deploymentDomain && !isEditingDomain ? (
            // Display configured domain
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Public site domain configured</p>
                    <p className="text-xs text-green-700 mt-1">
                      <span className="font-mono bg-green-100 px-2 py-0.5 rounded">{deploymentDomain}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingDomain(true)}
                    className="text-green-700 hover:text-green-900 hover:bg-green-100"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearDomain}
                    className="text-red-700 hover:text-red-900 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Edit/Configure domain
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-900 font-medium mb-1">Preview Environment Detected</p>
                    <p className="text-sm text-amber-800">
                      You're running in Figma's preview environment. Configure your deployed site domain to ensure 
                      "View Public Site" links point to the correct URL.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="domain-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Deployed Site URL
                </label>
                <div className="flex gap-2">
                  <Input
                    id="domain-input"
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="https://your-site.figma.site"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveDomain();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSaveDomain}
                    disabled={isSavingDomain || !domainInput.trim()}
                    className="bg-[#D91C81] hover:bg-[#B71569] text-white"
                  >
                    {isSavingDomain ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  {deploymentDomain && (
                    <Button
                      onClick={() => {
                        setIsEditingDomain(false);
                        setDomainInput(deploymentDomain);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Example: <code className="font-mono bg-gray-100 px-2 py-0.5 rounded">https://top-brick-95471034.figma.site</code>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">How to find your deployed domain:</p>
                    <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                      <li>Open your Figma file in edit mode</li>
                      <li>Click the "Play" button (▶) in the top-right to preview</li>
                      <li>Copy the URL from your browser (it will look like: <code className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">https://[name]-[id].figma.site</code>)</li>
                      <li>Paste it here and save</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Developer Tools Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Developer Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/config-management"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#D91C81] hover:bg-pink-50 transition-all group"
          >
            <Database className="w-8 h-8 text-[#D91C81]" />
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-[#D91C81]">Config Management</p>
              <p className="text-xs text-gray-600">View configurations</p>
            </div>
          </Link>

          <Link
            to="/admin/environment-management"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#00B4CC] hover:bg-cyan-50 transition-all group"
          >
            <Server className="w-8 h-8 text-[#00B4CC]" />
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-[#00B4CC]">Environment</p>
              <p className="text-xs text-gray-600">Manage environments</p>
            </div>
          </Link>

          <Link
            to="/admin/connection-test"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#1B2A5E] hover:bg-blue-50 transition-all group"
          >
            <Activity className="w-8 h-8 text-[#1B2A5E]" />
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-[#1B2A5E]">Connection Test</p>
              <p className="text-xs text-gray-600">Test connectivity</p>
            </div>
          </Link>

          <Link
            to="/admin/data-diagnostic"
            className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all group"
          >
            <Activity className="w-8 h-8 text-amber-500" />
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-amber-500">Data Diagnostic</p>
              <p className="text-xs text-gray-600">Check data health</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}