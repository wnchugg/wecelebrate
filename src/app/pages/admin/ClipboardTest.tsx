import { useState } from 'react';
import { CopyButton, CopyCodeBlock } from '../../components/CopyButton';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { copyToClipboard, selectTextInElement } from '../../utils/clipboard';

export default function ClipboardTest() {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    result: 'success' | 'error' | 'pending';
    method?: string;
    error?: string;
  }>>([]);

  const runClipboardTests = async () => {
    const results: typeof testResults = [];

    // Test 1: Simple text copy
    results.push({ test: 'Simple text copy', result: 'pending' });
    const test1 = await copyToClipboard('Hello, World!');
    results[0] = {
      test: 'Simple text copy',
      result: test1.success ? 'success' : 'error',
      method: test1.method,
      error: test1.error,
    };
    setTestResults([...results]);

    // Test 2: Long text copy
    await new Promise(resolve => setTimeout(resolve, 500));
    results.push({ test: 'Long text copy', result: 'pending' });
    const longText = 'Lorem ipsum dolor sit amet, '.repeat(50);
    const test2 = await copyToClipboard(longText);
    results[1] = {
      test: 'Long text copy',
      result: test2.success ? 'success' : 'error',
      method: test2.method,
      error: test2.error,
    };
    setTestResults([...results]);

    // Test 3: Special characters
    await new Promise(resolve => setTimeout(resolve, 500));
    results.push({ test: 'Special characters copy', result: 'pending' });
    const specialText = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/`~';
    const test3 = await copyToClipboard(specialText);
    results[2] = {
      test: 'Special characters copy',
      result: test3.success ? 'success' : 'error',
      method: test3.method,
      error: test3.error,
    };
    setTestResults([...results]);

    // Test 4: Multiline text
    await new Promise(resolve => setTimeout(resolve, 500));
    results.push({ test: 'Multiline text copy', result: 'pending' });
    const multilineText = 'Line 1\nLine 2\nLine 3\nLine 4';
    const test4 = await copyToClipboard(multilineText);
    results[3] = {
      test: 'Multiline text copy',
      result: test4.success ? 'success' : 'error',
      method: test4.method,
      error: test4.error,
    };
    setTestResults([...results]);

    // Test 5: Text selection
    await new Promise(resolve => setTimeout(resolve, 500));
    results.push({ test: 'Text selection utility', result: 'pending' });
    const test5 = selectTextInElement('test-selection-element');
    results[4] = {
      test: 'Text selection utility',
      result: test5 ? 'success' : 'error',
      method: 'select-text',
      error: test5 ? undefined : 'Selection failed',
    };
    setTestResults([...results]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Clipboard Functionality Test Page
          </h1>
          <p className="text-gray-600">
            Test all clipboard features and fallback mechanisms
          </p>
        </div>

        {/* Test Suite */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Automated Test Suite
          </h2>
          
          <button
            onClick={runClipboardTests}
            className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Run All Tests
          </button>

          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {result.result === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {result.result === 'error' && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  {result.result === 'pending' && (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  )}
                  <span className="font-medium text-gray-900">{result.test}</span>
                </div>
                <div className="text-xs text-gray-600">
                  {result.method && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">
                      {result.method}
                    </span>
                  )}
                  {result.error && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                      {result.error}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CopyButton Component Tests */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            CopyButton Component
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-32">Icon Only:</span>
              <CopyButton text="Hello, World!" />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-32">With Text:</span>
              <CopyButton text="npm install package" iconOnly={false} />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-32">Small Size:</span>
              <CopyButton text="Small button" size="sm" />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-32">Large Size:</span>
              <CopyButton text="Large button" size="lg" />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-32">Ghost:</span>
              <CopyButton text="Ghost variant" variant="ghost" />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-32">Outline:</span>
              <CopyButton text="Outline variant" variant="outline" />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 w-32">Solid:</span>
              <CopyButton text="Solid variant" variant="solid" />
            </div>
          </div>
        </div>

        {/* CopyCodeBlock Component Tests */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            CopyCodeBlock Component
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Basic Code Block (Bash)
              </h3>
              <CopyCodeBlock code="npm install -g supabase" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Multi-line with Line Numbers
              </h3>
              <CopyCodeBlock
                code={`#!/bin/bash\nnpm install -g supabase\nsupabase login\nsupabase functions deploy make-server-6fcaeea3`}
                showLineNumbers={true}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                JSON Example
              </h3>
              <CopyCodeBlock
                code={`{\n  "name": "JALA 2",\n  "version": "2.0.0",\n  "environment": "development"\n}`}
                language="json"
              />
            </div>
          </div>
        </div>

        {/* Manual Selection Test */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Text Selection Test
          </h2>
          
          <p className="text-sm text-gray-600 mb-4">
            Click the button below to test the text selection fallback mechanism.
          </p>

          <div className="space-y-4">
            <pre
              id="test-selection-element"
              className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono select-all cursor-text"
            >
              This text should be auto-selected when you click the button below.
            </pre>

            <button
              onClick={() => selectTextInElement('test-selection-element')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Select Text Above
            </button>
          </div>
        </div>

        {/* Real-world Example */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Real-world Example: API Key Display
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Production API Key
                </label>
                <input
                  type="text"
                  value="sk_live_abc123def456ghi789jkl012mno345"
                  readOnly
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm"
                />
              </div>
              <CopyButton
                text="sk_live_abc123def456ghi789jkl012mno345"
                variant="outline"
                successMessage="API Key Copied!"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Development API Key
                </label>
                <input
                  type="text"
                  value="sk_dev_xyz987wvu654tsr321qpo098lmn765"
                  readOnly
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded font-mono text-sm"
                />
              </div>
              <CopyButton
                text="sk_dev_xyz987wvu654tsr321qpo098lmn765"
                variant="outline"
                successMessage="API Key Copied!"
              />
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">Testing Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>In Figma Make, the Clipboard API is blocked by default</li>
                <li>The fallback mechanism uses execCommand which should work</li>
                <li>If all automatic methods fail, text will be auto-selected for manual copy</li>
                <li>Test results show which method was used (clipboard-api, exec-command, or manual)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}