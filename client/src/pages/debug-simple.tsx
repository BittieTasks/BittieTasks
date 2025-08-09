import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EnvironmentCheck {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  nodeEnv: string;
  timestamp: string;
}

export default function DebugSimple() {
  const [envData, setEnvData] = useState<EnvironmentCheck | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('Debug page loaded');
    checkEnvironment();
  }, []);

  const checkEnvironment = async () => {
    setLoading(true);
    addLog('Checking server environment...');
    
    try {
      const response = await fetch('/api/debug/env');
      if (response.ok) {
        const data = await response.json();
        setEnvData(data);
        addLog(`Environment check complete: ${JSON.stringify(data)}`);
      } else {
        addLog(`Environment check failed: ${response.status}`);
      }
    } catch (error: any) {
      addLog(`Environment check error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    setLoading(true);
    addLog('Testing Supabase connection...');
    
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    addLog(`URL exists: ${!!url}`);
    addLog(`Key exists: ${!!key}`);
    
    if (!url || !key) {
      addLog('Missing Supabase credentials in client');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': key,
        },
      });
      
      addLog(`Supabase connection: ${response.status} ${response.statusText}`);
    } catch (error: any) {
      addLog(`Supabase connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    addLog('Testing authentication...');
    
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        addLog(`Auth error: ${error.message}`);
      } else {
        addLog(`Auth session: ${data.session ? 'exists' : 'none'}`);
      }
    } catch (error: any) {
      addLog(`Auth test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Console</CardTitle>
            <CardDescription>Diagnosing the "failed to fetch code" error</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button onClick={checkEnvironment} disabled={loading}>
                Check Environment
              </Button>
              <Button onClick={testSupabaseConnection} disabled={loading} variant="outline">
                Test Connection
              </Button>
              <Button onClick={testAuth} disabled={loading} variant="outline">
                Test Auth
              </Button>
            </div>
          </CardContent>
        </Card>

        {envData && (
          <Card>
            <CardHeader>
              <CardTitle>Server Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Supabase URL:</strong> 
                  <span className={envData.VITE_SUPABASE_URL === 'SET' ? 'text-green-600' : 'text-red-600'}>
                    {envData.VITE_SUPABASE_URL}
                  </span>
                </div>
                <div>
                  <strong>Supabase Key:</strong>
                  <span className={envData.VITE_SUPABASE_ANON_KEY === 'SET' ? 'text-green-600' : 'text-red-600'}>
                    {envData.VITE_SUPABASE_ANON_KEY}
                  </span>
                </div>
                <div>
                  <strong>Node Environment:</strong> {envData.nodeEnv}
                </div>
                <div>
                  <strong>Timestamp:</strong> {new Date(envData.timestamp).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Client Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>URL:</strong> 
                <span className={import.meta.env.VITE_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                  {import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING'}
                </span>
              </div>
              <div>
                <strong>Key:</strong>
                <span className={import.meta.env.VITE_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}
                </span>
              </div>
              <div>
                <strong>URL Value:</strong> {import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...' || 'undefined'}
              </div>
              <div>
                <strong>Key Value:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...' || 'undefined'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLogs([])}
            >
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}