interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  sessionId?: string;
  properties: Record<string, any>;
  timestamp: Date;
}

interface UserBehaviorMetrics {
  userId: string;
  sessionDuration: number;
  tasksViewed: number;
  tasksCompleted: number;
  paymentAttempts: number;
  searchQueries: string[];
  categoryPreferences: string[];
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private userSessions: Map<string, any> = new Map();

  // Track custom events
  async trackEvent(eventName: string, userId?: string, properties: Record<string, any> = {}): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        eventName,
        userId,
        sessionId: this.generateSessionId(userId),
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          userAgent: properties.userAgent || 'Unknown',
          url: properties.url || 'Unknown'
        },
        timestamp: new Date()
      };

      this.events.push(event);
      
      // Log important events
      if (this.isImportantEvent(eventName)) {
        console.log(`📊 Analytics: ${eventName}`, {
          userId,
          properties: event.properties
        });
      }

      // Keep only last 1000 events in memory
      if (this.events.length > 1000) {
        this.events = this.events.slice(-1000);
      }

    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Track task-specific events
  async trackTaskEvent(action: 'view' | 'apply' | 'complete' | 'abandon', taskId: string, userId?: string, additionalData: any = {}): Promise<void> {
    await this.trackEvent(`task_${action}`, userId, {
      taskId,
      ...additionalData
    });
  }

  // Track payment events
  async trackPaymentEvent(action: 'initiated' | 'completed' | 'failed', userId: string, amount: number, method: string): Promise<void> {
    await this.trackEvent(`payment_${action}`, userId, {
      amount,
      method,
      currency: 'USD'
    });
  }

  // Track user onboarding
  async trackOnboardingEvent(step: string, userId: string, completed: boolean = true): Promise<void> {
    await this.trackEvent('onboarding_step', userId, {
      step,
      completed,
      onboardingFlow: 'standard'
    });
  }

  // Track search behavior
  async trackSearch(query: string, userId?: string, results: number = 0): Promise<void> {
    await this.trackEvent('search_performed', userId, {
      query,
      resultsCount: results,
      searchType: 'task_search'
    });
  }

  // Get user behavior insights
  async getUserMetrics(userId: string, days: number = 30): Promise<UserBehaviorMetrics> {
    try {
      const userEvents = this.events.filter(event => 
        event.userId === userId && 
        this.isWithinDays(event.timestamp, days)
      );

      const metrics: UserBehaviorMetrics = {
        userId,
        sessionDuration: this.calculateSessionDuration(userEvents),
        tasksViewed: userEvents.filter(e => e.eventName === 'task_view').length,
        tasksCompleted: userEvents.filter(e => e.eventName === 'task_complete').length,
        paymentAttempts: userEvents.filter(e => e.eventName.startsWith('payment_')).length,
        searchQueries: userEvents
          .filter(e => e.eventName === 'search_performed')
          .map(e => e.properties.query)
          .filter(Boolean),
        categoryPreferences: this.extractCategoryPreferences(userEvents)
      };

      return metrics;
    } catch (error) {
      console.error('Error getting user metrics:', error);
      return {
        userId,
        sessionDuration: 0,
        tasksViewed: 0,
        tasksCompleted: 0,
        paymentAttempts: 0,
        searchQueries: [],
        categoryPreferences: []
      };
    }
  }

  // Get platform-wide analytics
  async getPlatformMetrics(days: number = 7): Promise<any> {
    try {
      const recentEvents = this.events.filter(event => 
        this.isWithinDays(event.timestamp, days)
      );

      const metrics = {
        totalEvents: recentEvents.length,
        uniqueUsers: new Set(recentEvents.map(e => e.userId).filter(Boolean)).size,
        taskViews: recentEvents.filter(e => e.eventName === 'task_view').length,
        taskCompletions: recentEvents.filter(e => e.eventName === 'task_complete').length,
        paymentAttempts: recentEvents.filter(e => e.eventName.startsWith('payment_')).length,
        searchQueries: recentEvents.filter(e => e.eventName === 'search_performed').length,
        conversionRate: this.calculateConversionRate(recentEvents),
        topCategories: this.getTopCategories(recentEvents),
        peakHours: this.getPeakHours(recentEvents)
      };

      return metrics;
    } catch (error) {
      console.error('Error getting platform metrics:', error);
      return {};
    }
  }

  // Helper methods
  private generateSessionId(userId?: string): string {
    const base = userId || 'anonymous';
    const timestamp = Date.now();
    return `${base}_${timestamp}`;
  }

  private isImportantEvent(eventName: string): boolean {
    const importantEvents = [
      'user_signup',
      'user_login',
      'task_complete',
      'payment_completed',
      'payment_failed',
      'subscription_upgrade'
    ];
    return importantEvents.includes(eventName);
  }

  private isWithinDays(timestamp: Date, days: number): boolean {
    const now = new Date();
    const eventDate = new Date(timestamp);
    const diffDays = (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  }

  private calculateSessionDuration(events: AnalyticsEvent[]): number {
    if (events.length < 2) return 0;
    
    const sortedEvents = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const firstEvent = sortedEvents[0];
    const lastEvent = sortedEvents[sortedEvents.length - 1];
    
    return (lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime()) / (1000 * 60); // Minutes
  }

  private extractCategoryPreferences(events: AnalyticsEvent[]): string[] {
    const categoryViews = events
      .filter(e => e.eventName === 'task_view' && e.properties.category)
      .reduce((acc, e) => {
        const category = e.properties.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryViews)
      .sort(([,a], [,b]) => b - a)
      .map(([category]) => category)
      .slice(0, 5);
  }

  private calculateConversionRate(events: AnalyticsEvent[]): number {
    const taskViews = events.filter(e => e.eventName === 'task_view').length;
    const taskCompletions = events.filter(e => e.eventName === 'task_complete').length;
    
    return taskViews > 0 ? (taskCompletions / taskViews) * 100 : 0;
  }

  private getTopCategories(events: AnalyticsEvent[]): Array<{category: string, count: number}> {
    const categoryCount = events
      .filter(e => e.eventName === 'task_view' && e.properties.category)
      .reduce((acc, e) => {
        const category = e.properties.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getPeakHours(events: AnalyticsEvent[]): Array<{hour: number, count: number}> {
    const hourCount = events.reduce((acc, e) => {
      const hour = e.timestamp.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(hourCount)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);
  }

  // Export data (for external analytics services)
  async exportEvents(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]> {
    return this.events.filter(event => 
      event.timestamp >= startDate && event.timestamp <= endDate
    );
  }
}

export const analytics = new AnalyticsService();