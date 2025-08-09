import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { AuthDiagnostics, type DiagnosticResult } from '@/lib/auth-diagnostics';
import { useToast } from '@/hooks/use-toast';

export default function AuthDebug() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [logs, setLogs] = useState<string[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Run initial diagnostics on component mount
    runDiagnostics();
  }, []);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    addLog('🔍 Running comprehensive authentication diagnostics...');
    
    try {
      const diagnostics = new AuthDiagnostics();
      const results = await diagnostics.runFullDiagnostic();
      setDiagnosticResults(results);
      
      const failures = diagnostics.getFailedTests();
      if (failures.length === 0) {
        addLog('✅ All diagnostic tests passed');
      } else {
        addLog(`❌ ${failures.length} diagnostic test(s) failed`);
        failures.forEach(failure => {
          addLog(`   - ${failure.test}: ${failure.message}`);
        });
      }
    } catch (error: any) {
      addLog(`💥 Diagnostic error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    addLog('🔍 Testing Supabase connection...');
    
    try {
      // Test 1: Basic connection
      addLog('📡 Testing basic connection to Supabase...');
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        addLog(`❌ Session error: ${error.message}`);
      } else {
        addLog(`✅ Connection successful, session: ${data.session ? 'exists' : 'none'}`);
      }

      // Test 2: Try to get user
      addLog('👤 Testing user fetch...');
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        addLog(`❌ User fetch error: ${userError.message}`);
      } else {
        addLog(`✅ User fetch successful: ${user.user ? 'logged in' : 'not logged in'}`);
      }

    } catch (error: any) {
      addLog(`💥 Connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignUp = async () => {
    setLoading(true);
    addLog(`🔑 Testing sign up with: ${email}`);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        addLog(`❌ Sign up failed: ${error.message} (Status: ${error.status})`);
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        addLog(`✅ Sign up successful! User: ${data.user?.email}`);
        if (data.user && !data.user.email_confirmed_at) {
          addLog(`📧 Email confirmation required`);
        }
        toast({
          title: "Sign Up Successful",
          description: "Check your email for verification link",
        });
      }
    } catch (error: any) {
      addLog(`💥 Sign up exception: ${error.message}`);
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    addLog(`🔓 Testing sign in with: ${email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        addLog(`❌ Sign in failed: ${error.message} (Status: ${error.status})`);
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        addLog(`✅ Sign in successful! User: ${data.user?.email}`);
        addLog(`🎫 Session: ${data.session ? 'created' : 'none'}`);
        toast({
          title: "Sign In Successful",
          description: `Welcome ${data.user?.email}`,
        });
      }
    } catch (error: any) {
      addLog(`💥 Sign in exception: ${error.message}`);
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Supabase Authentication Debug</CardTitle>
            <CardDescription>Testing connection and authentication flow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button onClick={runDiagnostics} disabled={loading}>
                Run Diagnostics
              </Button>
              <Button onClick={testConnection} disabled={loading} variant="outline">
                Test Connection
              </Button>
              <Button onClick={testSignUp} disabled={loading} variant="outline">
                Test Sign Up
              </Button>
              <Button onClick={testSignIn} disabled={loading} variant="outline">
                Test Sign In
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Email</Label>
              <Input
                id="test-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-password">Password</Label>
              <Input
                id="test-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {diagnosticResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {diagnosticResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      result.status === 'pass' ? 'bg-green-50 border-green-200' :
                      result.status === 'fail' ? 'bg-red-50 border-red-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="font-medium">
                      {result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'} {result.test}
                    </div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                    {result.details && (
                      <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLogs([])}
            >
              Clear Logs
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Click "Test Connection" to start debugging.</div>
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