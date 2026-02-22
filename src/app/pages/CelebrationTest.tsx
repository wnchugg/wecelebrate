import React, { useState } from 'react';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PlayCircle, 
  RotateCcw 
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface TestResult {
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  data?: any;
}

interface Stats {
  total: number;
  passed: number;
  failed: number;
  created: number;
}

export function CelebrationTest() {
  const [results, setResults] = useState<Record<string, TestResult>>({
    health: { status: 'pending', message: 'Not Run' },
    create: { status: 'pending', message: 'Not Run' },
    fetch: { status: 'pending', message: 'Not Run' },
    invite: { status: 'pending', message: 'Not Run' },
    like: { status: 'pending', message: 'Not Run' },
    single: { status: 'pending', message: 'Not Run' },
  });

  const [stats, setStats] = useState<Stats>({ total: 0, passed: 0, failed: 0, created: 0 });
  const [celebrationId, setCelebrationId] = useState<string>('');
  const [celebrations, setCelebrations] = useState<any[]>([]);
  const [runningAll, setRunningAll] = useState(false);

  // Form values
  const [employeeId, setEmployeeId] = useState('EMP001');
  const [employeeName, setEmployeeName] = useState('Sarah Johnson');
  const [milestone, setMilestone] = useState('anniversary-5');
  const [message, setMessage] = useState('Congratulations on 5 amazing years! Your dedication is truly appreciated.');
  const [fromName, setFromName] = useState('John Doe');
  const [inviteEmail, setInviteEmail] = useState('colleague@example.com');

  const API_BASE = `https://us-central1-jala-2.cloudfunctions.net/make-server-6fcaeea3`;

  const updateResult = (testId: string, status: 'running' | 'success' | 'error', message: string, data?: any) => {
    setResults(prev => ({
      ...prev,
      [testId]: { status, message, data }
    }));

    if (status === 'success' || status === 'error') {
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        passed: status === 'success' ? prev.passed + 1 : prev.passed,
        failed: status === 'error' ? prev.failed + 1 : prev.failed,
      }));
    }
  };

  const testHealthCheck = async () => {
    updateResult('health', 'running', 'Testing...');
    try {
      const response = await fetch(`${API_BASE}/health`, {
        headers: {
          'X-Environment-ID': projectId,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await response.json();
      
      if (response.ok && data.status === 'ok') {
        updateResult('health', 'success', '✓ Server is healthy', data);
      } else {
        updateResult('health', 'error', '✗ Health check failed', data);
      }
    } catch (error: any) {
      updateResult('health', 'error', `✗ Error: ${error.message}`);
    }
  };

  const testCreateCelebration = async () => {
    updateResult('create', 'running', 'Creating...');
    
    const milestoneNames: Record<string, string> = {
      'anniversary-5': '5 Year Anniversary',
      'anniversary-10': '10 Year Anniversary',
      'birthday': 'Birthday',
      'promotion': 'Promotion'
    };

    try {
      const response = await fetch(`${API_BASE}/public/celebrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Environment-ID': projectId,
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          recipientId: employeeId,
          recipientName: employeeName,
          milestoneId: milestone,
          milestoneName: milestoneNames[milestone],
          message,
          eCardId: 'confetti',
          eCardImage: 'linear-gradient(135deg, #FF6B9D 0%, #FFD93D 100%)',
          from: fromName,
          fromEmail: '',
          visibility: 'public'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCelebrationId(data.celebration.id);
        setStats(prev => ({ ...prev, created: prev.created + 1 }));
        updateResult('create', 'success', `✓ Created (ID: ${data.celebration.id.substring(0, 20)}...)`, data);
      } else {
        updateResult('create', 'error', `✗ Failed: ${data.error || 'Unknown error'}`, data);
      }
    } catch (error: any) {
      updateResult('create', 'error', `✗ Error: ${error.message}`);
    }
  };

  const testFetchCelebrations = async () => {
    updateResult('fetch', 'running', 'Fetching...');
    try {
      const response = await fetch(`${API_BASE}/public/celebrations/${employeeId}`, {
        headers: {
          'X-Environment-ID': projectId,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setCelebrations(data.celebrations || []);
        updateResult('fetch', 'success', `✓ Found ${data.count} celebration(s)`, data);
      } else {
        updateResult('fetch', 'error', `✗ Failed: ${data.error || 'Unknown error'}`, data);
      }
    } catch (error: any) {
      updateResult('fetch', 'error', `✗ Error: ${error.message}`);
    }
  };

  const testSendInvite = async () => {
    if (!celebrationId) {
      updateResult('invite', 'error', '✗ Create a celebration first');
      return;
    }

    updateResult('invite', 'running', 'Sending...');
    try {
      const response = await fetch(`${API_BASE}/public/celebrations/${celebrationId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Environment-ID': projectId,
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        updateResult('invite', 'success', `✓ Invite sent to ${inviteEmail}`, data);
      } else {
        updateResult('invite', 'error', `✗ Failed: ${data.error || 'Unknown error'}`, data);
      }
    } catch (error: any) {
      updateResult('invite', 'error', `✗ Error: ${error.message}`);
    }
  };

  const testLikeCelebration = async () => {
    if (!celebrationId) {
      updateResult('like', 'error', '✗ Create a celebration first');
      return;
    }

    updateResult('like', 'running', 'Liking...');
    try {
      const response = await fetch(`${API_BASE}/public/celebrations/${celebrationId}/like`, {
        method: 'POST',
        headers: {
          'X-Environment-ID': projectId,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        updateResult('like', 'success', '✓ Like added', data);
      } else {
        updateResult('like', 'error', `✗ Failed: ${data.error || 'Unknown error'}`, data);
      }
    } catch (error: any) {
      updateResult('like', 'error', `✗ Error: ${error.message}`);
    }
  };

  const testGetSingle = async () => {
    if (!celebrationId) {
      updateResult('single', 'error', '✗ Create a celebration first');
      return;
    }

    updateResult('single', 'running', 'Fetching...');
    try {
      const response = await fetch(`${API_BASE}/public/celebrations/view/${celebrationId}`, {
        headers: {
          'X-Environment-ID': projectId,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        updateResult('single', 'success', '✓ Celebration retrieved', data);
      } else {
        updateResult('single', 'error', `✗ Failed: ${data.error || 'Unknown error'}`, data);
      }
    } catch (error: any) {
      updateResult('single', 'error', `✗ Error: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setRunningAll(true);
    setStats({ total: 0, passed: 0, failed: 0, created: 0 });

    await testHealthCheck();
    await new Promise(r => setTimeout(r, 500));
    
    await testCreateCelebration();
    await new Promise(r => setTimeout(r, 500));
    
    await testFetchCelebrations();
    await new Promise(r => setTimeout(r, 500));
    
    await testSendInvite();
    await new Promise(r => setTimeout(r, 500));
    
    await testLikeCelebration();
    await new Promise(r => setTimeout(r, 500));
    
    await testGetSingle();
    
    setRunningAll(false);
  };

  const resetTests = () => {
    setResults({
      health: { status: 'pending', message: 'Not Run' },
      create: { status: 'pending', message: 'Not Run' },
      fetch: { status: 'pending', message: 'Not Run' },
      invite: { status: 'pending', message: 'Not Run' },
      like: { status: 'pending', message: 'Not Run' },
      single: { status: 'pending', message: 'Not Run' },
    });
    setStats({ total: 0, passed: 0, failed: 0, created: 0 });
    setCelebrations([]);
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'running') return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    if (status === 'success') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1B2A5E] mb-2">🎉 Celebration System API Test Suite</h1>
          <p className="text-gray-600">Testing backend integration for JALA 2 platform</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-[#D91C81]">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">Total Tests</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-500">{stats.passed}</div>
            <div className="text-sm text-gray-600 mt-1">Passed</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-red-500">{stats.failed}</div>
            <div className="text-sm text-gray-600 mt-1">Failed</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-[#00B4CC]">{stats.created}</div>
            <div className="text-sm text-gray-600 mt-1">Created</div>
          </div>
        </div>

        {/* Test 1: Health Check */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StatusIcon status={results.health.status} />
              <h2 className="text-xl font-bold text-gray-900">1. Health Check</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              results.health.status === 'success' ? 'bg-green-100 text-green-700' :
              results.health.status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {results.health.message}
            </span>
          </div>
          <p className="text-gray-600 mb-4">Verify the backend server is running and responding.</p>
          <button
            onClick={() => void testHealthCheck()}
            disabled={results.health.status === 'running'}
            className="px-6 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#C01872] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Run Test
          </button>
          {results.health.data && (
            <pre className="mt-4 p-4 bg-gray-50 rounded-lg text-xs overflow-x-auto border-l-4 border-[#00B4CC]">
              {JSON.stringify(results.health.data, null, 2)}
            </pre>
          )}
        </div>

        {/* Test 2: Create Celebration */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StatusIcon status={results.create.status} />
              <h2 className="text-xl font-bold text-gray-900">2. Create Celebration</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              results.create.status === 'success' ? 'bg-green-100 text-green-700' :
              results.create.status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {results.create.message}
            </span>
          </div>
          <p className="text-gray-600 mb-4">Test creating a new celebration message.</p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID:</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D91C81] focus:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name:</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D91C81] focus:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Milestone:</label>
              <select
                value={milestone}
                onChange={(e) => setMilestone(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D91C81] focus:ring-0"
              >
                <option value="anniversary-5">5 Year Anniversary</option>
                <option value="anniversary-10">10 Year Anniversary</option>
                <option value="birthday">Birthday</option>
                <option value="promotion">Promotion</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From:</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D91C81] focus:ring-0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message:</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D91C81] focus:ring-0"
              />
            </div>
          </div>

          <button
            onClick={() => void testCreateCelebration()}
            disabled={results.create.status === 'running'}
            className="px-6 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#C01872] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Create Celebration
          </button>
          {results.create.data && (
            <pre className="mt-4 p-4 bg-gray-50 rounded-lg text-xs overflow-x-auto border-l-4 border-[#00B4CC]">
              {JSON.stringify(results.create.data, null, 2)}
            </pre>
          )}
        </div>

        {/* Test 3: Fetch Celebrations */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StatusIcon status={results.fetch.status} />
              <h2 className="text-xl font-bold text-gray-900">3. Fetch Celebrations</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              results.fetch.status === 'success' ? 'bg-green-100 text-green-700' :
              results.fetch.status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {results.fetch.message}
            </span>
          </div>
          <p className="text-gray-600 mb-4">Retrieve all celebrations for an employee.</p>
          <button
            onClick={() => void testFetchCelebrations()}
            disabled={results.fetch.status === 'running'}
            className="px-6 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#C01872] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Fetch Celebrations
          </button>
          
          {celebrations.length > 0 && (
            <div className="mt-4 space-y-3">
              <h3 className="font-bold text-gray-900">Celebrations Found:</h3>
              {celebrations.map((cel) => (
                <div
                  key={cel.id}
                  className="p-4 rounded-lg text-white"
                  style={{ background: cel.eCardImage || 'linear-gradient(135deg, #FF6B9D 0%, #FFD93D 100%)' }}
                >
                  <h4 className="font-bold text-lg mb-2">🎉 {cel.milestoneName}</h4>
                  <p className="mb-1"><strong>From:</strong> {cel.from}</p>
                  <p className="mb-1 italic">"{cel.message}"</p>
                  <p className="text-sm opacity-90"><strong>Created:</strong> {new Date(cel.createdAt).toLocaleString()}</p>
                  <p className="text-sm opacity-90"><strong>Likes:</strong> {cel.likes || 0} | <strong>ID:</strong> {cel.id.substring(0, 30)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test 4: Send Invite */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StatusIcon status={results.invite.status} />
              <h2 className="text-xl font-bold text-gray-900">4. Send Invite</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              results.invite.status === 'success' ? 'bg-green-100 text-green-700' :
              results.invite.status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {results.invite.message}
            </span>
          </div>
          <p className="text-gray-600 mb-4">Test sending an email invitation for a celebration.</p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address:</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full max-w-md px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#D91C81] focus:ring-0"
            />
            {celebrationId && (
              <p className="text-xs text-gray-500 mt-1">Using celebration: {celebrationId.substring(0, 30)}...</p>
            )}
          </div>

          <button
            onClick={() => void testSendInvite()}
            disabled={results.invite.status === 'running' || !celebrationId}
            className="px-6 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#C01872] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send Invite
          </button>
          {results.invite.data && (
            <pre className="mt-4 p-4 bg-gray-50 rounded-lg text-xs overflow-x-auto border-l-4 border-[#00B4CC]">
              {JSON.stringify(results.invite.data, null, 2)}
            </pre>
          )}
        </div>

        {/* Test 5: Like Celebration */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StatusIcon status={results.like.status} />
              <h2 className="text-xl font-bold text-gray-900">5. Like Celebration</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              results.like.status === 'success' ? 'bg-green-100 text-green-700' :
              results.like.status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {results.like.message}
            </span>
          </div>
          <p className="text-gray-600 mb-4">Test incrementing the like counter on a celebration.</p>
          <button
            onClick={() => void testLikeCelebration()}
            disabled={results.like.status === 'running' || !celebrationId}
            className="px-6 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#C01872] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Like Celebration
          </button>
          {results.like.data && (
            <pre className="mt-4 p-4 bg-gray-50 rounded-lg text-xs overflow-x-auto border-l-4 border-[#00B4CC]">
              {JSON.stringify(results.like.data, null, 2)}
            </pre>
          )}
        </div>

        {/* Test 6: Get Single Celebration */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StatusIcon status={results.single.status} />
              <h2 className="text-xl font-bold text-gray-900">6. Get Single Celebration</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              results.single.status === 'success' ? 'bg-green-100 text-green-700' :
              results.single.status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {results.single.message}
            </span>
          </div>
          <p className="text-gray-600 mb-4">Fetch a specific celebration by ID.</p>
          <button
            onClick={() => void testGetSingle()}
            disabled={results.single.status === 'running' || !celebrationId}
            className="px-6 py-2 bg-[#D91C81] text-white rounded-lg font-semibold hover:bg-[#C01872] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Get Celebration
          </button>
          {results.single.data && (
            <pre className="mt-4 p-4 bg-gray-50 rounded-lg text-xs overflow-x-auto border-l-4 border-[#00B4CC]">
              {JSON.stringify(results.single.data, null, 2)}
            </pre>
          )}
        </div>

        {/* Control Panel */}
        <div className="bg-gradient-to-r from-[#D91C81] to-[#1B2A5E] rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Test Suite Controls</h2>
          <p className="mb-6 text-white/90">Execute all tests in sequence to verify the complete celebration system.</p>
          <div className="flex gap-4">
            <button
              onClick={() => void runAllTests()}
              disabled={runningAll}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#D91C81] rounded-lg font-semibold hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <PlayCircle className="w-5 h-5" />
              {runningAll ? 'Running Tests...' : 'Run Full Test Suite'}
            </button>
            <button
              onClick={resetTests}
              className="flex items-center gap-2 px-6 py-3 bg-[#00B4CC] text-white rounded-lg font-semibold hover:bg-[#0099B3] transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Reset All Tests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}