import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { SecurityChecklist } from '../../components/SecurityChecklist';
import { 
  sanitizeInput, 
  validateEmail, 
  validatePasswordStrength,
  detectXss,
  sanitizeUrl,
} from '../../utils/security';
import { logger } from '../../utils/logger';
 
export function SecurityTest() {
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  const testInputSanitization = () => {
    const maliciousInputs = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<iframe src="evil.com"></iframe>',
      'onclick=alert("XSS")',
    ];

    const results = maliciousInputs.map(input => {
      const sanitized = sanitizeInput(input);
      const isXss = detectXss(input);
      return {
        input,
        sanitized,
        blocked: isXss || sanitized !== input,
      };
    });

    const allBlocked = results.every(r => r.blocked);
    
    setTestResult({
      type: allBlocked ? 'success' : 'error',
      message: allBlocked
        ? '✅ All XSS attempts were successfully blocked'
        : '❌ Some XSS attempts may have passed through',
    });

    return results;
  };

  const testEmailValidation = () => {
    const testCases = [
      { email: 'valid@example.com', expected: true },
      { email: 'invalid@', expected: false },
      { email: 'invalid', expected: false },
      { email: 'test@domain', expected: false },
      { email: '<script>@evil.com', expected: false },
    ];

    const results = testCases.map(test => ({
      ...test,
      result: validateEmail(test.email),
      passed: validateEmail(test.email) === test.expected,
    }));

    const allPassed = results.every(r => r.passed);

    setTestResult({
      type: allPassed ? 'success' : 'error',
      message: allPassed
        ? '✅ Email validation is working correctly'
        : '❌ Email validation has issues',
    });

    return results;
  };

  const testPasswordValidation = () => {
    const testCases = [
      { password: 'Weak1!', expected: false },
      { password: 'StrongPassword123!', expected: true },
      { password: 'noupppercase123!', expected: false },
      { password: 'NOLOWERCASE123!', expected: false },
      { password: 'NoNumbers!', expected: false },
      { password: 'NoSpecialChars123', expected: false },
    ];

    const results = testCases.map(test => {
      const validation = validatePasswordStrength(test.password);
      return {
        ...test,
        result: validation.isValid,
        errors: validation.errors,
        passed: validation.isValid === test.expected,
      };
    });

    const allPassed = results.every(r => r.passed);

    setTestResult({
      type: allPassed ? 'success' : 'error',
      message: allPassed
        ? '✅ Password validation is working correctly'
        : '❌ Password validation has issues',
    });

    return results;
  };

  const testUrlSanitization = () => {
    const testCases = [
      { url: 'https://example.com', shouldPass: true },
      { url: 'http://example.com', shouldPass: true },
      { url: 'javascript:alert("XSS")', shouldPass: false },
      { url: 'data:text/html,<script>alert("XSS")</script>', shouldPass: false },
      { url: 'file:///etc/passwd', shouldPass: false },
    ];

    const results = testCases.map(test => {
      try {
        const sanitized = sanitizeUrl(test.url);
        const passed = test.shouldPass ? sanitized === test.url : sanitized === '';
        return {
          ...test,
          sanitized,
          passed,
        };
      } catch {
        return {
          ...test,
          sanitized: '',
          passed: !test.shouldPass,
        };
      }
    });

    const allPassed = results.every(r => r.passed);

    setTestResult({
      type: allPassed ? 'success' : 'warning',
      message: allPassed
        ? '✅ URL sanitization is working correctly'
        : '⚠️ URL sanitization may need improvement',
    });

    return results;
  };

  const runAllTests = () => {
    logger.group('Security Test Results');
    logger.log('Input Sanitization:', testInputSanitization());
    logger.log('Email Validation:', testEmailValidation());
    logger.log('Password Validation:', testPasswordValidation());
    logger.log('URL Sanitization:', testUrlSanitization());
    logger.groupEnd();

    setTestResult({
      type: 'success',
      message: '✅ All security tests completed. Check console for detailed results.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#D91C81]" />
          Security Testing
        </h1>
        <p className="text-gray-600 mt-1">Test and verify security measures</p>
      </div>

      {/* Test Result Banner */}
      {testResult && (
        <div
          className={`p-4 rounded-lg border ${
            testResult.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : testResult.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {testResult.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            {testResult.type === 'error' && <AlertTriangle className="w-5 h-5" />}
            <span className="font-medium">{testResult.message}</span>
          </div>
        </div>
      )}

      {/* Quick Tests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Security Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => testInputSanitization()}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#D91C81] hover:bg-pink-50 transition-all text-left"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Input Sanitization</h3>
            <p className="text-sm text-gray-600">Test XSS protection and input cleaning</p>
          </button>
          
          <button
            onClick={() => testEmailValidation()}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#D91C81] hover:bg-pink-50 transition-all text-left"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Email Validation</h3>
            <p className="text-sm text-gray-600">Test email format validation</p>
          </button>
          
          <button
            onClick={() => testPasswordValidation()}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#D91C81] hover:bg-pink-50 transition-all text-left"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Password Strength</h3>
            <p className="text-sm text-gray-600">Test password validation rules</p>
          </button>
          
          <button
            onClick={() => testUrlSanitization()}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#D91C81] hover:bg-pink-50 transition-all text-left"
          >
            <h3 className="font-semibold text-gray-900 mb-1">URL Sanitization</h3>
            <p className="text-sm text-gray-600">Test URL validation and cleaning</p>
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={runAllTests}
            className="w-full px-6 py-3 bg-[#D91C81] text-white rounded-lg hover:bg-[#B71569] transition-colors font-medium"
          >
            Run All Tests
          </button>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Results will be logged to the browser console
          </p>
        </div>
      </div>

      {/* Manual Input Test */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Manual Input Test</h2>
        <p className="text-gray-600 mb-4">
          Try entering malicious input to test sanitization (e.g., {"<script>alert('XSS')</script>"})
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Input
            </label>
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter test input..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D91C81] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sanitized Output
            </label>
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm break-all">
              {testInput ? sanitizeInput(testInput) : <span className="text-gray-400">No input yet</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              XSS Detection
            </label>
            <div className={`p-4 rounded-lg border ${
              testInput && detectXss(testInput)
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              {testInput ? (
                detectXss(testInput) ? (
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    XSS Attack Detected!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    No XSS patterns detected
                  </span>
                )
              ) : (
                <span className="text-gray-500">Enter input to test</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Checklist */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Security Checklist</h2>
        <SecurityChecklist />
      </div>

      {/* Security Headers Test */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Security Headers</h2>
        <p className="text-gray-600 mb-4">
          Test security headers by opening your browser's Developer Tools → Network tab → Select any request → Headers
        </p>
        
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 font-mono text-sm space-y-1">
          <div className="text-gray-700">Check for these headers:</div>
          <div className="text-blue-600">✓ X-Content-Type-Options: nosniff</div>
          <div className="text-blue-600">✓ X-Frame-Options: DENY</div>
          <div className="text-blue-600">✓ X-XSS-Protection: 1; mode=block</div>
          <div className="text-blue-600">✓ Referrer-Policy: strict-origin-when-cross-origin</div>
          <div className="text-blue-600">✓ Content-Security-Policy: ...</div>
          <div className="text-blue-600">✓ Permissions-Policy: ...</div>
          {window.location.protocol === 'https:' && (
            <div className="text-blue-600">✓ Strict-Transport-Security: max-age=31536000</div>
          )}
        </div>
      </div>
    </div>
  );
}