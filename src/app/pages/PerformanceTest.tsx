import { useEffect, useState } from 'react';
import { Activity, TrendingUp, RefreshCw, Download, Database, Zap, Image as ImageIcon } from 'lucide-react';
import { performanceMonitor } from '../utils/performanceMonitor';
import { getCacheStats, clearAllCaches } from '../utils/apiCache';

export function PerformanceTest() {
  const [metrics, setMetrics] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [webVitals, setWebVitals] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = () => {
    setIsRefreshing(true);
    
    // Get performance data
    const summary = performanceMonitor.getSummary();
    const vitals = performanceMonitor.getWebVitals();
    const stats = getCacheStats();

    setMetrics(summary);
    setWebVitals(vitals);
    setCacheStats(stats);
    
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearCache = () => {
    clearAllCaches();
    loadData();
  };

  const handleClearMetrics = () => {
    performanceMonitor.clear();
    loadData();
  };

  const handleDownloadReport = () => {
    const report = performanceMonitor.getMetrics();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                P1.5 - Performance Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time performance monitoring and optimization metrics
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-[#00B4CC] text-white rounded-lg hover:bg-[#008FA8] disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-[#D91C81] text-white rounded-lg hover:bg-[#B71569] transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total Metrics</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {metrics?.totalMetrics || 0}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-900">Avg Duration</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {metrics?.averageDuration ? `${metrics.averageDuration.toFixed(0)}ms` : '—'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Cache Entries</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {cacheStats?.active || 0}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <ImageIcon className="w-6 h-6 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">FCP</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {webVitals?.fcp ? `${webVitals.fcp.toFixed(0)}ms` : '—'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
              <button
                onClick={handleClearMetrics}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear Metrics
              </button>
            </div>

            {metrics && metrics.totalMetrics > 0 ? (
              <div className="space-y-4">
                {/* Metrics by Type */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Metrics by Type</h3>
                  <div className="space-y-2">
                    {Object.entries(metrics.byType || {}).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{type}</span>
                        <span className="text-sm font-semibold text-gray-900">{String(count)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slowest/Fastest */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Extremes</h3>
                  {metrics.slowest && (
                    <div className="mb-3">
                      <div className="text-xs text-red-600 font-medium mb-1">Slowest</div>
                      <div className="text-sm text-gray-900 font-mono bg-red-50 p-2 rounded">
                        {metrics.slowest.name}: {metrics.slowest.duration.toFixed(2)}ms
                      </div>
                    </div>
                  )}
                  {metrics.fastest && (
                    <div>
                      <div className="text-xs text-green-600 font-medium mb-1">Fastest</div>
                      <div className="text-sm text-gray-900 font-mono bg-green-50 p-2 rounded">
                        {metrics.fastest.name}: {metrics.fastest.duration.toFixed(2)}ms
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No performance metrics collected yet</p>
                <p className="text-sm mt-2">Navigate through the app to collect data</p>
              </div>
            )}
          </div>

          {/* Web Vitals */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Web Vitals</h2>

            {webVitals && Object.keys(webVitals).length > 0 ? (
              <div className="space-y-4">
                {webVitals.fcp && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-blue-900">First Contentful Paint</div>
                      <div className="text-xs text-blue-700">Time to first content render</div>
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                      {webVitals.fcp.toFixed(0)}ms
                    </div>
                  </div>
                )}

                {webVitals.domContentLoaded !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-green-900">DOM Content Loaded</div>
                      <div className="text-xs text-green-700">DOM parsing complete</div>
                    </div>
                    <div className="text-lg font-bold text-green-900">
                      {webVitals.domContentLoaded.toFixed(0)}ms
                    </div>
                  </div>
                )}

                {webVitals.loadComplete !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-purple-900">Load Complete</div>
                      <div className="text-xs text-purple-700">All resources loaded</div>
                    </div>
                    <div className="text-lg font-bold text-purple-900">
                      {webVitals.loadComplete.toFixed(0)}ms
                    </div>
                  </div>
                )}

                {webVitals.totalLoadTime !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-orange-900">Total Load Time</div>
                      <div className="text-xs text-orange-700">From fetch to complete</div>
                    </div>
                    <div className="text-lg font-bold text-orange-900">
                      {webVitals.totalLoadTime.toFixed(0)}ms
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No Web Vitals available</p>
                <p className="text-sm mt-2">Refresh the page to collect vitals</p>
              </div>
            )}
          </div>

          {/* API Cache Stats */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">API Cache</h2>
              <button
                onClick={handleClearCache}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear Cache
              </button>
            </div>

            {cacheStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{cacheStats.total}</div>
                    <div className="text-xs text-blue-700 mt-1">Total</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">{cacheStats.active}</div>
                    <div className="text-xs text-green-700 mt-1">Active</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-900">{cacheStats.expired}</div>
                    <div className="text-xs text-red-700 mt-1">Expired</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Benefits</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Reduces redundant network requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Faster subsequent page loads</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Lower server load</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Loading cache statistics...</p>
              </div>
            )}
          </div>

          {/* Optimization Tips */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Optimizations Applied</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Route-Based Code Splitting</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Lazy loading reduces initial bundle by 60-70%
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">API Response Caching</div>
                  <div className="text-sm text-gray-600 mt-1">
                    5-minute TTL with automatic cleanup
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Image Lazy Loading</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Intersection Observer with 50px preload margin
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Performance Monitoring</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Real-time metrics and Web Vitals tracking
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">React Optimizations</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Custom hooks for debouncing, throttling, and more
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <a
            href="/system-status"
            className="inline-block px-6 py-3 bg-white text-[#D91C81] rounded-lg hover:bg-gray-50 transition-all shadow-md"
          >
            ← Back to System Status
          </a>
        </div>
      </div>
    </div>
  );
}