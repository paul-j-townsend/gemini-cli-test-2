import { FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🧪 Setting up VetSidekick E2E tests...')
  
  // Set up test environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock'
  
  // Additional setup tasks could include:
  // - Setting up test database
  // - Seeding test data
  // - Starting mock services
  
  console.log('✅ Test environment configured')
}

export default globalSetup