import { Request, Response, NextFunction } from 'express';
import { performanceMonitor } from '../services/performanceMonitor';

// Middleware to add performance monitoring headers
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  let cacheHit = false;
  
  // Simple cache hit detection without modifying res.set
  const originalJson = res.json;
  res.json = function(body: any) {
    // Check if this looks like a cache hit based on response time
    const duration = Date.now() - start;
    if (duration < 10 && req.path.includes('/api/')) {
      cacheHit = true;
    }
    return originalJson.call(this, body);
  };
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Record performance metric
    performanceMonitor.recordMetric({
      endpoint: req.path,
      method: req.method,
      responseTime: duration,
      statusCode: res.statusCode,
      timestamp: new Date(),
      cacheHit
    });
    
    // Log slow requests for optimization
    if (duration > 200) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};

// Middleware to add cache headers for static content
export const staticCacheMiddleware = (maxAge: number = 3600) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
      res.set('ETag', `"${Date.now()}"`);
    }
    next();
  };
};