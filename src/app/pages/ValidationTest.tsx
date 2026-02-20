import { useState } from 'react';
import { CheckCircle, XCircle, Play, Loader2, FileText } from 'lucide-react';
import { ValidationTester, TestResult } from '../utils/testValidation';

export function ValidationTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showReport, setShowReport] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setShowReport(false);

    const tester = new ValidationTester();
    const testResults = await tester.runAllTests();
    
    setResults(testResults);
    setIsRunning(false);
  };

  const generateTextReport = () => {
    const tester = new ValidationTester();
    return tester.generateReport(results);
  };

  const downloadReport = () => {
    const report = generateTextReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B2A5E] via-[#D91C81] to-[#00B4CC] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            P1.4 - Validation Testing
          </h1>
          <p className="text-gray-600">
            Run automated tests to verify application functionality after production cleanup
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Test Suite</h2>
              <p className="text-sm text-gray-600">
                Validates environment config, backend connectivity, storage, and more
              </p>
            </div>
            <button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-3 bg-[#D91C81] text-white rounded-lg hover:bg-[#B71569] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run All Tests
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReport(!showReport)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  {showReport ? 'Hide' : 'Show'} Report
                </button>
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00B4CC] text-white rounded-lg hover:bg-[#008FA8] transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">Total Tests</div>
                <div className="text-2xl font-bold text-blue-900">{total}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium mb-1">Passed</div>
                <div className="text-2xl font-bold text-green-900">{passed}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600 font-medium mb-1">Failed</div>
                <div className="text-2xl font-bold text-red-900">{failed}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium mb-1">Success Rate</div>
                <div className="text-2xl font-bold text-purple-900">{successRate}%</div>
              </div>
            </div>

            {/* Test Details */}
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border-2 rounded-lg p-4 ${
                    result.passed
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.passed ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {result.testName}
                        </h3>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            result.passed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {result.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                            View Details
                          </summary>
                          <pre className="mt-2 p-3 bg-white border border-gray-200 rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Text Report */}
            {showReport && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Full Text Report</h3>
                <pre className="p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-x-auto text-xs">
                  {generateTextReport()}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Coverage</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D91C81] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                1
              </div>
              <div>
                <strong>Environment Configuration:</strong> Verifies that environment settings
                load correctly with valid Supabase URL and credentials
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D91C81] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                2
              </div>
              <div>
                <strong>Backend Connection:</strong> Tests health check endpoint to ensure
                Edge Function is deployed and responding
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D91C81] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                3
              </div>
              <div>
                <strong>Session Storage:</strong> Validates browser session storage functionality
                for user session persistence
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D91C81] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                4
              </div>
              <div>
                <strong>Local Storage:</strong> Validates browser local storage for settings
                and preferences
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D91C81] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                5
              </div>
              <div>
                <strong>No Console Logs:</strong> Ensures production cleanup removed debug
                console.log statements
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D91C81] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                6
              </div>
              <div>
                <strong>Routes Configuration:</strong> Verifies critical application routes
                are properly defined
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#D91C81] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                7
              </div>
              <div>
                <strong>API Base URL:</strong> Validates proper construction of API endpoint
                URLs from environment configuration
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-white text-[#D91C81] rounded-lg hover:bg-gray-50 transition-all shadow-md"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}