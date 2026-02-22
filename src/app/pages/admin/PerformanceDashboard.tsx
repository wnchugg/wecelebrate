/**
 * Performance Dashboard
 * Admin page for monitoring application performance
 * Phase 2.3: Performance Optimization
 */

import { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, Database, Code, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { getCacheStats, clearAllCaches } from '../../utils/apiCache';
import { toast } from 'sonner';
import { logger } from '../../utils/logger';

export function PerformanceDashboard() {
  const [webVitals, setWebVitals] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [customMetrics, setCustomMetrics] = useState<any[]>([]);
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(performanceMonitor.isEnabled());
  const [refreshKey, setRefreshKey] = useState(0);

  // Load performance data
  const loadData = () => {
    setWebVitals(performanceMonitor.getWebVitals());
    setCacheStats(getCacheStats());
    const summary = performanceMonitor.getSummary();
    setCustomMetrics(summary.customMetrics || []);
    setIsMonitoringEnabled(performanceMonitor.isEnabled());
    logger.log('[PerformanceDashboard] Data refreshed');
  };

  useEffect(() => {
    void loadData();
  }, [refreshKey]);

  const handleToggleMonitoring = () => {
    if (isMonitoringEnabled) {
      performanceMonitor.disable();
      toast.success('Performance monitoring disabled');
    } else {
      performanceMonitor.enable();
      toast.success('Performance monitoring enabled');
    }
    setIsMonitoringEnabled(!isMonitoringEnabled);
  };

  const handleClearCache = () => {
    clearAllCaches();
    toast.success('All caches cleared');
    void loadData();
  };

  const handleClearMetrics = () => {
    performanceMonitor.clear();
    toast.success('Performance metrics cleared');
    void loadData();
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good': return <CheckCircle className="w-5 h-5" />;
      case 'needs-improvement': return <AlertTriangle className="w-5 h-5" />;
      case 'poor': return <XCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#D91C81]" />
            Performance Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor application performance and Web Vitals</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleToggleMonitoring}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              isMonitoringEnabled 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            {isMonitoringEnabled ? 'Monitoring On' : 'Monitoring Off'}
          </button>
        </div>
      </div>

      {/* Monitoring Status Alert */}
      {!isMonitoringEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Performance monitoring is disabled</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Enable monitoring to track Web Vitals and custom metrics. Monitoring is automatically disabled in production for performance.
            </p>
          </div>
        </div>
      )}

      {/* Web Vitals */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#D91C81]" />
          Web Vitals
        </h2>
        
        {webVitals && Object.keys(webVitals).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].map((vitalName) => {
              const vital = webVitals[vitalName];
              if (!vital) return null;

              return (
                <div
                  key={vitalName}
                  className={`p-4 rounded-lg border-2 ${getRatingColor(vital.rating)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{vitalName}</span>
                    {getRatingIcon(vital.rating)}
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {vital.value}{vitalName === 'CLS' ? '' : 'ms'}
                  </div>
                  <div className="text-xs capitalize">{vital.rating.replace('-', ' ')}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No Web Vitals data available yet</p>
            <p className="text-sm mt-1">Data will appear after page interactions</p>
          </div>
        )}

        {/* Web Vitals Legend */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">What are Web Vitals?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium">LCP (Largest Contentful Paint):</span>
              <p className="text-gray-600">Time to render largest element (Good: &lt;2.5s)</p>
            </div>
            <div>
              <span className="font-medium">FID (First Input Delay):</span>
              <p className="text-gray-600">Time to first user interaction (Good: &lt;100ms)</p>
            </div>
            <div>
              <span className="font-medium">CLS (Cumulative Layout Shift):</span>
              <p className="text-gray-600">Visual stability score (Good: &lt;0.1)</p>
            </div>
            <div>
              <span className="font-medium">FCP (First Contentful Paint):</span>
              <p className="text-gray-600">Time to first content render (Good: &lt;1.8s)</p>
            </div>
            <div>
              <span className="font-medium">TTFB (Time to First Byte):</span>
              <p className="text-gray-600">Server response time (Good: &lt;800ms)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-[#D91C81]" />
            Cache Statistics
          </h2>
          <button
            onClick={handleClearCache}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
          >
            Clear All Caches
          </button>
        </div>

        {cacheStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['api', 'staticData', 'userData'].map((cacheType) => {
              const stats = cacheStats[cacheType];
              const percentage = ((stats.size / stats.maxSize) * 100).toFixed(1);

              return (
                <div key={cacheType} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 capitalize mb-3">
                    {cacheType.replace(/([A-Z])/g, ' $1').trim()} Cache
                  </h3>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Usage</span>
                      <span className="font-medium">{stats.size} / {stats.maxSize}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#D91C81] h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{percentage}% full</div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Entries:</span>
                      <span className="font-medium">{stats.entries.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Database className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No cache data available</p>
          </div>
        )}
      </div>

      {/* Custom Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#D91C81]" />
            Custom Metrics
          </h2>
          <button
            onClick={handleClearMetrics}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Clear Metrics
          </button>
        </div>

        {customMetrics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Metric Name</th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Value</th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {customMetrics.slice().reverse().map((metric, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-sm text-gray-900">{metric.name}</td>
                    <td className="py-2 px-3 text-sm text-right font-mono">{metric.value}ms</td>
                    <td className="py-2 px-3 text-sm text-right text-gray-600">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No custom metrics recorded yet</p>
            <p className="text-sm mt-1">Metrics will appear as you use the application</p>
          </div>
        )}
      </div>

      {/* Performance Tips */}
      <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-lg p-6 border border-pink-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Code className="w-5 h-5 text-[#D91C81]" />
          Performance Optimization Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">✅ Implemented</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Route-based code splitting</li>
              <li>• API response caching</li>
              <li>• Virtual scrolling for large lists</li>
              <li>• Lazy image loading</li>
              <li>• Performance monitoring</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">💡 Best Practices</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use React.memo for pure components</li>
              <li>• Debounce search inputs</li>
              <li>• Optimize images (size & format)</li>
              <li>• Minimize bundle size</li>
              <li>• Monitor Web Vitals regularly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Documentation Link */}
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="font-semibold text-gray-800 mb-2">📚 Documentation</h3>
        <p className="text-sm text-gray-600 mb-3">
          For detailed performance optimization guidelines, see:
        </p>
        <code className="text-sm bg-gray-100 px-3 py-1 rounded text-[#D91C81]">
          /PERFORMANCE_OPTIMIZATION.md
        </code>
      </div>
    </div>
  );
}