// Environment configuration utilities
export const getEnvironment = () => {
  return process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development';
};

export const isProduction = () => getEnvironment() === 'production';
export const isStaging = () => getEnvironment() === 'staging';
export const isDevelopment = () => getEnvironment() === 'development';

export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase configuration. Check your environment variables.');
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
  };
};

export const getStripeConfig = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!publishableKey || !secretKey) {
    console.warn('Missing Stripe configuration. Payment features may not work.');
  }

  return {
    publishableKey,
    secretKey,
    webhookSecret,
  };
};

export const getOAuthConfig = () => {
  return {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
    },
  };
};

export const isDebugMode = () => {
  return process.env.DEBUG === 'true' || isDevelopment();
};

// Environment-specific storage keys to prevent cross-environment session conflicts
export const getStorageKey = (keyName: string) => {
  const env = getEnvironment();
  return `vsk-${env}-${keyName}`;
};