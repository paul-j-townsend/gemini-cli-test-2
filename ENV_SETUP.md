# Environment Setup Guide

This project supports three separate environments: **development**, **staging**, and **production**.

## Environment Files

Each environment has its own configuration file:

- `.env.development` - Local development with local Supabase
- `.env.staging` - Staging environment with staging Supabase instance
- `.env.production` - Production environment with live Supabase instance

## Quick Start

### Development (Default)
```bash
# Uses .env.development automatically when running dev
npm run dev
```

### Staging
```bash
# Build and run with staging environment
npm run build:staging
npm run start:staging

# Or develop with staging environment
npm run dev:staging
```

### Production
```bash
# Build and run with production environment
npm run build:production
npm run start:production

# Or develop with production environment (for testing)
npm run dev:production
```

## Available Scripts

### Development
- `npm run dev` - Start development server (uses .env.development)
- `npm run dev:staging` - Start development server with staging env
- `npm run dev:production` - Start development server with production env

### Build
- `npm run build` - Build for production (uses current .env.local)
- `npm run build:development` - Build with development environment
- `npm run build:staging` - Build with staging environment
- `npm run build:production` - Build with production environment

### Start
- `npm run start` - Start production server (uses current .env.local)
- `npm run start:staging` - Start with staging environment
- `npm run start:production` - Start with production environment

## Environment Configuration

### Required Environment Variables

1. **Supabase Configuration**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **OAuth Providers**
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   ```

3. **Stripe Payment Processing**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Application Settings**
   ```
   NODE_ENV=development|production
   NEXT_PUBLIC_APP_ENV=development|staging|production
   DEBUG=true|false
   NEXT_PUBLIC_API_URL=your_api_url
   ```

### Environment-Specific Configurations

#### Development
- Uses local Supabase instance (http://127.0.0.1:54321)
- Test Stripe keys
- Debug mode enabled
- Storage keys prefixed with environment

#### Staging
- Uses staging Supabase instance
- Test Stripe keys (still testing)
- Debug mode disabled
- Separate storage keys to avoid conflicts

#### Production
- Uses production Supabase instance
- Live Stripe keys
- Debug mode disabled
- Production-specific optimizations

## Deployment

### Vercel Deployment

1. **Staging Deployment**
   - Connect your staging branch to Vercel
   - Set environment variables from `.env.staging`
   - Use `npm run build:staging` as build command

2. **Production Deployment**
   - Connect your main branch to Vercel
   - Set environment variables from `.env.production`
   - Use `npm run build:production` as build command

### Manual Deployment

1. Set up your environment variables on your hosting platform
2. Use the appropriate build command for your environment
3. Deploy the built application

## Security Notes

- Environment files contain sensitive information and are gitignored
- Use `.env.example` as a template for creating your environment files
- Never commit actual API keys or secrets to version control
- Use different API keys for each environment
- Consider using a secrets management service for production

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check that all required variables are set in your environment file
   - Verify the environment file is being loaded correctly

2. **Wrong Environment**
   - Check `NEXT_PUBLIC_APP_ENV` variable
   - Verify you're using the correct npm script

3. **Database Connection Issues**
   - Verify Supabase URL and keys are correct
   - Check if your Supabase instance is running (for local development)

4. **Payment Issues**
   - Ensure you're using the correct Stripe keys for your environment
   - Verify webhook endpoints are configured correctly

### Checking Current Environment

Add this to any React component to check the current environment:

```jsx
import { getEnvironment, isProduction, isStaging, isDevelopment } from '@/lib/env';

console.log('Current environment:', getEnvironment());
console.log('Is production:', isProduction());
console.log('Is staging:', isStaging());
console.log('Is development:', isDevelopment());
```

## File Structure

```
├── .env.example          # Template for environment variables
├── .env.development      # Development environment (gitignored)
├── .env.staging          # Staging environment (gitignored)
├── .env.production       # Production environment (gitignored)
├── src/lib/env.ts        # Environment utilities
├── src/lib/supabase.ts   # Client-side Supabase client
├── src/lib/supabase-admin.ts # Server-side Supabase client
└── vercel.json           # Vercel deployment configuration
```