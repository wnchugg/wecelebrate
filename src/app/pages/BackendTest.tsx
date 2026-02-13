export function BackendTest() {
  const handleTest = async () => {
    const projectId = 'wjfcqqrlhwdvvjmefxky'; // Development project
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-6fcaeea3/health`;
    
    console.log('Testing backend health endpoint...');
    console.log('URL:', url);
    
    try {
      // Test 1: Without any headers
      console.log('\n=== Test 1: No headers ===');
      const response1 = await fetch(url);
      console.log('Status:', response1.status);
      console.log('Headers:', Object.fromEntries(response1.headers.entries()));
      const text1 = await response1.text();
      console.log('Response:', text1);
      
      // Test 2: With anon key (if available in window)
      console.log('\n=== Test 2: With anon key (from info) ===');
      const { publicAnonKey } = await import('/utils/supabase/info');
      const response2 = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      });
      console.log('Status:', response2.status);
      const text2 = await response2.text();
      console.log('Response:', text2);
      
      // Test 3: Check if backend is even reachable
      console.log('\n=== Test 3: OPTIONS request (CORS preflight) ===');
      const response3 = await fetch(url, { method: 'OPTIONS' });
      console.log('Status:', response3.status);
      console.log('CORS headers:', {
        'access-control-allow-origin': response3.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response3.headers.get('access-control-allow-methods'),
      });
      
    } catch (error: any) {
      console.error('Error testing backend:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-[#1B2A5E] mb-4">Backend Test</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to test the backend health endpoint.
          Open your browser console (F12) to see the detailed results.
        </p>
        
        <button
          onClick={handleTest}
          className="px-6 py-3 bg-[#D91C81] text-white rounded-lg hover:bg-[#B71869] transition-colors font-semibold"
        >
          Run Backend Test
        </button>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-900">
            <strong>Instructions:</strong>
          </p>
          <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
            <li>Open your browser console (press F12)</li>
            <li>Click the "Run Backend Test" button above</li>
            <li>Check the console for detailed test results</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
