import { Request, Response } from 'express';

export function debugRoute(req: Request, res: Response) {
  const envVars = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
  };

  const urlPattern = /^https:\/\/[a-z0-9-]+\.supabase\.co$/;
  const keyPattern = /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;

  const validation = {
    urlFormat: urlPattern.test(process.env.VITE_SUPABASE_URL || ''),
    keyFormat: keyPattern.test(process.env.VITE_SUPABASE_ANON_KEY || ''),
  };

  res.json({
    timestamp: new Date().toISOString(),
    environment: envVars,
    validation,
    nodeEnv: process.env.NODE_ENV,
  });
}