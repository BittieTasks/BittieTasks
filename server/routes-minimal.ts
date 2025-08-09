import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Debug endpoint
  app.get('/debug', (req, res) => {
    res.json({
      message: 'Server is running correctly',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      port: process.env.PORT || 5000
    });
  });

  // Static test page to bypass Vite issues
  app.get('/test', (req, res) => {
    res.sendFile('/home/runner/workspace/static-test.html');
  });

  // Temporary auth user endpoint
  app.get('/api/auth/user', (req, res) => {
    res.json({ 
      id: 'test-user', 
      email: 'test@example.com',
      message: 'Temporary user for debugging'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}