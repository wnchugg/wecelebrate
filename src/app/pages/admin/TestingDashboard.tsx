/**
 * Testing Dashboard - Real-time test results and CI/CD status
 * Shows latest deployment testing results and quality metrics
 */

import React, { useState } from 'react';
import { 
  TestTube2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Activity,
  BarChart3,
  GitBranch,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export function TestingDashboard() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - in production, this would fetch from CI/CD API or test results
  const testResults = {
    totalTests: 853,
    passing: 853,
    failing: 0,
    skipped: 0,
    duration: '1.66s',
    lastRun: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    coverage: {
      statements: 85.2,
      branches: 80.1,
      functions: 82.5,
      lines: 85.4
    }
  };

  const testSuites = [
    {
      name: 'UI Components',
      tests: 652,
      passing: 652,
      failing: 0,
      duration: '487ms',
      coverage: 95,
      status: 'passing'
    },
    {
      name: 'Routes',
      tests: 81,
      passing: 81,
      failing: 0,
      duration: '6ms',
      coverage: 100,
      status: 'passing'
    },
    {
      name: 'Navigation Flow',
      tests: 25,
      passing: 25,
      failing: 0,
      duration: '302ms',
      coverage: 88,
      status: 'passing'
    },
    {
      name: 'Cross-Component Integration',
      tests: 26,
      passing: 26,
      failing: 0,
      duration: '514ms',
      coverage: 82,
      status: 'passing'
    },
    {
      name: 'Shopping Flow E2E',
      tests: 22,
      passing: 22,
      failing: 0,
      duration: '399ms',
      coverage: 78,
      status: 'passing'
    },
    {
      name: 'User Journey',
      tests: 25,
      passing: 25,
      failing: 0,
      duration: '1529ms',
      coverage: 85,
      status: 'passing'
    },
    {
      name: 'Complex Scenarios',
      tests: 22,
      passing: 22,
      failing: 0,
      duration: '435ms',
      coverage: 90,
      status: 'passing'
    }
  ];

  const performanceBenchmarks = [
    { name: 'Small Lists (10 items)', threshold: 50, actual: 25, status: 'excellent' },
    { name: 'Medium Lists (50 items)', threshold: 100, actual: 68, status: 'good' },
    { name: 'Large Lists (100 items)', threshold: 200, actual: 142, status: 'good' },
    { name: 'Button Clicks', threshold: 10, actual: 4, status: 'excellent' },
    { name: 'Form Input', threshold: 20, actual: 12, status: 'excellent' },
    { name: 'Cart Context Updates', threshold: 30, actual: 18, status: 'excellent' },
    { name: 'Auth Context Updates', threshold: 30, actual: 16, status: 'excellent' },
    { name: 'Language Context Updates', threshold: 30, actual: 14, status: 'excellent' }
  ];

  const cicdPipeline = {
    status: 'passing',
    lastDeployment: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
    branch: 'main',
    commit: 'a7f3c9d',
    stages: [
      { name: 'Code Quality', status: 'passed', duration: '12s' },
      { name: 'Unit Tests', status: 'passed', duration: '2.4s' },
      { name: 'Integration Tests', status: 'passed', duration: '1.7s' },
      { name: 'Coverage', status: 'passed', duration: '3.1s' },
      { name: 'Performance', status: 'passed', duration: '5.2s' },
      { name: 'Visual Tests', status: 'passed', duration: '45s' },
      { name: 'Build', status: 'passed', duration: '38s' },
      { name: 'Security Scan', status: 'passed', duration: '22s' },
      { name: 'Deploy', status: 'passed', duration: '2m 15s' }
    ]
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passing':
      case 'passed':
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failing':
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passing':
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failing':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <TestTube2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Testing Dashboard</h1>
            <p className="text-gray-600 mt-1">Real-time test results and CI/CD pipeline status</p>
          </div>
        </div>
        
        <Button
          onClick={() => void handleRefresh()}
          disabled={isRefreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tests */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{testResults.totalTests}</div>
                <p className="text-sm text-gray-600 mt-1">100% passing</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Coverage */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Code Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{testResults.coverage.statements.toFixed(1)}%</div>
                <p className="text-sm text-gray-600 mt-1">Statements</p>
              </div>
              <BarChart3 className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Duration */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Execution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">{testResults.duration}</div>
                <p className="text-sm text-gray-600 mt-1">Very fast!</p>
              </div>
              <Zap className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Last Run */}
        <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Last Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatTimeAgo(testResults.lastRun)}</div>
                <p className="text-sm text-gray-600 mt-1">Auto-triggered</p>
              </div>
              <Clock className="w-10 h-10 text-gray-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test-suites">Test Suites</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cicd">CI/CD Pipeline</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Coverage Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Coverage Metrics</CardTitle>
              <CardDescription>Code coverage breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Statements', value: testResults.coverage.statements },
                  { label: 'Branches', value: testResults.coverage.branches },
                  { label: 'Functions', value: testResults.coverage.functions },
                  { label: 'Lines', value: testResults.coverage.lines }
                ].map((metric, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{metric.value.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          metric.value >= 85 ? 'bg-green-500' : 
                          metric.value >= 70 ? 'bg-blue-500' : 
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">100%</div>
                <p className="text-sm text-gray-600 mt-1">All tests passing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Test Suites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{testSuites.length}</div>
                <p className="text-sm text-gray-600 mt-1">All passing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Avg Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">324ms</div>
                <p className="text-sm text-gray-600 mt-1">Per test suite</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Test Suites Tab */}
        <TabsContent value="test-suites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Suite Results</CardTitle>
              <CardDescription>Individual test suite performance and coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testSuites.map((suite, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-[#D91C81] transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(suite.status)}
                          <h3 className="font-semibold text-gray-900">{suite.name}</h3>
                          <Badge variant="outline" className={getStatusColor(suite.status)}>
                            {suite.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Tests</p>
                            <p className="font-semibold text-gray-900">{suite.tests}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Passing</p>
                            <p className="font-semibold text-green-600">{suite.passing}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Duration</p>
                            <p className="font-semibold text-gray-900">{suite.duration}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Coverage</p>
                            <p className="font-semibold text-blue-600">{suite.coverage}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Benchmarks</CardTitle>
              <CardDescription>Critical path performance measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceBenchmarks.map((benchmark, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{benchmark.name}</h4>
                      <Badge variant="outline" className={getStatusColor(benchmark.status)}>
                        {benchmark.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Actual: </span>
                        <span className="font-semibold text-gray-900">{benchmark.actual}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Threshold: </span>
                        <span className="font-semibold text-gray-700">&lt;{benchmark.threshold}ms</span>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              benchmark.actual < benchmark.threshold * 0.5 ? 'bg-green-500' :
                              benchmark.actual < benchmark.threshold * 0.75 ? 'bg-blue-500' :
                              benchmark.actual < benchmark.threshold ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min((benchmark.actual / benchmark.threshold) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CI/CD Tab */}
        <TabsContent value="cicd" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>CI/CD Pipeline Status</CardTitle>
                  <CardDescription>Latest deployment pipeline execution</CardDescription>
                </div>
                <Badge variant="outline" className={getStatusColor(cicdPipeline.status)}>
                  {cicdPipeline.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Pipeline Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Branch</p>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">{cicdPipeline.branch}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Commit</p>
                    <span className="font-mono font-semibold text-gray-900">{cicdPipeline.commit}</span>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Deployed</p>
                    <span className="font-semibold text-gray-900">{formatTimeAgo(cicdPipeline.lastDeployment)}</span>
                  </div>
                </div>
              </div>

              {/* Pipeline Stages */}
              <div className="space-y-2">
                {cicdPipeline.stages.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    {getStatusIcon(stage.status)}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{stage.name}</p>
                      <p className="text-sm text-gray-600">{stage.duration}</p>
                    </div>
                    {idx < cicdPipeline.stages.length - 1 && (
                      <div className="text-gray-400">→</div>
                    )}
                  </div>
                ))}
              </div>

              {/* View Full Report */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View Full CI/CD Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Documentation Links */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube2 className="w-5 h-5 text-emerald-600" />
            Testing Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start gap-2 h-auto py-3 bg-white">
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">Testing Guide</div>
                <div className="text-sm text-gray-600">Comprehensive testing documentation</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Button>
            
            <Button variant="outline" className="justify-start gap-2 h-auto py-3 bg-white">
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">Coverage Reports</div>
                <div className="text-sm text-gray-600">Detailed coverage analysis</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Button>
            
            <Button variant="outline" className="justify-start gap-2 h-auto py-3 bg-white">
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">Performance Benchmarks</div>
                <div className="text-sm text-gray-600">Performance metrics and thresholds</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Button>
            
            <Button variant="outline" className="justify-start gap-2 h-auto py-3 bg-white">
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">CI/CD Pipeline</div>
                <div className="text-sm text-gray-600">Deployment automation docs</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastUpdated.toLocaleString()}
      </div>
    </div>
  );
}
