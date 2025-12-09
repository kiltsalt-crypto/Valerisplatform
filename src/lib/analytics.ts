import { supabase } from './supabase';

// Generate a session ID that persists for the browser session
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Get anonymized IP (last octet removed)
const getAnonymizedIP = (): string | null => {
  // Note: This would need a server-side implementation for real IP
  // For now, we'll just return null as we can't get real IP from client
  return null;
};

interface EventProperties {
  [key: string]: string | number | boolean | null;
}

export class Analytics {
  private static instance: Analytics;
  private sessionId: string;
  private userId: string | null = null;

  private constructor() {
    this.sessionId = getSessionId();
    this.initializeUser();
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  private async initializeUser() {
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;
  }

  private async ensureUser() {
    if (!this.userId) {
      await this.initializeUser();
    }
  }

  /**
   * Track a custom event
   */
  async track(eventName: string, properties: EventProperties = {}) {
    try {
      await this.ensureUser();

      // If no user is logged in, skip tracking
      if (!this.userId) {
        console.log('Analytics: No user logged in, skipping event:', eventName);
        return;
      }

      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: this.userId,
          event_name: eventName,
          event_properties: properties,
          session_id: this.sessionId,
          user_agent: navigator.userAgent,
          ip_address: getAnonymizedIP(),
        });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Track a page view
   */
  async pageView(pageName: string, properties: EventProperties = {}) {
    await this.track('page_view', {
      page: pageName,
      url: window.location.pathname,
      ...properties,
    });
  }

  /**
   * Track user signup
   */
  async signUp(method: string = 'email') {
    await this.track('user_signup', { method });
  }

  /**
   * Track user login
   */
  async login(method: string = 'email') {
    await this.track('user_login', { method });
  }

  /**
   * Track user logout
   */
  async logout() {
    await this.track('user_logout', {});
  }

  /**
   * Track feature usage
   */
  async featureUsed(featureName: string, properties: EventProperties = {}) {
    await this.track('feature_used', {
      feature: featureName,
      ...properties,
    });
  }

  /**
   * Track trade created
   */
  async tradeCreated(tradeType: 'journal' | 'paper', properties: EventProperties = {}) {
    await this.track('trade_created', {
      trade_type: tradeType,
      ...properties,
    });
  }

  /**
   * Track course started
   */
  async courseStarted(courseId: string, courseName: string) {
    await this.track('course_started', {
      course_id: courseId,
      course_name: courseName,
    });
  }

  /**
   * Track course completed
   */
  async courseCompleted(courseId: string, courseName: string) {
    await this.track('course_completed', {
      course_id: courseId,
      course_name: courseName,
    });
  }

  /**
   * Track subscription event
   */
  async subscriptionEvent(event: 'started' | 'upgraded' | 'downgraded' | 'cancelled', plan: string) {
    await this.track('subscription_event', {
      event,
      plan,
    });
  }

  /**
   * Track error
   */
  async error(errorMessage: string, errorStack?: string, properties: EventProperties = {}) {
    await this.track('error_occurred', {
      error_message: errorMessage,
      error_stack: errorStack,
      ...properties,
    });
  }

  /**
   * Track button click
   */
  async buttonClick(buttonName: string, location: string, properties: EventProperties = {}) {
    await this.track('button_click', {
      button: buttonName,
      location,
      ...properties,
    });
  }

  /**
   * Track search
   */
  async search(query: string, resultCount: number, location: string) {
    await this.track('search', {
      query,
      result_count: resultCount,
      location,
    });
  }

  /**
   * Identify user (call after login/signup)
   */
  async identify(userId: string) {
    this.userId = userId;
    await this.track('user_identified', { user_id: userId });
  }

  /**
   * Clear user (call on logout)
   */
  clearUser() {
    this.userId = null;
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance();

// Export helper function for components
export const trackEvent = (eventName: string, properties?: EventProperties) => {
  analytics.track(eventName, properties);
};
