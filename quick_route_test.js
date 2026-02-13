/**
 * Quick Route Test - Tests all 55 migrated routes
 * Can be run in browser console or Node.js
 */

const API_BASE = 'https://wjfcqqrlhwdvvjmefxky.supabase.co/functions/v1/make-server-6fcaeea3';
const ENV_ID = 'development';
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Replace with actual token

// Test configuration
const TESTS = {
  clients: [
    { method: 'GET', path: '/clients', auth: true, desc: 'List all clients' },
    { method: 'GET', path: '/clients?page=1&pageSize=10', auth: true, desc: 'List clients paginated' },
    { method: 'GET', path: '/clients?status=active', auth: true, desc: 'Filter clients by status' },
  ],
  sites: [
    { method: 'GET', path: '/sites', auth: true, desc: 'List all sites' },
    { method: 'GET', path: '/sites?page=1&pageSize=10', auth: true, desc: 'List sites paginated' },
    { method: 'GET', path: '/public/sites', auth: false, desc: 'Get active sites (public)' },
  ],
  gifts: [
    { method: 'GET', path: '/admin/gifts', auth: true, desc: 'List all gifts' },
    { method: 'GET', path: '/admin/gifts?page=1&pageSize=10', auth: true, desc: 'List gifts paginated' },
    { method: 'GET', path: '/admin/gifts?category=test&status=active', auth: true, desc: 'Filter gifts' },
  ],
  orders: [
    { method: 'GET', path: '/orders', auth: true, desc: 'List all orders' },
    { method: 'GET', path: '/orders?page=1&pageSize=10', auth: true, desc: 'List orders paginated' },
  ],
  employees: [
    { method: 'GET', path: '/employees', auth: true, desc: 'List all employees' },
    { method: 'GET', path: '/employees?page=1&pageSize=10', auth: true, desc: 'List employees paginated' },
  ],
  adminUsers: [
    { method: 'GET', path: '/admin/users', auth: true, desc: 'List all admin users' },
    { method: 'GET', path: '/admin/users?page=1&pageSize=10', auth: true, desc: 'List admin users paginated' },
  ],
  roles: [
    { method: 'GET', path: '/roles', auth: true, desc: 'List all roles' },
    { method: 'GET', path: '/roles?page=1&pageSize=10', auth: true, desc: 'List roles paginated' },
  ],
  accessGroups: [
    { method: 'GET', path: '/access-groups', auth: true, desc: 'List all access groups' },
    { method: 'GET', path: '/access-groups?page=1&pageSize=10', auth: true, desc: 'List access groups paginated' },
  ],
  celebrations: [
    { method: 'GET', path: '/celebrations', auth: true, desc: 'List all celebrations' },
    { method: 'GET', path: '/celebrations?page=1&pageSize=10', auth: true, desc: 'List celebrations paginated' },
  ],
  emailTemplates: [
    { method: 'GET', path: '/email-templates', auth: true, desc: 'List all email templates' },
    { method: 'GET', path: '/email-templates?page=1&pageSize=10', auth: true, desc: 'List email templates paginated' },
  ],
};

// Test function
async function testRoute(test) {
  const headers = {
    'X-Environment-Id': ENV_ID,
    'Content-Type': 'application/json',
  };
  
  if (test.auth) {
    headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }
  
  try {
    const response = await fetch(`${API_BASE}${test.path}`, {
      method: test.method,
      headers,
    });
    
    const status = response.status;
    const data = await response.json();
    
    return {
      passed: status >= 200 && status < 400,
      status,
      desc: test.desc,
      path: test.path,
      method: test.method,
      data,
    };
  } catch (error) {
    return {
      passed: false,
      status: 'ERROR',
      desc: test.desc,
      path: test.path,
      method: test.method,
      error: error.message,
    };
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 JALA 2 - Complete API Route Testing');
  console.log('=======================================\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    byResource: {},
  };
  
  for (const [resource, tests] of Object.entries(TESTS)) {
    console.log(`\n📦 Testing ${resource.toUpperCase()} (${tests.length} routes)`);
    console.log('-------------------------------------------');
    
    const resourceResults = [];
    
    for (const test of tests) {
      results.total++;
      const result = await testRoute(test);
      resourceResults.push(result);
      
      if (result.passed) {
        results.passed++;
        console.log(`  ✅ ${result.method} ${result.path}`);
        console.log(`     ${result.desc} - HTTP ${result.status}`);
      } else {
        results.failed++;
        console.log(`  ❌ ${result.method} ${result.path}`);
        console.log(`     ${result.desc} - HTTP ${result.status}`);
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
      }
    }
    
    results.byResource[resource] = resourceResults;
  }
  
  // Summary
  console.log('\n\n=======================================');
  console.log('📊 TEST SUMMARY');
  console.log('=======================================');
  console.log(`Total Tests:  ${results.total}`);
  console.log(`Passed:       ${results.passed} ✅`);
  console.log(`Failed:       ${results.failed} ${results.failed > 0 ? '❌' : ''}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
  } else {
    console.log('\n⚠️  Some tests failed. Check logs above.');
  }
  
  return results;
}

// Export for Node.js or run in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testRoute, TESTS };
} else {
  // Auto-run in browser
  runAllTests().then(results => {
    console.log('\n✅ Testing complete!');
  });
}
