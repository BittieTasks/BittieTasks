import { supabase } from './supabase';

export interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
}

export class AuthDiagnostics {
  private results: DiagnosticResult[] = [];
  
  private addResult(test: string, status: 'pass' | 'fail' | 'warn', message: string, details?: any) {
    this.results.push({ test, status, message, details });
    console.log(`${status.toUpperCase()}: ${test} - ${message}`, details || '');
  }

  async runFullDiagnostic(): Promise<DiagnosticResult[]> {
    this.results = [];
    
    // 1. Environment Variables Check
    this.checkEnvironmentVariables();
    
    // 2. Supabase Client Initialization
    this.checkSupabaseClient();
    
    // 3. Network Connectivity
    await this.checkNetworkConnectivity();
    
    // 4. Auth State
    await this.checkAuthState();
    
    return this.results;
  }

  private checkEnvironmentVariables() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url) {
      this.addResult('env-url', 'fail', 'VITE_SUPABASE_URL is missing');
      return;
    }
    
    if (!key) {
      this.addResult('env-key', 'fail', 'VITE_SUPABASE_ANON_KEY is missing');
      return;
    }
    
    // URL format validation
    const urlPattern = /^https:\/\/[a-z0-9-]+\.supabase\.co$/;
    if (!urlPattern.test(url)) {
      this.addResult('env-url-format', 'fail', 'VITE_SUPABASE_URL format invalid', { url: url.substring(0, 20) + '...' });
    } else {
      this.addResult('env-url-format', 'pass', 'VITE_SUPABASE_URL format valid');
    }
    
    // Key format validation (JWT pattern)
    const keyPattern = /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    if (!keyPattern.test(key)) {
      this.addResult('env-key-format', 'fail', 'VITE_SUPABASE_ANON_KEY format invalid', { keyStart: key.substring(0, 10) + '...' });
    } else {
      this.addResult('env-key-format', 'pass', 'VITE_SUPABASE_ANON_KEY format valid');
    }
  }

  private checkSupabaseClient() {
    try {
      const client = supabase;
      if (client) {
        this.addResult('client-init', 'pass', 'Supabase client initialized successfully');
      } else {
        this.addResult('client-init', 'fail', 'Supabase client initialization failed');
      }
    } catch (error: any) {
      this.addResult('client-init', 'fail', 'Supabase client error', { error: error.message });
    }
  }

  private async checkNetworkConnectivity() {
    try {
      const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });
      
      if (response.ok) {
        this.addResult('network-connectivity', 'pass', 'Network connectivity to Supabase successful');
      } else {
        this.addResult('network-connectivity', 'fail', `Network request failed: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      this.addResult('network-connectivity', 'fail', 'Network connectivity failed', { 
        error: error.message,
        name: error.name 
      });
    }
  }

  private async checkAuthState() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        this.addResult('auth-session', 'fail', 'Auth session check failed', { error: error.message });
      } else {
        this.addResult('auth-session', 'pass', 'Auth session check successful', { 
          hasSession: !!data.session 
        });
      }
    } catch (error: any) {
      this.addResult('auth-session', 'fail', 'Auth session exception', { error: error.message });
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        this.addResult('auth-user', 'fail', 'Auth user check failed', { error: error.message });
      } else {
        this.addResult('auth-user', 'pass', 'Auth user check successful', { 
          hasUser: !!data.user 
        });
      }
    } catch (error: any) {
      this.addResult('auth-user', 'fail', 'Auth user exception', { error: error.message });
    }
  }

  getResults(): DiagnosticResult[] {
    return this.results;
  }

  getFailedTests(): DiagnosticResult[] {
    return this.results.filter(r => r.status === 'fail');
  }

  hasFailures(): boolean {
    return this.getFailedTests().length > 0;
  }
}