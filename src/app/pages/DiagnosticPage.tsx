export function DiagnosticPage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#D91C81', marginBottom: '20px' }}>🔧 Diagnostic Page</h1>
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ marginTop: 0 }}>✅ React is Loading!</h2>
        <p>If you can see this page, React is working correctly.</p>
      </div>
      
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ marginTop: 0 }}>📍 Current URL</h2>
        <code style={{ background: '#fff', padding: '10px', display: 'block', borderRadius: '4px' }}>
          {window.location.href}
        </code>
      </div>
      
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ marginTop: 0 }}>🔍 Environment</h2>
        <ul style={{ margin: 0 }}>
          <li>Mode: {import.meta.env.MODE}</li>
          <li>Dev: {import.meta.env.DEV ? 'Yes' : 'No'}</li>
          <li>Prod: {import.meta.env.PROD ? 'Yes' : 'No'}</li>
        </ul>
      </div>
      
      <div style={{ background: '#f1f8e9', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>⚡ Next Steps</h2>
        <ol>
          <li>Open the browser console (F12)</li>
          <li>Look for console.log messages starting with [App], [Root], [Landing]</li>
          <li>Navigate to <a href="/" style={{ color: '#D91C81' }}>Landing Page (/)</a></li>
          <li>Navigate to <a href="/admin/login" style={{ color: '#D91C81' }}>Admin Login</a></li>
        </ol>
      </div>
      
      <div style={{ marginTop: '20px', padding: '20px', background: '#fce4ec', borderRadius: '8px' }}>
        <strong>Console Check:</strong> Open your browser console now. You should see logs from this component.
      </div>
    </div>
  );
}