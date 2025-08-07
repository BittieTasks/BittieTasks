import { Request, Response, NextFunction } from 'express';
import { performanceMonitor } from '../services/performanceMonitor';

// Middleware to add performance monitoring headers
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  let cacheHit = false;
  
  // Track cache hits by checking response headers
  const originalSet = res.set;
  res.set = function(field: any, val?: string) {
    if (field === 'X-Cache-Hit' || (typeof field === 'object' && field['X-Cache-Hit'])) {
      cacheHit = true;
    }
    return originalSet.call(this, field, val);
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