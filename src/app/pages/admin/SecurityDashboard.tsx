import { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import { toast } from 'sonner';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'rate_limit' | 'invalid_input' | 'auth_failure' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip?: string;
  userId?: string;
  details?: any;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  blockedRequests: number;
  authFailures: number;
  rateLimitHits: number;
}

export function SecurityDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    blockedRequests: 0,
    authFailures: 0,
    rateLimitHits: 0,
  });
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, [timeRange]);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from your audit log API
      // For now, showing mock data structure
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          type: 'rate_limit',
          severity: 'medium',
          description: 'Rate limit exceeded for API endpoint',
          ip: '192.168.1.100',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'auth_failure',
          severity: 'high',
          description: 'Multiple failed login attempts',
          ip: '192.168.1.101',
        },
      ];

      setEvents(mockEvents);
      setMetrics({
        totalEvents: 142,
        criticalEvents: 3,
        blockedRequests: 28,
        authFailures: 12,
        rateLimitHits: 45,
      });
    } catch (error) {
      logger.error('Error fetching security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rate_limit': return <Activity className="w-5 h-5" />;
      case 'auth_failure': return <Lock className="w-5 h-5" />;
      case 'invalid_input': return <AlertTriangle className="w-5 h-5" />;
      case 'suspicious_activity': return <Eye className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#D91C81] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#D91C81]" />
            Security Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage security events</p>
        </div>
        
        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-[#D91C81] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === '1h' ? '1 Hour' : range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={<Activity className="w-6 h-6 text-blue-600" />}
          label="Total Events"
          value={metrics.totalEvents}
          color="blue"
        />
        <MetricCard
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          label="Critical Events"
          value={metrics.criticalEvents}
          color="red"
        />
        <MetricCard
          icon={<XCircle className="w-6 h-6 text-orange-600" />}
          label="Blocked Requests"
          value={metrics.blockedRequests}
          color="orange"
        />
        <MetricCard
          icon={<Lock className="w-6 h-6 text-purple-600" />}
          label="Auth Failures"
          value={metrics.authFailures}
          color="purple"
        />
        <MetricCard
          icon={<Shield className="w-6 h-6 text-green-600" />}
          label="Rate Limit Hits"
          value={metrics.rateLimitHits}
          color="green"
        />
      </div>

      {/* Security Configuration Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Security Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SecurityFeature name="HTTPS Enabled" status="active" />
          <SecurityFeature name="Rate Limiting" status="active" />
          <SecurityFeature name="Input Sanitization" status="active" />
          <SecurityFeature name="CSRF Protection" status="active" />
          <SecurityFeature name="Security Headers" status="active" />
          <SecurityFeature name="Audit Logging" status="active" />
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Security Events</h2>
        
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p>No security events recorded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                      {getTypeIcon(event.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{event.description}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSeverityColor(event.severity)}`}>
                          {event.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      {event.ip && (
                        <p className="text-sm text-gray-500 mt-1">
                          IP: <code className="bg-gray-100 px-2 py-0.5 rounded">{event.ip}</code>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Recommendations */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Security Recommendations
        </h2>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <span className="text-gray-700">All security features are properly configured</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <span className="text-gray-700">Rate limiting is active and protecting endpoints</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <span className="text-gray-700">Input validation and sanitization implemented</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className={`text-2xl font-bold text-${color}-600`}>{value}</span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function SecurityFeature({ name, status }: { name: string; status: 'active' | 'inactive' | 'warning' }) {
  const statusConfig = {
    active: { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
    inactive: { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
    warning: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertTriangle },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bg}`}>
      <Icon className={`w-5 h-5 ${config.color}`} />
      <span className="text-sm font-medium text-gray-900">{name}</span>
    </div>
  );
}