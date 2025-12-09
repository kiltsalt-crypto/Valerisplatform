/**
 * Configuration and Feature Flags
 * Handles graceful degradation when API keys are missing
 */

interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  supabase: {
    url: string;
    anonKey: string;
    available: boolean;
  };
  features: {
    hCaptcha: boolean;
    sentry: boolean;
    stripe: boolean;
    etrade: boolean;
    schwab: boolean;
    aiCoach: boolean;
    premiumData: boolean;
    analytics: boolean;
  };
  apiKeys: {
    hCaptcha?: string;
    sentryDsn?: string;
    stripePublishable?: string;
    etradeClientId?: string;
    schwabClientId?: string;
    googleAnalytics?: string;
  };
}

// Helper to check if an environment variable exists and is not empty
const hasEnvVar = (key: string): boolean => {
  const value = import.meta.env[key];
  return Boolean(value && value.trim() !== '' && !value.includes('your-') && !value.includes('xxx'));
};

// Build configuration
const config: AppConfig = {
  environment: (import.meta.env.VITE_ENVIRONMENT || 'development') as AppConfig['environment'],

  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    available: hasEnvVar('VITE_SUPABASE_URL') && hasEnvVar('VITE_SUPABASE_ANON_KEY'),
  },

  features: {
    // hCaptcha for bot protection
    hCaptcha: hasEnvVar('VITE_HCAPTCHA_SITE_KEY'),

    // Sentry for error monitoring
    sentry: hasEnvVar('VITE_SENTRY_DSN'),

    // Stripe for payments
    stripe: hasEnvVar('VITE_STRIPE_PUBLISHABLE_KEY'),

    // Broker integrations
    etrade: hasEnvVar('VITE_ETRADE_CLIENT_ID'),
    schwab: hasEnvVar('VITE_SCHWAB_CLIENT_ID'),

    // AI features (can work without external API in basic mode)
    aiCoach: true,

    // Premium market data (falls back to Yahoo Finance)
    premiumData: hasEnvVar('VITE_POLYGON_API_KEY') || hasEnvVar('VITE_ALPHA_VANTAGE_API_KEY'),

    // Analytics tracking
    analytics: hasEnvVar('VITE_GA_MEASUREMENT_ID'),
  },

  apiKeys: {
    hCaptcha: hasEnvVar('VITE_HCAPTCHA_SITE_KEY') ? import.meta.env.VITE_HCAPTCHA_SITE_KEY : undefined,
    sentryDsn: hasEnvVar('VITE_SENTRY_DSN') ? import.meta.env.VITE_SENTRY_DSN : undefined,
    stripePublishable: hasEnvVar('VITE_STRIPE_PUBLISHABLE_KEY') ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY : undefined,
    etradeClientId: hasEnvVar('VITE_ETRADE_CLIENT_ID') ? import.meta.env.VITE_ETRADE_CLIENT_ID : undefined,
    schwabClientId: hasEnvVar('VITE_SCHWAB_CLIENT_ID') ? import.meta.env.VITE_SCHWAB_CLIENT_ID : undefined,
    googleAnalytics: hasEnvVar('VITE_GA_MEASUREMENT_ID') ? import.meta.env.VITE_GA_MEASUREMENT_ID : undefined,
  },
};

// Feature checks
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return config.features[feature];
};

export const getApiKey = (key: keyof AppConfig['apiKeys']): string | undefined => {
  return config.apiKeys[key];
};

export const isProduction = (): boolean => {
  return config.environment === 'production';
};

export const isDevelopment = (): boolean => {
  return config.environment === 'development';
};

// Get list of missing features for admin warning
export const getMissingFeatures = (): string[] => {
  const missing: string[] = [];

  if (!config.features.hCaptcha) missing.push('hCaptcha (Security)');
  if (!config.features.sentry) missing.push('Sentry (Error Monitoring)');
  if (!config.features.stripe) missing.push('Stripe (Payments)');
  if (!config.features.etrade) missing.push('E*TRADE Integration');
  if (!config.features.schwab) missing.push('Schwab Integration');

  return missing;
};

// User-friendly feature status messages
export const getFeatureStatusMessage = (feature: keyof AppConfig['features']): string => {
  const messages = {
    hCaptcha: config.features.hCaptcha
      ? 'Bot protection is active'
      : 'Bot protection is disabled - signup/login not protected',

    sentry: config.features.sentry
      ? 'Error monitoring is active'
      : 'Error monitoring is disabled - errors won\'t be tracked',

    stripe: config.features.stripe
      ? 'Payment processing is available'
      : 'Payment processing is disabled - free tier only',

    etrade: config.features.etrade
      ? 'E*TRADE integration is available'
      : 'E*TRADE integration is not configured',

    schwab: config.features.schwab
      ? 'Schwab integration is available'
      : 'Schwab integration is not configured',

    aiCoach: 'AI Coach is available (basic mode)',

    premiumData: config.features.premiumData
      ? 'Premium market data is enabled'
      : 'Using free market data (Yahoo Finance)',

    analytics: config.features.analytics
      ? 'Analytics tracking is active'
      : 'Analytics tracking is disabled',
  };

  return messages[feature];
};

// Log configuration on app start (development only)
if (isDevelopment()) {
  console.log('🔧 App Configuration:', {
    environment: config.environment,
    supabaseAvailable: config.supabase.available,
    enabledFeatures: Object.entries(config.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature),
    missingFeatures: getMissingFeatures(),
  });
}

export default config;
