import { useState } from 'react';
import { Search, Filter, Download, Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const logs = [
  { id: 1, timestamp: '2026-02-05 14:23:15', action: 'admin_login_success', user: 'admin', status: 'success', ip: '192.168.1.100', details: 'Super admin logged in' },
  { id: 2, timestamp: '2026-02-05 14:20:42', action: 'access_validation_success', user: 'john.doe@company.com', status: 'success', ip: '192.168.1.105', details: 'Email validation successful' },
  { id: 3, timestamp: '2026-02-05 14:18:33', action: 'order_created', user: 'jane.smith@company.com', status: 'success', ip: '192.168.1.108', details: 'Order ORD-1284 created' },
  { id: 4, timestamp: '2026-02-05 14:15:21', action: 'access_validation_failed', user: 'unknown@invalid.com', status: 'failure', ip: '192.168.1.200', details: 'Invalid email address' },
  { id: 5, timestamp: '2026-02-05 14:12:08', action: 'gift_viewed', user: 'mike.wilson@company.com', status: 'info', ip: '192.168.1.110', details: 'Viewed Premium Headphones' },
  { id: 6, timestamp: '2026-02-05 14:10:45', action: 'access_validation_rate_limit', user: 'suspicious@test.com', status: 'warning', ip: '192.168.1.250', details: 'Rate limit exceeded' },
  { id: 7, timestamp: '2026-02-05 14:08:12', action: 'gift_added', user: 'admin', status: 'success', ip: '192.168.1.100', details: 'Added new gift: Smart Watch Pro' },
  { id: 8, timestamp: '2026-02-05 14:05:33', action: 'order_updated', user: 'manager', status: 'success', ip: '192.168.1.101', details: 'Order ORD-1280 marked as shipped' },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'failure':
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    default:
      return <Info className="w-5 h-5 text-blue-600" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'failure':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">Security and activity monitoring</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#D91C81] text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-[#B71569] transition-all">
          <Download className="w-5 h-5" />
          Export Logs
        </button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
              <p className="text-sm text-gray-600">Successful Events</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">37</p>
              <p className="text-sm text-gray-600">Failed Events</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">Warnings</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-[#D91C81]" />
            <div>
              <p className="text-2xl font-bold text-gray-900">856</p>
              <p className="text-sm text-gray-600">Active Sessions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs by action, user, or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none">
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:border-[#D91C81] focus:ring-2 focus:ring-pink-100 outline-none">
            <option value="">All Actions</option>
            <option value="login">Login Events</option>
            <option value="validation">Validation Events</option>
            <option value="order">Order Events</option>
            <option value="gift">Gift Events</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
            <Filter className="w-5 h-5" />
            More Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">IP Address</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600 font-mono">{log.timestamp}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-900">{log.action}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">{log.user}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600 font-mono">{log.ip}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">{log.details}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Showing 1 to 8 of 1,296 logs</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium">
            Previous
          </button>
          <button className="px-4 py-2 bg-[#D91C81] text-white rounded-lg font-medium">
            1
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium">
            2
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium">
            3
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
