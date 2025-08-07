// Performance monitoring and optimization service
interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  cacheHit?: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private slowQueryThreshold = 200; // milliseconds
  private maxMetrics = 1000; // Keep last 1000 metrics

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Alert on slow requests
    if (metric.responseTime > this.slowQueryThreshold) {
      console.warn(`🐌 Slow request detected: ${metric.method} ${metric.endpoint} - ${metric.responseTime}ms`);
    }
  }

  getAverageResponseTime(endpoint?: string): number {
    const relevantMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;
    
    if (relevantMetrics.length === 0) return 0;
    
    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return Math.round(totalTime / relevantMetrics.length);
  }

  getSlowQueries(): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.responseTime > this.slowQueryThreshold)
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, 10); // Top 10 slowest
  }

  getCacheHitRate(): number {
    const cacheableRequests = this.metrics.filter(m => 
      m.endpoint.includes('/api/categories') || m.endpoint.includes('/api/tasks')
    );
    
    if (cacheableRequests.length === 0) return 0;
    
    const cacheHits = cacheableRequests.filter(m => m.cacheHit).length;
    return Math.round((cacheHits / cacheableRequests.length) * 100);
  }

  getPerformanceReport(): {
    averageResponseTime: number;
    slowQueries: PerformanceMetric[];
    cacheHitRate: number;
    endpointStats: Record<string, { count: number; avgTime: number }>;
  } {
    const endpointStats: Record<string, { count: number; avgTime: number }> = {};
    
    this.metrics.forEach(metric => {
      if (!endpointStats[metric.endpoint]) {
        endpointStats[metric.endpoint] = { count: 0, avgTime: 0 };
      }
      endpointStats[metric.endpoint].count++;
    });

    Object.keys(endpointStats).forEach(endpoint => {
      endpointStats[endpoint].avgTime = this.getAverageResponseTime(endpoint);
    });

    return {
      averageResponseTime: this.getAverageResponseTime(),
      slowQueries: this.getSlowQueries(),
      cacheHitRate: this.getCacheHitRate(),
      endpointStats
    };
  }

  reset() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();