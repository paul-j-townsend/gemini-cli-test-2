# VetSidekick Test Scripts Analysis & Rewrite Recommendations
**Report Date:** August 8th, 2025  
**Project:** VetSidekick - Veterinary Education Platform

## Executive Summary

The current test suite for VetSidekick employs extensive mocking and stubbing, which while useful for isolated unit testing, does not provide confidence in real-world system integration. This report analyzes the existing test architecture and provides comprehensive recommendations for rewriting tests to use real data, services, and integrations.

## Current Test Architecture Analysis

### 1. Test Framework Stack
- **Unit Tests:** Jest with React Testing Library
- **E2E Tests:** Playwright with multiple browsers
- **Coverage:** Line coverage configured but limited by mocking
- **Test Data:** Entirely mock-based with hardcoded stubs

### 2. Current Mock Implementations

#### 2.1 Database Layer (Supabase)
**Location:** `jest.setup.js:34-59`
```javascript
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { /* mocked auth methods */ },
    from: jest.fn(() => ({ /* mocked query methods */ })),
    storage: { /* mocked storage methods */ }
  }))
}))
```

**Issues:**
- No real database operations tested
- Query logic and relationships untested
- Row Level Security (RLS) policies untested
- Database constraints and validation untested

#### 2.2 Payment Processing (Stripe)
**Location:** `jest.setup.js:62-76` and `__tests__/services/paymentService.test.ts`
```javascript
// Complete mock implementation replacing real Stripe SDK
class MockPaymentService {
  async createCheckoutSession() {
    return { id: 'cs_test_123', url: 'https://checkout.stripe.com/test' }
  }
}
```

**Issues:**
- No real payment flow validation
- Webhook signature verification untested
- Stripe pricing and product configuration untested
- Payment failure scenarios not properly tested

#### 2.3 Authentication System
**Location:** `__tests__/auth/authentication.test.ts`
```javascript
class MockAuthService {
  async signInWithGoogle() {
    return { user: mockUser, error: null }
  }
}
```

**Issues:**
- OAuth flow completely simulated
- Session persistence and security untested
- Role-based access control logic untested
- Real authentication edge cases missed

#### 2.4 API Endpoints
**Location:** `__tests__/api/payments/checkout.test.ts`
```javascript
const mockCheckoutHandler = {
  async post(req) {
    // Simulated API logic without real Next.js handler
  }
}
```

**Issues:**
- Next.js API handler logic untested
- Request/response validation untested
- Middleware and error handling untested
- Real HTTP request/response cycles missed

### 3. Component Testing Patterns

#### 3.1 Mock Components
**Location:** `__tests__/components/Header.test.tsx`
```javascript
const MockHeader = ({ user }) => (
  <header data-testid="header">
    {/* Simplified mock implementation */}
  </header>
)
```

**Issues:**
- Real component logic and interactions untested
- State management integration untested
- User context and prop drilling untested
- Styling and responsive behavior untested

#### 3.2 Test Utilities
**Location:** `__tests__/test-utils.tsx`
```javascript
export const mockUser = {
  id: 'test-user-id',
  // Hardcoded mock data
}
```

**Issues:**
- No real user data variations tested
- Edge cases with incomplete or malformed data missed
- Real database constraints not reflected

### 4. E2E Testing Limitations

#### 4.1 Simulated User Flows
**Location:** `__tests__/e2e/user-journey.spec.ts`
```javascript
async simulateGoogleOAuth() {
  // Mock OAuth callback instead of real OAuth flow
  await this.page.goto('/auth/callback?access_token=mock_token')
}
```

**Issues:**
- Real OAuth provider integration untested
- Actual payment processing flow not verified
- Real session management untested
- Browser security policies and redirects not tested

## Detailed Rewrite Recommendations

### Phase 1: Test Environment Infrastructure

#### 1.1 Real Database Setup
**Recommendation:** Create dedicated test database environment

```javascript
// New: __tests__/setup/database.ts
export class TestDatabase {
  private supabase: SupabaseClient
  
  constructor() {
    this.supabase = createClient(
      process.env.TEST_SUPABASE_URL!,
      process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  
  async seedTestData() {
    // Insert real test data into actual database
    await this.supabase.from('vsk_users').insert([
      { id: 'real-test-user-1', email: 'test1@vetsidekick.com', role: 'user' },
      { id: 'real-admin-user', email: 'admin@vetsidekick.com', role: 'admin' }
    ])
    
    await this.supabase.from('vsk_content').insert([
      { 
        id: 'test-content-1', 
        title: 'Real Test Content',
        price_cents: 2999,
        is_purchasable: true
      }
    ])
  }
  
  async cleanup() {
    // Clean up test data after tests
    await this.supabase.from('vsk_quiz_completions').delete().neq('id', '')
    await this.supabase.from('vsk_content_purchases').delete().neq('id', '')
    await this.supabase.from('vsk_users').delete().like('email', '%@vetsidekick.com')
  }
}
```

**Benefits:**
- Tests real database constraints and RLS policies
- Validates actual query performance
- Tests real data relationships and foreign key constraints
- Ensures database schema matches application expectations

#### 1.2 Real Payment Testing Environment
**Recommendation:** Use Stripe test mode with real webhook testing

```javascript
// New: __tests__/setup/stripe.ts
export class TestStripeService {
  private stripe: Stripe
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    })
  }
  
  async createTestProduct() {
    const product = await this.stripe.products.create({
      name: 'Test VetSidekick Content',
      metadata: { test: 'true' }
    })
    
    const price = await this.stripe.prices.create({
      unit_amount: 2999,
      currency: 'gbp',
      product: product.id
    })
    
    return { product, price }
  }
  
  async createTestCheckoutSession(priceId: string) {
    return await this.stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: 'http://localhost:3000/test-success',
      cancel_url: 'http://localhost:3000/test-cancel'
    })
  }
  
  async simulateWebhook(sessionId: string) {
    // Create real webhook event for testing
    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: { object: { id: sessionId } }
    })
    
    const signature = this.stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET!
    })
    
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    
    return { event, payload, signature }
  }
}
```

### Phase 2: Service Layer Integration Tests

#### 2.1 Real Payment Service Testing
**File:** `__tests__/services/paymentService.integration.test.ts`

```javascript
import { PaymentService } from '@/services/paymentService'
import { TestDatabase } from '../setup/database'
import { TestStripeService } from '../setup/stripe'

describe('PaymentService Integration Tests', () => {
  let paymentService: PaymentService
  let testDb: TestDatabase
  let testStripe: TestStripeService
  
  beforeAll(async () => {
    testDb = new TestDatabase()
    testStripe = new TestStripeService()
    paymentService = new PaymentService()
    
    await testDb.seedTestData()
  })
  
  afterAll(async () => {
    await testDb.cleanup()
  })
  
  describe('Real Stripe checkout creation', () => {
    it('creates actual checkout session with real Stripe API', async () => {
      const session = await paymentService.createCheckoutSession(
        'test-content-1',
        'real-test-user-1',
        'http://localhost:3000/success',
        'http://localhost:3000/cancel'
      )
      
      expect(session.id).toMatch(/^cs_test_/)
      expect(session.url).toContain('checkout.stripe.com')
      expect(session.payment_status).toBe('unpaid')
      
      // Verify real database record created
      const { data: purchase } = await testDb.supabase
        .from('vsk_content_purchases')
        .select('*')
        .eq('stripe_session_id', session.id)
        .single()
        
      expect(purchase).toBeDefined()
      expect(purchase.user_id).toBe('real-test-user-1')
      expect(purchase.content_id).toBe('test-content-1')
    })
    
    it('handles real Stripe API errors appropriately', async () => {
      // Test with invalid content ID - should fail at database level
      await expect(
        paymentService.createCheckoutSession(
          'non-existent-content',
          'real-test-user-1',
          'http://localhost:3000/success',
          'http://localhost:3000/cancel'
        )
      ).rejects.toThrow('Content not found')
    })
  })
  
  describe('Real webhook processing', () => {
    it('processes actual Stripe webhook events', async () => {
      // Create real checkout session
      const session = await paymentService.createCheckoutSession(
        'test-content-1',
        'real-test-user-1',
        'http://localhost:3000/success',
        'http://localhost:3000/cancel'
      )
      
      // Simulate webhook with real Stripe signature
      const webhookData = await testStripe.simulateWebhook(session.id)
      
      // Process webhook - should update real database
      const result = await paymentService.processWebhook(
        webhookData.payload,
        webhookData.signature
      )
      
      expect(result.success).toBe(true)
      
      // Verify real database was updated
      const { data: purchase } = await testDb.supabase
        .from('vsk_content_purchases')
        .select('*')
        .eq('stripe_session_id', session.id)
        .single()
        
      expect(purchase.status).toBe('completed')
      expect(purchase.completed_at).toBeDefined()
    })
  })
})
```

#### 2.2 Real Authentication Service Testing
**File:** `__tests__/auth/authentication.integration.test.ts`

```javascript
import { supabase } from '@/lib/supabase'
import { TestDatabase } from '../setup/database'

describe('Authentication Integration Tests', () => {
  let testDb: TestDatabase
  
  beforeAll(async () => {
    testDb = new TestDatabase()
    await testDb.seedTestData()
  })
  
  afterAll(async () => {
    await testDb.cleanup()
  })
  
  describe('Real user session management', () => {
    it('creates and manages real user sessions', async () => {
      // Test with real Supabase client
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test1@vetsidekick.com',
        password: 'test-password-123!'
      })
      
      expect(error).toBeNull()
      expect(data.user).toBeDefined()
      expect(data.session).toBeDefined()
      expect(data.user.email).toBe('test1@vetsidekick.com')
      
      // Verify session persistence
      const { data: session } = await supabase.auth.getSession()
      expect(session.session?.user.id).toBe(data.user.id)
      
      // Test sign out
      const { error: signOutError } = await supabase.auth.signOut()
      expect(signOutError).toBeNull()
      
      // Verify session cleared
      const { data: clearedSession } = await supabase.auth.getSession()
      expect(clearedSession.session).toBeNull()
    })
    
    it('validates real role-based access control', async () => {
      // Sign in as regular user
      await supabase.auth.signInWithPassword({
        email: 'test1@vetsidekick.com',
        password: 'test-password-123!'
      })
      
      // Test RLS policy - user should only see their own data
      const { data: userPurchases } = await supabase
        .from('vsk_content_purchases')
        .select('*')
      
      expect(userPurchases?.every(p => p.user_id === 'real-test-user-1')).toBe(true)
      
      // Sign out and sign in as admin
      await supabase.auth.signOut()
      await supabase.auth.signInWithPassword({
        email: 'admin@vetsidekick.com',
        password: 'admin-password-123!'
      })
      
      // Admin should see all purchases
      const { data: allPurchases } = await supabase
        .from('vsk_content_purchases')
        .select('*')
      
      expect(allPurchases?.length).toBeGreaterThan(0)
    })
  })
})
```

### Phase 3: API Integration Testing

#### 3.1 Real API Endpoint Testing
**File:** `__tests__/api/payments/checkout.integration.test.ts`

```javascript
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/payments/checkout'
import { TestDatabase } from '../../setup/database'

describe('/api/payments/checkout Integration Tests', () => {
  let testDb: TestDatabase
  
  beforeAll(async () => {
    testDb = new TestDatabase()
    await testDb.seedTestData()
  })
  
  afterAll(async () => {
    await testDb.cleanup()
  })
  
  describe('Real API request handling', () => {
    it('processes real checkout requests with actual Stripe integration', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          contentId: 'test-content-1',
          userId: 'real-test-user-1',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        }
      })
      
      await handler(req, res)
      
      expect(res._getStatusCode()).toBe(200)
      
      const responseData = JSON.parse(res._getData())
      expect(responseData.success).toBe(true)
      expect(responseData.sessionId).toMatch(/^cs_test_/)
      expect(responseData.url).toContain('checkout.stripe.com')
      
      // Verify real database record was created
      const { data: purchase } = await testDb.supabase
        .from('vsk_content_purchases')
        .select('*')
        .eq('stripe_session_id', responseData.sessionId)
        .single()
        
      expect(purchase).toBeDefined()
      expect(purchase.user_id).toBe('real-test-user-1')
      expect(purchase.content_id).toBe('test-content-1')
      expect(purchase.status).toBe('pending')
    })
    
    it('validates real database constraints and relationships', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          contentId: 'non-existent-content',
          userId: 'real-test-user-1',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        }
      })
      
      await handler(req, res)
      
      expect(res._getStatusCode()).toBe(500)
      
      const responseData = JSON.parse(res._getData())
      expect(responseData.success).toBe(false)
      expect(responseData.error).toContain('Content not found')
    })
  })
})
```

### Phase 4: Real Component Integration Testing

#### 4.1 Component Testing with Real Context
**File:** `__tests__/components/Header.integration.test.tsx`

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserContext } from '@/contexts/UserContext'
import { Header } from '@/components/Header' // Real component, not mock
import { TestDatabase } from '../setup/database'
import { supabase } from '@/lib/supabase'

describe('Header Component Integration Tests', () => {
  let testDb: TestDatabase
  
  beforeAll(async () => {
    testDb = new TestDatabase()
    await testDb.seedTestData()
  })
  
  afterAll(async () => {
    await testDb.cleanup()
  })
  
  const renderWithRealContext = (user = null) => {
    const contextValue = {
      user,
      loading: false,
      isAuthenticated: !!user,
      login: async () => {
        const { data } = await supabase.auth.signInWithPassword({
          email: 'test1@vetsidekick.com',
          password: 'test-password-123!'
        })
        return data
      },
      logout: async () => {
        await supabase.auth.signOut()
      },
      refreshUser: jest.fn(),
      refreshPaymentStatus: jest.fn(),
      hasAccess: jest.fn(),
      hasRole: jest.fn()
    }
    
    return render(
      <UserContext.Provider value={contextValue}>
        <Header />
      </UserContext.Provider>
    )
  }
  
  it('displays real user data from database', async () => {
    // Sign in real user
    const { data } = await supabase.auth.signInWithPassword({
      email: 'test1@vetsidekick.com',
      password: 'test-password-123!'
    })
    
    // Get real user profile from database
    const { data: userProfile } = await supabase
      .from('vsk_users')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    renderWithRealContext(userProfile)
    
    expect(screen.getByText(userProfile.name)).toBeInTheDocument()
    expect(screen.getByText(userProfile.email)).toBeInTheDocument()
    
    // Test real role-based visibility
    if (userProfile.role === 'admin') {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    } else {
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
    }
  })
  
  it('handles real authentication state changes', async () => {
    renderWithRealContext()
    
    // Click login button
    fireEvent.click(screen.getByText('Login'))
    
    // Should trigger real authentication flow
    await waitFor(() => {
      expect(screen.getByText('My Stuff')).toBeInTheDocument()
    })
    
    // Click logout
    fireEvent.click(screen.getByText('Logout'))
    
    await waitFor(() => {
      expect(screen.queryByText('My Stuff')).not.toBeInTheDocument()
      expect(screen.getByText('Login')).toBeInTheDocument()
    })
  })
})
```

### Phase 5: E2E Testing with Real Integrations

#### 5.1 Complete User Journey Testing
**File:** `__tests__/e2e/user-journey.real.spec.ts`

```javascript
import { test, expect } from '@playwright/test'
import { TestDatabase } from '../setup/database'
import { TestStripeService } from '../setup/stripe'

test.describe('Real User Journey Tests', () => {
  let testDb: TestDatabase
  let testStripe: TestStripeService
  
  test.beforeAll(async () => {
    testDb = new TestDatabase()
    testStripe = new TestStripeService()
    await testDb.seedTestData()
  })
  
  test.afterAll(async () => {
    await testDb.cleanup()
  })
  
  test('Complete real purchase flow with actual payment', async ({ page }) => {
    // Navigate to application
    await page.goto('http://localhost:3000')
    
    // Real authentication flow
    await page.click('text=Login')
    
    // Fill in real test credentials
    await page.fill('[data-testid="email"]', 'test1@vetsidekick.com')
    await page.fill('[data-testid="password"]', 'test-password-123!')
    await page.click('[data-testid="login-button"]')
    
    // Wait for real authentication to complete
    await page.waitForSelector('[data-testid="user-menu"]')
    
    // Browse to content
    await page.click('text=Podcasts')
    await page.click('text=Real Test Content')
    
    // Should show paywall since user hasn't purchased
    await expect(page.locator('[data-testid="paywall"]')).toBeVisible()
    
    // Click purchase
    await page.click('[data-testid="purchase-button"]')
    
    // Should redirect to real Stripe Checkout
    await page.waitForURL('**/checkout.stripe.com/**')
    
    // Fill in Stripe test card details
    await page.fill('[data-testid="cardNumber"]', '4242424242424242')
    await page.fill('[data-testid="cardExpiry"]', '12/25')
    await page.fill('[data-testid="cardCvc"]', '123')
    await page.fill('[data-testid="billingName"]', 'Test User')
    
    // Complete payment
    await page.click('[data-testid="submit"]')
    
    // Should redirect back to success page
    await page.waitForURL('**/success**')
    await expect(page.locator('text=Purchase Successful')).toBeVisible()
    
    // Navigate back to content - should now have access
    await page.click('text=Podcasts')
    await page.click('text=Real Test Content')
    
    // Should not show paywall anymore
    await expect(page.locator('[data-testid="paywall"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="audio-player"]')).toBeVisible()
    
    // Verify real database state
    const { data: purchases } = await testDb.supabase
      .from('vsk_content_purchases')
      .select('*')
      .eq('user_id', 'real-test-user-1')
      .eq('content_id', 'test-content-1')
    
    expect(purchases).toHaveLength(1)
    expect(purchases[0].status).toBe('completed')
  })
  
  test('Real quiz completion flow with database persistence', async ({ page }) => {
    // Assuming user has already purchased content in previous test
    await page.goto('http://localhost:3000/podcasts/test-content-1')
    
    // Start quiz
    await page.click('[data-testid="start-quiz"]')
    
    // Answer real quiz questions loaded from database
    const questions = await testDb.supabase
      .from('vsk_quiz_questions')
      .select('*')
      .eq('quiz_id', 'test-quiz-1')
      .order('order_index')
    
    for (const question of questions.data) {
      await expect(page.locator(`text=${question.question}`)).toBeVisible()
      
      // Click first answer (assuming it's correct in test data)
      await page.click('[data-testid="quiz-answer-0"]')
      
      if (question !== questions.data[questions.data.length - 1]) {
        await page.click('[data-testid="next-question"]')
      }
    }
    
    // Submit quiz
    await page.click('[data-testid="submit-quiz"]')
    
    // Should show results
    await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible()
    
    // Verify real database record was created
    const { data: completion } = await testDb.supabase
      .from('vsk_quiz_completions')
      .select('*')
      .eq('user_id', 'real-test-user-1')
      .eq('quiz_id', 'test-quiz-1')
      .single()
    
    expect(completion).toBeDefined()
    expect(completion.score).toBeGreaterThan(0)
    expect(completion.completed_at).toBeDefined()
    
    // Verify user progress was updated
    const { data: progress } = await testDb.supabase
      .from('vsk_user_progress')
      .select('*')
      .eq('user_id', 'real-test-user-1')
      .single()
    
    expect(progress.quizzes_completed).toBeGreaterThan(0)
    expect(progress.total_cpd_hours).toBeGreaterThan(0)
  })
})
```

### Phase 6: Error Scenarios & Edge Case Testing

#### 6.1 Network Failure & Resilience Testing
**File:** `__tests__/resilience/network-failure.integration.test.ts`

```javascript
import { PaymentService } from '@/services/paymentService'
import { TestDatabase } from '../setup/database'

describe('Network Failure Resilience Tests', () => {
  let testDb: TestDatabase
  let paymentService: PaymentService
  
  beforeAll(async () => {
    testDb = new TestDatabase()
    await testDb.seedTestData()
    paymentService = new PaymentService()
  })
  
  afterAll(async () => {
    await testDb.cleanup()
  })
  
  describe('Connection drop scenarios', () => {
    it('handles network failure during payment processing', async () => {
      // Simulate network interruption
      const originalFetch = global.fetch
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')))
      
      await expect(
        paymentService.createCheckoutSession(
          'test-content-1',
          'real-test-user-1',
          'http://localhost:3000/success',
          'http://localhost:3000/cancel'
        )
      ).rejects.toThrow('Network error')
      
      // Restore network
      global.fetch = originalFetch
      
      // Verify system recovers gracefully
      const session = await paymentService.createCheckoutSession(
        'test-content-1',
        'real-test-user-1',
        'http://localhost:3000/success',
        'http://localhost:3000/cancel'
      )
      
      expect(session.id).toMatch(/^cs_test_/)
    })
    
    it('handles partial webhook delivery failures', async () => {
      // Create session
      const session = await paymentService.createCheckoutSession(
        'test-content-1',
        'real-test-user-1',
        'http://localhost:3000/success',
        'http://localhost:3000/cancel'
      )
      
      // Simulate database failure during webhook processing
      const originalQuery = testDb.supabase.from
      testDb.supabase.from = jest.fn(() => {
        throw new Error('Database connection failed')
      })
      
      // Webhook should fail but not crash
      const result = await paymentService.processWebhook(
        JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: session.id } } }),
        'valid_signature'
      ).catch(err => ({ success: false, error: err.message }))
      
      expect(result.success).toBe(false)
      
      // Restore database connection
      testDb.supabase.from = originalQuery
      
      // Retry should succeed
      const retryResult = await paymentService.processWebhook(
        JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: session.id } } }),
        'valid_signature'
      )
      
      expect(retryResult.success).toBe(true)
    })
  })
  
  describe('Race condition scenarios', () => {
    it('handles concurrent purchase attempts', async () => {
      // Simulate two users trying to purchase the same content simultaneously
      const promises = [
        paymentService.createCheckoutSession(
          'test-content-1',
          'real-test-user-1',
          'http://localhost:3000/success',
          'http://localhost:3000/cancel'
        ),
        paymentService.createCheckoutSession(
          'test-content-1',
          'real-test-user-2',
          'http://localhost:3000/success',
          'http://localhost:3000/cancel'
        )
      ]
      
      const results = await Promise.all(promises)
      
      // Both should succeed with different session IDs
      expect(results[0].id).not.toBe(results[1].id)
      expect(results[0].id).toMatch(/^cs_test_/)
      expect(results[1].id).toMatch(/^cs_test_/)
    })
    
    it('handles duplicate webhook processing', async () => {
      const session = await paymentService.createCheckoutSession(
        'test-content-1',
        'real-test-user-1',
        'http://localhost:3000/success',
        'http://localhost:3000/cancel'
      )
      
      const webhookPayload = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { id: session.id } }
      })
      
      // Process same webhook twice
      const result1 = await paymentService.processWebhook(webhookPayload, 'valid_signature')
      const result2 = await paymentService.processWebhook(webhookPayload, 'valid_signature')
      
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true) // Should handle idempotently
      
      // Verify only one purchase record exists
      const { data: purchases } = await testDb.supabase
        .from('vsk_content_purchases')
        .select('*')
        .eq('stripe_session_id', session.id)
      
      expect(purchases).toHaveLength(1)
    })
  })
  
  describe('Rate limiting scenarios', () => {
    it('handles Stripe API rate limits gracefully', async () => {
      // Create multiple rapid requests to potentially trigger rate limiting
      const rapidRequests = Array.from({ length: 10 }, (_, i) => 
        paymentService.createCheckoutSession(
          'test-content-1',
          `real-test-user-${i}`,
          'http://localhost:3000/success',
          'http://localhost:3000/cancel'
        )
      )
      
      // All should eventually succeed (with retry logic)
      const results = await Promise.allSettled(rapidRequests)
      const successCount = results.filter(r => r.status === 'fulfilled').length
      
      expect(successCount).toBeGreaterThan(5) // Allow for some rate limiting
    })
    
    it('handles database connection pool exhaustion', async () => {
      // Create many concurrent database operations
      const concurrentQueries = Array.from({ length: 50 }, () =>
        testDb.supabase.from('vsk_content').select('*').limit(1)
      )
      
      const results = await Promise.allSettled(concurrentQueries)
      const successCount = results.filter(r => r.status === 'fulfilled').length
      
      // Should handle gracefully, not crash
      expect(successCount).toBeGreaterThan(0)
    })
  })
  
  describe('Data corruption scenarios', () => {
    it('handles incomplete payment webhook data', async () => {
      const incompleteWebhookPayload = JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { id: null } } // Missing session ID
      })
      
      const result = await paymentService.processWebhook(
        incompleteWebhookPayload, 
        'valid_signature'
      ).catch(err => ({ success: false, error: err.message }))
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid session')
    })
    
    it('handles malformed user data', async () => {
      // Insert user with missing required fields
      const { error } = await testDb.supabase.from('vsk_users').insert({
        id: 'malformed-user',
        email: null, // Should be required
        role: 'user'
      })
      
      expect(error).toBeDefined() // Should be rejected by database constraints
    })
  })
})
```

#### 6.2 Real Email Integration Testing
**File:** `__tests__/integrations/email.integration.test.ts`

```javascript
import { EmailService } from '@/services/emailService'
import { TestDatabase } from '../setup/database'

describe('Email Integration Tests', () => {
  let emailService: EmailService
  let testDb: TestDatabase
  
  beforeAll(async () => {
    emailService = new EmailService()
    testDb = new TestDatabase()
    await testDb.seedTestData()
  })
  
  afterAll(async () => {
    await testDb.cleanup()
  })
  
  describe('Real email sending', () => {
    it('sends actual welcome emails via SendGrid/Postmark', async () => {
      const testEmail = 'test-welcome@vetsidekick.com'
      
      const result = await emailService.sendWelcomeEmail({
        to: testEmail,
        name: 'Test User',
        verificationLink: 'http://localhost:3000/verify?token=test123'
      })
      
      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
      
      // Verify email was logged in database
      const { data: emailLog } = await testDb.supabase
        .from('vsk_email_logs')
        .select('*')
        .eq('recipient', testEmail)
        .eq('template', 'welcome')
        .single()
      
      expect(emailLog).toBeDefined()
      expect(emailLog.status).toBe('sent')
    })
    
    it('handles email bounce and failure scenarios', async () => {
      const invalidEmail = 'bounce@simulator.amazonses.com' // AWS SES bounce simulator
      
      const result = await emailService.sendWelcomeEmail({
        to: invalidEmail,
        name: 'Test User',
        verificationLink: 'http://localhost:3000/verify?token=test123'
      })
      
      // Should handle gracefully
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      
      // Verify failure was logged
      const { data: emailLog } = await testDb.supabase
        .from('vsk_email_logs')
        .select('*')
        .eq('recipient', invalidEmail)
        .single()
      
      expect(emailLog.status).toBe('failed')
    })
    
    it('validates email template rendering with real data', async () => {
      // Get real user data
      const { data: user } = await testDb.supabase
        .from('vsk_users')
        .select('*')
        .eq('id', 'real-test-user-1')
        .single()
      
      const result = await emailService.sendPurchaseConfirmation({
        to: user.email,
        name: user.name,
        contentTitle: 'Real Test Content',
        purchaseAmount: '£29.99',
        accessLink: 'http://localhost:3000/content/test-content-1'
      })
      
      expect(result.success).toBe(true)
      
      // Verify personalization was applied correctly
      const { data: emailLog } = await testDb.supabase
        .from('vsk_email_logs')
        .select('*')
        .eq('recipient', user.email)
        .eq('template', 'purchase_confirmation')
        .single()
      
      expect(emailLog.template_data).toContain(user.name)
      expect(emailLog.template_data).toContain('Real Test Content')
    })
  })
  
  describe('Email webhook processing', () => {
    it('processes real email delivery webhooks', async () => {
      // Simulate webhook from email provider
      const webhookPayload = {
        event: 'delivered',
        email: 'test@vetsidekick.com',
        messageId: 'test-message-123',
        timestamp: new Date().toISOString()
      }
      
      const result = await emailService.processWebhook(webhookPayload)
      
      expect(result.success).toBe(true)
      
      // Verify status was updated in database
      const { data: emailLog } = await testDb.supabase
        .from('vsk_email_logs')
        .select('*')
        .eq('message_id', 'test-message-123')
        .single()
      
      expect(emailLog.status).toBe('delivered')
      expect(emailLog.delivered_at).toBeDefined()
    })
    
    it('handles email complaint webhooks', async () => {
      const complaintWebhook = {
        event: 'complaint',
        email: 'complainer@vetsidekick.com',
        messageId: 'test-message-456',
        complaintType: 'abuse'
      }
      
      const result = await emailService.processWebhook(complaintWebhook)
      
      expect(result.success).toBe(true)
      
      // Verify user was marked for email suppression
      const { data: suppression } = await testDb.supabase
        .from('vsk_email_suppressions')
        .select('*')
        .eq('email', 'complainer@vetsidekick.com')
        .single()
      
      expect(suppression).toBeDefined()
      expect(suppression.reason).toBe('complaint')
    })
  })
})
```

#### 6.3 File Upload & Storage Testing
**File:** `__tests__/integrations/storage.integration.test.ts`

```javascript
import { StorageService } from '@/services/storageService'
import { TestDatabase } from '../setup/database'
import { createReadStream } from 'fs'
import { join } from 'path'

describe('Storage Integration Tests', () => {
  let storageService: StorageService
  let testDb: TestDatabase
  
  beforeAll(async () => {
    storageService = new StorageService()
    testDb = new TestDatabase()
    await testDb.seedTestData()
  })
  
  afterAll(async () => {
    await testDb.cleanup()
    await storageService.cleanupTestFiles()
  })
  
  describe('Real file upload to Supabase Storage', () => {
    it('uploads actual audio files with validation', async () => {
      const testAudioFile = join(__dirname, '../fixtures/test-audio.mp3')
      const fileStream = createReadStream(testAudioFile)
      const fileBuffer = await streamToBuffer(fileStream)
      
      const result = await storageService.uploadContentFile({
        file: fileBuffer,
        filename: 'test-podcast.mp3',
        contentType: 'audio/mpeg',
        contentId: 'test-content-1',
        userId: 'real-admin-user'
      })
      
      expect(result.success).toBe(true)
      expect(result.url).toContain('supabase')
      expect(result.path).toBe('content/test-content-1/test-podcast.mp3')
      
      // Verify file was actually uploaded
      const { data: file } = await testDb.supabase.storage
        .from('content-files')
        .download(result.path)
      
      expect(file).toBeDefined()
      expect(file.size).toBeGreaterThan(0)
      
      // Verify database record was created
      const { data: fileRecord } = await testDb.supabase
        .from('vsk_content_files')
        .select('*')
        .eq('storage_path', result.path)
        .single()
      
      expect(fileRecord).toBeDefined()
      expect(fileRecord.file_size).toBe(fileBuffer.length)
      expect(fileRecord.content_type).toBe('audio/mpeg')
    })
    
    it('enforces real file size limits', async () => {
      // Create a large test file (over limit)
      const largeBuffer = Buffer.alloc(100 * 1024 * 1024) // 100MB
      
      const result = await storageService.uploadContentFile({
        file: largeBuffer,
        filename: 'large-file.mp3',
        contentType: 'audio/mpeg',
        contentId: 'test-content-1',
        userId: 'real-admin-user'
      }).catch(err => ({ success: false, error: err.message }))
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('File too large')
    })
    
    it('validates file types and security', async () => {
      // Try to upload a potentially malicious file
      const maliciousBuffer = Buffer.from('<?php echo "hack"; ?>')
      
      const result = await storageService.uploadContentFile({
        file: maliciousBuffer,
        filename: 'script.php',
        contentType: 'application/x-php',
        contentId: 'test-content-1',
        userId: 'real-admin-user'
      }).catch(err => ({ success: false, error: err.message }))
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })
    
    it('tests real RLS policies for file access', async () => {
      // Upload file as admin
      const testFile = Buffer.from('test audio content')
      const uploadResult = await storageService.uploadContentFile({
        file: testFile,
        filename: 'protected-content.mp3',
        contentType: 'audio/mpeg',
        contentId: 'test-content-1',
        userId: 'real-admin-user'
      })
      
      expect(uploadResult.success).toBe(true)
      
      // Try to access as regular user without purchase
      await testDb.supabase.auth.signInWithPassword({
        email: 'test1@vetsidekick.com',
        password: 'test-password-123!'
      })
      
      const { data: file, error } = await testDb.supabase.storage
        .from('content-files')
        .download(uploadResult.path)
      
      expect(error).toBeDefined() // Should be denied by RLS
      expect(error.message).toContain('access denied')
    })
  })
  
  describe('Content delivery and streaming', () => {
    it('streams authenticated content securely', async () => {
      // First, create a purchase record
      await testDb.supabase.from('vsk_content_purchases').insert({
        user_id: 'real-test-user-1',
        content_id: 'test-content-1',
        status: 'completed'
      })
      
      // Sign in as purchasing user
      await testDb.supabase.auth.signInWithPassword({
        email: 'test1@vetsidekick.com',
        password: 'test-password-123!'
      })
      
      // Should now be able to access content
      const streamUrl = await storageService.getAuthenticatedStreamUrl(
        'test-content-1',
        'real-test-user-1'
      )
      
      expect(streamUrl).toBeDefined()
      expect(streamUrl).toContain('token=')
      
      // Verify stream URL actually works
      const response = await fetch(streamUrl)
      expect(response.ok).toBe(true)
      expect(response.headers.get('content-type')).toContain('audio')
    })
    
    it('handles different file formats correctly', async () => {
      const formats = [
        { file: 'test-audio.mp3', contentType: 'audio/mpeg' },
        { file: 'test-video.mp4', contentType: 'video/mp4' },
        { file: 'test-document.pdf', contentType: 'application/pdf' }
      ]
      
      for (const format of formats) {
        const testFile = Buffer.from(`test ${format.file} content`)
        
        const result = await storageService.uploadContentFile({
          file: testFile,
          filename: format.file,
          contentType: format.contentType,
          contentId: 'test-content-1',
          userId: 'real-admin-user'
        })
        
        expect(result.success).toBe(true)
        
        // Verify correct content type is preserved
        const { data: file } = await testDb.supabase.storage
          .from('content-files')
          .download(result.path)
        
        expect(file).toBeDefined()
      }
    })
  })
})

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}
```

#### 6.4 Performance & Load Testing
**File:** `__tests__/performance/load.integration.test.ts`

```javascript
import { test, expect } from '@playwright/test'
import { TestDatabase } from '../setup/database'
import { PaymentService } from '@/services/paymentService'

describe('Performance & Load Tests', () => {
  let testDb: TestDatabase
  let paymentService: PaymentService
  
  beforeAll(async () => {
    testDb = new TestDatabase()
    paymentService = new PaymentService()
    await testDb.seedTestData()
  })
  
  afterAll(async () => {
    await testDb.cleanup()
  })
  
  describe('Database performance under load', () => {
    it('handles concurrent user queries efficiently', async () => {
      const startTime = Date.now()
      
      // Simulate 50 concurrent users querying content
      const concurrentQueries = Array.from({ length: 50 }, (_, i) =>
        testDb.supabase
          .from('vsk_content')
          .select('*, vsk_content_purchases!inner(*)')
          .eq('vsk_content_purchases.user_id', `real-test-user-${i % 5}`)
      )
      
      const results = await Promise.all(concurrentQueries)
      const endTime = Date.now()
      
      // All queries should succeed
      expect(results.every(r => r.error === null)).toBe(true)
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(5000) // 5 seconds
      
      console.log(`50 concurrent queries completed in ${endTime - startTime}ms`)
    })
    
    it('measures payment processing throughput', async () => {
      const startTime = Date.now()
      
      // Create 20 checkout sessions concurrently
      const concurrentCheckouts = Array.from({ length: 20 }, (_, i) =>
        paymentService.createCheckoutSession(
          'test-content-1',
          `real-test-user-${i}`,
          'http://localhost:3000/success',
          'http://localhost:3000/cancel'
        )
      )
      
      const results = await Promise.allSettled(concurrentCheckouts)
      const endTime = Date.now()
      
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const avgTimePerCheckout = (endTime - startTime) / successCount
      
      expect(successCount).toBeGreaterThan(15) // Allow for some failures due to rate limiting
      expect(avgTimePerCheckout).toBeLessThan(1000) // Less than 1 second per checkout on average
      
      console.log(`Payment throughput: ${successCount} checkouts in ${endTime - startTime}ms`)
    })
    
    it('tests database connection pool limits', async () => {
      // Test with more connections than typical pool size
      const heavyLoadQueries = Array.from({ length: 100 }, () =>
        testDb.supabase.from('vsk_users').select('count').single()
      )
      
      const startTime = Date.now()
      const results = await Promise.allSettled(heavyLoadQueries)
      const endTime = Date.now()
      
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failureCount = results.filter(r => r.status === 'rejected').length
      
      // Should handle gracefully, not crash
      expect(successCount).toBeGreaterThan(50)
      
      if (failureCount > 0) {
        console.log(`Connection pool limit reached: ${failureCount} queries failed`)
      }
      
      console.log(`Database stress test: ${successCount}/${heavyLoadQueries.length} succeeded in ${endTime - startTime}ms`)
    })
  })
  
  describe('Real user load simulation', () => {
    test('simulates realistic user behavior patterns', async ({ browser }) => {
      // Create multiple browser contexts to simulate different users
      const userContexts = await Promise.all(
        Array.from({ length: 10 }, () => browser.newContext())
      )
      
      const userSessions = userContexts.map((context, i) => 
        simulateUserSession(context, i)
      )
      
      const startTime = Date.now()
      const results = await Promise.allSettled(userSessions)
      const endTime = Date.now()
      
      const successfulSessions = results.filter(r => r.status === 'fulfilled').length
      
      expect(successfulSessions).toBeGreaterThan(7) // Allow for some failures
      
      console.log(`User load test: ${successfulSessions}/10 users completed successfully in ${endTime - startTime}ms`)
      
      // Cleanup
      await Promise.all(userContexts.map(context => context.close()))
    })
  })
  
  describe('Memory and resource usage', () => {
    it('monitors memory usage during intensive operations', async () => {
      const initialMemory = process.memoryUsage()
      
      // Perform memory-intensive operations
      const largeBatchOperations = Array.from({ length: 100 }, async (_, i) => {
        // Create and process large amounts of test data
        const largeData = Array.from({ length: 1000 }, () => ({
          id: `test-${i}-${Math.random()}`,
          data: 'x'.repeat(1000) // 1KB per record
        }))
        
        // Process the data (simulating real application workload)
        return largeData.map(item => ({ ...item, processed: true }))
      })
      
      await Promise.all(largeBatchOperations)
      
      const finalMemory = process.memoryUsage()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      // Should not have excessive memory growth (adjust threshold as needed)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024) // Less than 100MB increase
      
      console.log(`Memory usage: ${Math.round(memoryIncrease / 1024 / 1024)}MB increase`)
    })
  })
})

async function simulateUserSession(context: any, userId: number) {
  const page = await context.newPage()
  
  try {
    // Navigate to app
    await page.goto('http://localhost:3000')
    
    // Sign in
    await page.click('text=Login')
    await page.fill('[data-testid="email"]', `test${userId}@vetsidekick.com`)
    await page.fill('[data-testid="password"]', 'test-password-123!')
    await page.click('[data-testid="login-button"]')
    
    // Browse content
    await page.click('text=Podcasts')
    await page.waitForSelector('[data-testid="content-list"]')
    
    // View some content
    await page.click('[data-testid="content-item"]:first-child')
    await page.waitForSelector('[data-testid="content-details"]')
    
    // Simulate listening/reading time
    await page.waitForTimeout(Math.random() * 2000 + 1000) // 1-3 seconds
    
    // Check user profile
    await page.click('[data-testid="user-menu"]')
    await page.click('text=My Profile')
    await page.waitForSelector('[data-testid="user-profile"]')
    
    await page.close()
    return { success: true, userId }
  } catch (error) {
    await page.close()
    throw error
  }
}
```

#### 6.5 Mobile & Responsive Testing
**File:** `__tests__/e2e/mobile-journey.spec.ts`

```javascript
import { test, expect, devices } from '@playwright/test'
import { TestDatabase } from '../setup/database'

test.describe('Mobile User Journey Tests', () => {
  let testDb: TestDatabase
  
  test.beforeAll(async () => {
    testDb = new TestDatabase()
    await testDb.seedTestData()
  })
  
  test.afterAll(async () => {
    await testDb.cleanup()
  })
  
  test.describe('iPhone 12 Experience', () => {
    test.use({ ...devices['iPhone 12'] })
    
    test('completes purchase flow on mobile', async ({ page }) => {
      await page.goto('http://localhost:3000')
      
      // Test mobile navigation
      await page.click('[data-testid="mobile-menu-button"]')
      await page.click('text=Login')
      
      // Mobile form interaction
      await page.fill('[data-testid="email"]', 'test1@vetsidekick.com')
      await page.fill('[data-testid="password"]', 'test-password-123!')
      await page.tap('[data-testid="login-button"]')
      
      await page.waitForSelector('[data-testid="user-menu"]')
      
      // Test mobile content browsing
      await page.tap('[data-testid="mobile-menu-button"]')
      await page.tap('text=Podcasts')
      
      // Test mobile scroll and content interaction
      await page.locator('[data-testid="content-list"]').scrollIntoViewIfNeeded()
      await page.tap('[data-testid="content-item"]:first-child')
      
      // Test mobile paywall
      await expect(page.locator('[data-testid="paywall"]')).toBeVisible()
      await page.tap('[data-testid="purchase-button"]')
      
      // Mobile payment flow
      await page.waitForURL('**/checkout.stripe.com/**')
      
      // Test mobile card input
      await page.fill('[data-testid="cardNumber"]', '4242424242424242')
      await page.fill('[data-testid="cardExpiry"]', '12/25')
      await page.fill('[data-testid="cardCvc"]', '123')
      await page.tap('[data-testid="submit"]')
      
      await page.waitForURL('**/success**')
      await expect(page.locator('text=Purchase Successful')).toBeVisible()
    })
    
    test('audio player works correctly on mobile', async ({ page }) => {
      // Assume user has purchased content
      await page.goto('http://localhost:3000/podcasts/test-content-1')
      
      // Test mobile audio player
      await expect(page.locator('[data-testid="mobile-audio-player"]')).toBeVisible()
      
      // Test play/pause on mobile
      await page.tap('[data-testid="play-button"]')
      await expect(page.locator('[data-testid="audio-playing"]')).toBeVisible()
      
      // Test mobile seek controls
      await page.tap('[data-testid="seek-forward-15"]')
      
      // Test mobile volume (if applicable)
      if (await page.locator('[data-testid="volume-control"]').isVisible()) {
        await page.tap('[data-testid="volume-control"]')
      }
    })
  })
  
  test.describe('iPad Experience', () => {
    test.use({ ...devices['iPad Pro'] })
    
    test('tablet layout works correctly', async ({ page }) => {
      await page.goto('http://localhost:3000')
      
      // Should show tablet-optimized layout
      await expect(page.locator('[data-testid="tablet-navigation"]')).toBeVisible()
      
      // Test tablet-specific interactions
      await page.click('text=Login')
      await page.fill('[data-testid="email"]', 'test1@vetsidekick.com')
      await page.fill('[data-testid="password"]', 'test-password-123!')
      await page.click('[data-testid="login-button"]')
      
      // Test tablet content grid
      await page.click('text=Podcasts')
      await expect(page.locator('[data-testid="tablet-content-grid"]')).toBeVisible()
      
      // Should show more content per row than mobile
      const contentItems = await page.locator('[data-testid="content-item"]').count()
      expect(contentItems).toBeGreaterThan(2)
    })
  })
  
  test.describe('Android Device Testing', () => {
    test.use({ ...devices['Pixel 5'] })
    
    test('Android-specific functionality', async ({ page }) => {
      await page.goto('http://localhost:3000')
      
      // Test Android keyboard behavior
      await page.click('text=Login')
      await page.fill('[data-testid="email"]', 'test1@vetsidekick.com')
      
      // Android may show different keyboard
      await expect(page.locator('[data-testid="email"]')).toBeFocused()
      
      await page.fill('[data-testid="password"]', 'test-password-123!')
      await page.press('[data-testid="password"]', 'Enter') // Test Enter key
      
      await page.waitForSelector('[data-testid="user-menu"]')
      
      // Test Android-specific gestures
      await page.click('text=Podcasts')
      const contentList = page.locator('[data-testid="content-list"]')
      
      // Test swipe/scroll behavior
      await contentList.hover()
      await page.mouse.wheel(0, 500) // Scroll down
      
      await expect(page.locator('[data-testid="content-item"]').first()).toBeVisible()
    })
  })
  
  test.describe('Cross-device synchronization', () => {
    test('data syncs across devices', async ({ browser }) => {
      // Create mobile and desktop contexts
      const mobileContext = await browser.newContext(devices['iPhone 12'])
      const desktopContext = await browser.newContext()
      
      const mobilePage = await mobileContext.newPage()
      const desktopPage = await desktopContext.newPage()
      
      try {
        // Start purchase on mobile
        await mobilePage.goto('http://localhost:3000')
        await mobilePage.tap('text=Login')
        await mobilePage.fill('[data-testid="email"]', 'test1@vetsidekick.com')
        await mobilePage.fill('[data-testid="password"]', 'test-password-123!')
        await mobilePage.tap('[data-testid="login-button"]')
        
        await mobilePage.tap('[data-testid="mobile-menu-button"]')
        await mobilePage.tap('text=Podcasts')
        await mobilePage.tap('[data-testid="content-item"]:first-child')
        await mobilePage.tap('[data-testid="purchase-button"]')
        
        // Complete purchase flow on mobile...
        // (abbreviated for space)
        
        // Switch to desktop and verify purchase appears
        await desktopPage.goto('http://localhost:3000')
        await desktopPage.click('text=Login')
        await desktopPage.fill('[data-testid="email"]', 'test1@vetsidekick.com')
        await desktopPage.fill('[data-testid="password"]', 'test-password-123!')
        await desktopPage.click('[data-testid="login-button"]')
        
        await desktopPage.click('text=My Content')
        
        // Should show purchased content
        await expect(desktopPage.locator('text=Real Test Content')).toBeVisible()
        
      } finally {
        await mobileContext.close()
        await desktopContext.close()
      }
    })
  })
})
```

#### 6.6 Security Testing Enhancements
**File:** `__tests__/security/security.integration.test.ts`

```javascript
import { TestDatabase } from '../setup/database'
import { supabase } from '@/lib/supabase'

describe('Security Integration Tests', () => {
  let testDb: TestDatabase
  
  beforeAll(async () => {
    testDb = new TestDatabase()
    await testDb.seedTestData()
  })
  
  afterAll(async () => {
    await testDb.cleanup()
  })
  
  describe('SQL Injection Prevention', () => {
    it('prevents SQL injection with real database', async () => {
      const maliciousInput = "'; DROP TABLE vsk_users; --"
      
      // Attempt SQL injection through user search
      const { data, error } = await testDb.supabase
        .from('vsk_users')
        .select('*')
        .eq('email', maliciousInput)
      
      // Should be safe - no error, no data returned, table still exists
      expect(error).toBeNull()
      expect(data).toEqual([])
      
      // Verify table still exists
      const { data: users } = await testDb.supabase
        .from('vsk_users')
        .select('count')
        .single()
      
      expect(users).toBeDefined()
    })
    
    it('prevents injection through content search', async () => {
      const maliciousSearchTerm = "'; UPDATE vsk_content SET price_cents = 0; --"
      
      // Attempt injection through content search
      const { data, error } = await testDb.supabase
        .from('vsk_content')
        .select('*')
        .textSearch('title', maliciousSearchTerm)
      
      expect(error).toBeNull()
      
      // Verify prices weren't modified
      const { data: content } = await testDb.supabase
        .from('vsk_content')
        .select('price_cents')
        .eq('id', 'test-content-1')
        .single()
      
      expect(content.price_cents).toBe(2999) // Original price unchanged
    })
  })
  
  describe('Authentication Security', () => {
    it('enforces password complexity requirements', async () => {
      const weakPasswords = ['123', 'password', 'abc123', 'qwerty']
      
      for (const weakPassword of weakPasswords) {
        const { data, error } = await supabase.auth.signUp({
          email: `weak-test-${Date.now()}@vetsidekick.com`,
          password: weakPassword
        })
        
        expect(error).toBeDefined()
        expect(error.message).toContain('Password should be at least')
      }
    })
    
    it('prevents brute force attacks', async () => {
      const testEmail = 'bruteforce@vetsidekick.com'
      
      // Attempt multiple failed logins
      const attemptCount = 10
      const failedAttempts = Array.from({ length: attemptCount }, () =>
        supabase.auth.signInWithPassword({
          email: testEmail,
          password: 'wrong-password'
        })
      )
      
      const results = await Promise.allSettled(failedAttempts)
      const errors = results.filter(r => r.status === 'rejected' || r.value.error)
      
      expect(errors.length).toBe(attemptCount)
      
      // Should eventually get rate limited
      const lastError = results[results.length - 1]
      if (lastError.status === 'fulfilled') {
        expect(lastError.value.error?.message).toContain('rate limit')
      }
    })
    
    it('validates JWT token security', async () => {
      // Sign in valid user
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: 'test1@vetsidekick.com',
        password: 'test-password-123!'
      })
      
      expect(authData.session?.access_token).toBeDefined()
      
      // Test with manipulated token
      const manipulatedToken = authData.session.access_token.slice(0, -10) + 'manipulated'
      
      // Should reject manipulated token
      const { data: userData, error } = await supabase.auth.getUser(manipulatedToken)
      expect(error).toBeDefined()
      expect(error.message).toContain('Invalid')
    })
  })
  
  describe('Authorization & RLS Testing', () => {
    it('enforces row-level security policies', async () => {
      // Create user 1 and add purchase
      await testDb.supabase.from('vsk_content_purchases').insert({
        id: 'purchase-user-1',
        user_id: 'real-test-user-1',
        content_id: 'test-content-1',
        status: 'completed'
      })
      
      // Create user 2 and add different purchase
      await testDb.supabase.from('vsk_content_purchases').insert({
        id: 'purchase-user-2',
        user_id: 'real-test-user-2',
        content_id: 'test-content-2',
        status: 'completed'
      })
      
      // Sign in as user 1
      await supabase.auth.signInWithPassword({
        email: 'test1@vetsidekick.com',
        password: 'test-password-123!'
      })
      
      // Should only see own purchases
      const { data: user1Purchases } = await supabase
        .from('vsk_content_purchases')
        .select('*')
      
      expect(user1Purchases?.every(p => p.user_id === 'real-test-user-1')).toBe(true)
      expect(user1Purchases?.find(p => p.user_id === 'real-test-user-2')).toBeUndefined()
    })
    
    it('validates admin-only operations', async () => {
      // Sign in as regular user
      await supabase.auth.signInWithPassword({
        email: 'test1@vetsidekick.com',
        password: 'test-password-123!'
      })
      
      // Try to perform admin operation
      const { data, error } = await supabase
        .from('vsk_content')
        .insert({
          id: 'unauthorized-content',
          title: 'Unauthorized Content',
          price_cents: 1999,
          created_by: 'real-test-user-1' // Regular user trying to create content
        })
      
      expect(error).toBeDefined()
      expect(error.message).toContain('permission denied')
    })
  })
  
  describe('CORS & API Security', () => {
    it('validates CORS policies', async () => {
      const response = await fetch('http://localhost:3000/api/payments/checkout', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://malicious-site.com',
          'Access-Control-Request-Method': 'POST'
        }
      })
      
      // Should not allow unauthorized origins
      const corsHeader = response.headers.get('Access-Control-Allow-Origin')
      expect(corsHeader).not.toBe('https://malicious-site.com')
    })
    
    it('enforces rate limiting on API endpoints', async () => {
      const rapidRequests = Array.from({ length: 100 }, () =>
        fetch('http://localhost:3000/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password'
          })
        })
      )
      
      const results = await Promise.allSettled(rapidRequests)
      const rateLimitedRequests = results.filter(r => 
        r.status === 'fulfilled' && r.value.status === 429
      )
      
      expect(rateLimitedRequests.length).toBeGreaterThan(0)
    })
  })
  
  describe('Content Security', () => {
    it('prevents unauthorized content access', async () => {
      // Try to access premium content without authentication
      const response = await fetch('http://localhost:3000/api/content/premium/test-content-1')
      
      expect(response.status).toBe(401)
    })
    
    it('validates content ownership before streaming', async () => {
      // Sign in as user without purchase
      await supabase.auth.signInWithPassword({
        email: 'test2@vetsidekick.com',
        password: 'test-password-123!'
      })
      
      // Try to access content they haven't purchased
      const response = await fetch('http://localhost:3000/api/stream/test-content-1', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })
      
      expect(response.status).toBe(403)
    })
    
    it('prevents direct file access bypass', async () => {
      // Try to access files directly via storage URL manipulation
      const directStorageAttempt = await fetch('http://localhost:3000/storage/content/test-content-1/audio.mp3')
      
      expect(directStorageAttempt.status).not.toBe(200)
    })
  })
  
  describe('Data Privacy & GDPR Compliance', () => {
    it('supports user data deletion', async () => {
      // Create test user data
      const testUserId = 'gdpr-test-user'
      await testDb.supabase.from('vsk_users').insert({
        id: testUserId,
        email: 'gdpr-test@vetsidekick.com',
        name: 'GDPR Test User'
      })
      
      // Add user activity data
      await testDb.supabase.from('vsk_quiz_completions').insert({
        user_id: testUserId,
        quiz_id: 'test-quiz-1',
        score: 85,
        completed_at: new Date().toISOString()
      })
      
      // Request data deletion (admin operation)
      await supabase.auth.signInWithPassword({
        email: 'admin@vetsidekick.com',
        password: 'admin-password-123!'
      })
      
      const { error: deleteError } = await supabase.rpc('delete_user_data', {
        target_user_id: testUserId
      })
      
      expect(deleteError).toBeNull()
      
      // Verify user data is gone
      const { data: userData } = await testDb.supabase
        .from('vsk_users')
        .select('*')
        .eq('id', testUserId)
      
      expect(userData).toEqual([])
      
      // Verify related data is also deleted
      const { data: quizData } = await testDb.supabase
        .from('vsk_quiz_completions')
        .select('*')
        .eq('user_id', testUserId)
      
      expect(quizData).toEqual([])
    })
    
    it('supports data export for users', async () => {
      const { data: userData, error } = await supabase.rpc('export_user_data', {
        target_user_id: 'real-test-user-1'
      })
      
      expect(error).toBeNull()
      expect(userData).toBeDefined()
      expect(userData.user_profile).toBeDefined()
      expect(userData.purchases).toBeDefined()
      expect(userData.quiz_completions).toBeDefined()
      
      // Verify no sensitive data is included
      expect(userData.user_profile.password).toBeUndefined()
      expect(userData.user_profile.auth_tokens).toBeUndefined()
    })
  })
})
```

#### 6.7 Third-Party Integration Testing
**File:** `__tests__/integrations/third-party.integration.test.ts`

```javascript
import { GoogleOAuthService } from '@/services/googleOAuthService'
import { AnalyticsService } from '@/services/analyticsService'
import { TestDatabase } from '../setup/database'

describe('Third-Party Integration Tests', () => {
  let testDb: TestDatabase
  let googleOAuth: GoogleOAuthService
  let analytics: AnalyticsService
  
  beforeAll(async () => {
    testDb = new TestDatabase()
    googleOAuth = new GoogleOAuthService()
    analytics = new AnalyticsService()
    await testDb.seedTestData()
  })
  
  afterAll(async () => {
    await testDb.cleanup()
  })
  
  describe('Real Google OAuth Integration', () => {
    it('handles real OAuth flow with test credentials', async () => {
      // Use Google OAuth test playground
      const testOAuthCode = process.env.GOOGLE_OAUTH_TEST_CODE
      
      if (!testOAuthCode) {
        console.log('Skipping OAuth test - no test code provided')
        return
      }
      
      const result = await googleOAuth.exchangeCodeForTokens(testOAuthCode)
      
      expect(result.success).toBe(true)
      expect(result.tokens.access_token).toBeDefined()
      expect(result.tokens.refresh_token).toBeDefined()
      
      // Get user info with real token
      const userInfo = await googleOAuth.getUserInfo(result.tokens.access_token)
      
      expect(userInfo.email).toContain('@')
      expect(userInfo.verified_email).toBe(true)
    })
    
    it('handles OAuth token refresh', async () => {
      const testRefreshToken = process.env.GOOGLE_OAUTH_TEST_REFRESH_TOKEN
      
      if (!testRefreshToken) {
        console.log('Skipping token refresh test - no refresh token provided')
        return
      }
      
      const result = await googleOAuth.refreshAccessToken(testRefreshToken)
      
      expect(result.success).toBe(true)
      expect(result.access_token).toBeDefined()
      expect(result.expires_in).toBeGreaterThan(0)
    })
    
    it('handles OAuth errors gracefully', async () => {
      const invalidCode = 'invalid-oauth-code-123'
      
      const result = await googleOAuth.exchangeCodeForTokens(invalidCode)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error).toContain('invalid_grant')
    })
  })
  
  describe('Analytics Integration', () => {
    it('sends real events to analytics service', async () => {
      const eventData = {
        event: 'content_purchased',
        userId: 'real-test-user-1',
        properties: {
          contentId: 'test-content-1',
          amount: 29.99,
          currency: 'GBP'
        }
      }
      
      const result = await analytics.trackEvent(eventData)
      
      expect(result.success).toBe(true)
      expect(result.eventId).toBeDefined()
    })
    
    it('handles analytics service outages', async () => {
      // Mock network failure for analytics
      const originalFetch = global.fetch
      global.fetch = jest.fn((url) => {
        if (url.includes('analytics')) {
          return Promise.reject(new Error('Analytics service unavailable'))
        }
        return originalFetch(url)
      })
      
      const eventData = {
        event: 'test_event',
        userId: 'real-test-user-1',
        properties: { test: true }
      }
      
      // Should not throw, should handle gracefully
      const result = await analytics.trackEvent(eventData)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Analytics service unavailable')
      
      // Restore fetch
      global.fetch = originalFetch
    })
    
    it('batches analytics events efficiently', async () => {
      const events = Array.from({ length: 50 }, (_, i) => ({
        event: 'test_batch_event',
        userId: `user-${i}`,
        properties: { index: i }
      }))
      
      const startTime = Date.now()
      const results = await analytics.trackEventBatch(events)
      const endTime = Date.now()
      
      expect(results.success).toBe(true)
      expect(results.processedCount).toBe(50)
      expect(endTime - startTime).toBeLessThan(5000) // Should be efficient
    })
  })
  
  describe('CDN Integration', () => {
    it('validates CDN content delivery', async () => {
      const cdnUrl = 'https://cdn.vetsidekick.com/test-image.jpg'
      
      const response = await fetch(cdnUrl)
      
      expect(response.ok).toBe(true)
      expect(response.headers.get('content-type')).toContain('image')
      expect(response.headers.get('cache-control')).toBeDefined()
    })
    
    it('handles CDN cache invalidation', async () => {
      // This would typically involve calling CDN API
      const invalidationResult = await fetch('/api/cdn/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paths: ['/test-content-1/*']
        })
      })
      
      expect(invalidationResult.ok).toBe(true)
    })
  })
  
  describe('Monitoring Service Integration', () => {
    it('sends real error reports', async () => {
      const testError = new Error('Test integration error')
      testError.stack = 'Test stack trace'
      
      const result = await analytics.reportError(testError, {
        userId: 'real-test-user-1',
        context: 'integration-test'
      })
      
      expect(result.success).toBe(true)
      expect(result.errorId).toBeDefined()
    })
    
    it('tracks performance metrics', async () => {
      const performanceMetrics = {
        route: '/test-route',
        responseTime: 150,
        memoryUsage: 45.6,
        dbQueryCount: 3,
        dbQueryTime: 25
      }
      
      const result = await analytics.trackPerformance(performanceMetrics)
      
      expect(result.success).toBe(true)
    })
  })
})
```

### Phase 7: Enhanced Test Configuration & Utilities

#### 7.1 Test Configuration Management
**File:** `__tests__/config/testConfig.ts`

```javascript
export interface TestConfig {
  timeouts: {
    payment: number
    database: number
    fileUpload: number
    email: number
  }
  limits: {
    maxConcurrentUsers: number
    maxFileSize: number
    maxApiRequestsPerMinute: number
  }
  retries: {
    flaky: number
    external: number
    network: number
  }
  environments: {
    database: {
      url: string
      serviceRoleKey: string
    }
    stripe: {
      publishableKey: string
      secretKey: string
      webhookSecret: string
    }
    email: {
      apiKey: string
      fromEmail: string
    }
  }
}

export const testConfig: TestConfig = {
  timeouts: {
    payment: 30000,
    database: 5000,
    fileUpload: 60000,
    email: 10000
  },
  limits: {
    maxConcurrentUsers: 50,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxApiRequestsPerMinute: 1000
  },
  retries: {
    flaky: 3,
    external: 2,
    network: 5
  },
  environments: {
    database: {
      url: process.env.TEST_SUPABASE_URL!,
      serviceRoleKey: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
    },
    stripe: {
      publishableKey: process.env.STRIPE_TEST_PUBLISHABLE_KEY!,
      secretKey: process.env.STRIPE_TEST_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_TEST_WEBHOOK_SECRET!
    },
    email: {
      apiKey: process.env.EMAIL_TEST_API_KEY!,
      fromEmail: 'test@vetsidekick.com'
    }
  }
}

// Environment validation
export function validateTestEnvironment() {
  const requiredEnvVars = [
    'TEST_SUPABASE_URL',
    'TEST_SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_TEST_SECRET_KEY',
    'EMAIL_TEST_API_KEY'
  ]
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required test environment variables: ${missingVars.join(', ')}`)
  }
}

// Performance monitoring
export class TestMetrics {
  private static metrics: Array<{
    testName: string
    duration: number
    memoryUsage: NodeJS.MemoryUsage
    timestamp: Date
  }> = []
  
  static recordTestMetrics(testName: string, startTime: number, startMemory: NodeJS.MemoryUsage) {
    const endTime = Date.now()
    const endMemory = process.memoryUsage()
    
    this.metrics.push({
      testName,
      duration: endTime - startTime,
      memoryUsage: {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        external: endMemory.external - startMemory.external,
        arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
      },
      timestamp: new Date()
    })
  }
  
  static getMetrics() {
    return this.metrics
  }
  
  static generateReport() {
    const totalTests = this.metrics.length
    const avgDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalTests
    const maxMemoryUsage = Math.max(...this.metrics.map(m => m.memoryUsage.heapUsed))
    
    return {
      totalTests,
      averageDuration: Math.round(avgDuration),
      maxMemoryIncrease: Math.round(maxMemoryUsage / 1024 / 1024), // MB
      slowestTests: this.metrics
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .map(m => ({ name: m.testName, duration: m.duration }))
    }
  }
}
```

#### 7.2 Enhanced Cleanup Strategy
**File:** `__tests__/utils/testCleanup.ts`

```javascript
import { TestDatabase } from '../setup/database'
import { TestStripeService } from '../setup/stripe'
import { supabase } from '@/lib/supabase'

export class TestCleanup {
  private static testRunId: string = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  private static createdResources: Array<{
    type: string
    id: string
    cleanup: () => Promise<void>
  }> = []
  
  static getTestRunId() {
    return this.testRunId
  }
  
  static createTestId(prefix: string) {
    return `${prefix}-${this.testRunId}-${Math.random().toString(36).substr(2, 5)}`
  }
  
  static createTestEmail(baseEmail: string) {
    const [name, domain] = baseEmail.split('@')
    return `${name}-${this.testRunId}@${domain}`
  }
  
  static trackResource(type: string, id: string, cleanupFn: () => Promise<void>) {
    this.createdResources.push({
      type,
      id,
      cleanup: cleanupFn
    })
  }
  
  static async cleanupAllResources() {
    console.log(`Cleaning up ${this.createdResources.length} test resources...`)
    
    const cleanupPromises = this.createdResources.map(async (resource) => {
      try {
        await resource.cleanup()
        console.log(`✓ Cleaned up ${resource.type}: ${resource.id}`)
      } catch (error) {
        console.warn(`⚠ Failed to cleanup ${resource.type}: ${resource.id}`, error)
      }
    })
    
    await Promise.allSettled(cleanupPromises)
    this.createdResources = []
  }
  
  static async cleanupDatabase() {
    const testDb = new TestDatabase()
    
    try {
      // Clean up test data in reverse dependency order
      await testDb.supabase.from('vsk_quiz_completions')
        .delete()
        .like('id', `%${this.testRunId}%`)
      
      await testDb.supabase.from('vsk_content_purchases')
        .delete()
        .like('stripe_session_id', `%${this.testRunId}%`)
      
      await testDb.supabase.from('vsk_users')
        .delete()
        .like('email', `%${this.testRunId}%`)
      
      await testDb.supabase.from('vsk_content')
        .delete()
        .like('id', `%${this.testRunId}%`)
      
      console.log('✓ Database cleanup completed')
    } catch (error) {
      console.warn('⚠ Database cleanup failed:', error)
    }
  }
  
  static async cleanupStripeTestData() {
    const stripe = new TestStripeService()
    
    try {
      // Clean up test products and prices
      const products = await stripe.stripe.products.list({
        limit: 100,
        created: { gte: Math.floor(Date.now() / 1000) - 3600 } // Last hour
      })
      
      for (const product of products.data) {
        if (product.metadata.test === 'true' || product.name.includes(this.testRunId)) {
          await stripe.stripe.products.update(product.id, { active: false })
        }
      }
      
      console.log('✓ Stripe test data cleanup completed')
    } catch (error) {
      console.warn('⚠ Stripe cleanup failed:', error)
    }
  }
  
  static async cleanupTestFiles() {
    try {
      // Clean up uploaded test files
      const { data: files } = await supabase.storage
        .from('content-files')
        .list('test', { limit: 1000 })
      
      if (files) {
        const testFiles = files
          .filter(file => file.name.includes(this.testRunId))
          .map(file => `test/${file.name}`)
        
        if (testFiles.length > 0) {
          const { error } = await supabase.storage
            .from('content-files')
            .remove(testFiles)
          
          if (error) {
            console.warn('⚠ File cleanup failed:', error)
          } else {
            console.log(`✓ Cleaned up ${testFiles.length} test files`)
          }
        }
      }
    } catch (error) {
      console.warn('⚠ File cleanup failed:', error)
    }
  }
  
  static async cleanupEmailTestData() {
    try {
      // Clean up email logs for test run
      const { error } = await supabase
        .from('vsk_email_logs')
        .delete()
        .like('recipient', `%${this.testRunId}%`)
      
      if (error) {
        console.warn('⚠ Email cleanup failed:', error)
      } else {
        console.log('✓ Email test data cleanup completed')
      }
    } catch (error) {
      console.warn('⚠ Email cleanup failed:', error)
    }
  }
}

// Global test setup
beforeAll(async () => {
  console.log(`Starting test run: ${TestCleanup.getTestRunId()}`)
})

// Global test teardown
afterAll(async () => {
  await TestCleanup.cleanupAllResources()
  await TestCleanup.cleanupDatabase()
  await TestCleanup.cleanupStripeTestData()
  await TestCleanup.cleanupTestFiles()
  await TestCleanup.cleanupEmailTestData()
})

// Handle process termination
process.on('exit', () => {
  console.log('Process exiting, attempting cleanup...')
  // Note: This won't work for async cleanup, but serves as a reminder
})

process.on('SIGINT', async () => {
  console.log('Received SIGINT, cleaning up...')
  await TestCleanup.cleanupAllResources()
  process.exit(0)
})
```

#### 7.3 Data Migration & Schema Testing
**File:** `__tests__/database/schema.integration.test.ts`

```javascript
import { TestDatabase } from '../setup/database'
import { supabase } from '@/lib/supabase'

describe('Database Schema & Migration Tests', () => {
  let testDb: TestDatabase
  
  beforeAll(async () => {
    testDb = new TestDatabase()
  })
  
  describe('Schema validation', () => {
    it('validates all required tables exist', async () => {
      const requiredTables = [
        'vsk_users',
        'vsk_content',
        'vsk_content_purchases',
        'vsk_quiz_questions',
        'vsk_quiz_completions',
        'vsk_user_progress',
        'vsk_email_logs'
      ]
      
      for (const table of requiredTables) {
        const { data, error } = await testDb.supabase
          .from(table)
          .select('count')
          .limit(1)
        
        expect(error).toBeNull()
        expect(data).toBeDefined()
      }
    })
    
    it('validates foreign key constraints', async () => {
      // Test foreign key constraint: content_purchases -> users
      const { error } = await testDb.supabase
        .from('vsk_content_purchases')
        .insert({
          id: 'test-invalid-fk',
          user_id: 'non-existent-user',
          content_id: 'test-content-1',
          status: 'pending'
        })
      
      expect(error).toBeDefined()
      expect(error.message).toContain('violates foreign key constraint')
    })
    
    it('validates unique constraints', async () => {
      // Insert valid record first
      const { error: insertError } = await testDb.supabase
        .from('vsk_content')
        .insert({
          id: 'unique-test-content',
          title: 'Unique Test Content',
          slug: 'unique-test-slug',
          price_cents: 2999
        })
      
      expect(insertError).toBeNull()
      
      // Try to insert duplicate
      const { error: duplicateError } = await testDb.supabase
        .from('vsk_content')
        .insert({
          id: 'unique-test-content-2',
          title: 'Another Title',
          slug: 'unique-test-slug', // Same slug
          price_cents: 1999
        })
      
      expect(duplicateError).toBeDefined()
      expect(duplicateError.message).toContain('duplicate key value')
    })
  })
})
```

### Phase 8: Advanced Test Organization & Reliability

#### 8.1 Test Categories & Organization
**File:** `__tests__/utils/testCategories.ts`

```javascript
// Test categorization for better organization and execution control
export const testCategories = {
  unit: 'unit',
  integration: 'integration',
  e2e: 'e2e',
  performance: 'performance',
  security: 'security',
  flaky: 'flaky',
  slow: 'slow'
} as const

// Test organization helpers
export function categorizeTest(category: keyof typeof testCategories, testName: string, testFn: () => void) {
  describe(`[${category.toUpperCase()}] ${testName}`, testFn)
}

// Conditional test execution based on environment
export function conditionalDescribe(condition: boolean, name: string, fn: () => void) {
  return condition ? describe(name, fn) : describe.skip(name, fn)
}

// Test suite organization examples
describe.concurrent('API Integration Tests', () => {
  // Tests that can run in parallel
})

describe.serial('Database Migration Tests', () => {
  // Tests that must run sequentially
})

describe.slow('Performance Tests', () => {
  // Long-running performance tests
  jest.setTimeout(60000)
})

describe.each([
  ['chrome', 'Desktop Chrome'],
  ['firefox', 'Desktop Firefox'],
  ['webkit', 'Desktop Safari']
])('Cross-browser tests on %s', (browser, description) => {
  test(`should work on ${description}`, async () => {
    // Browser-specific test implementation
  })
})
```

#### 8.2 Flaky Test Handling & Retry Logic
**File:** `__tests__/utils/retryHelper.ts`

```javascript
export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  exponentialBackoff?: boolean
  retryCondition?: (error: Error) => boolean
}

export function retryFlaky<T>(
  testFn: () => Promise<T>,
  options: RetryOptions = {}
): () => Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    exponentialBackoff = true,
    retryCondition = () => true
  } = options

  return async function(this: any): Promise<T> {
    let lastError: Error
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        return await testFn.call(this)
      } catch (error) {
        lastError = error as Error
        attempt++

        if (attempt >= maxRetries || !retryCondition(lastError)) {
          throw lastError
        }

        // Calculate delay with optional exponential backoff
        const delay = exponentialBackoff 
          ? Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
          : baseDelay

        console.warn(
          `Test attempt ${attempt}/${maxRetries} failed: ${lastError.message}. ` +
          `Retrying in ${delay}ms...`
        )
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }
}

// Usage examples
describe('Flaky Network Tests', () => {
  it('handles network timeouts with retry', retryFlaky(async () => {
    const response = await fetch('https://api.external-service.com/data')
    expect(response.ok).toBe(true)
  }, {
    maxRetries: 5,
    retryCondition: (error) => error.message.includes('timeout')
  }))

  it('retries payment processing failures', retryFlaky(async () => {
    const session = await paymentService.createCheckoutSession(/* params */)
    expect(session.id).toMatch(/^cs_test_/)
  }, {
    maxRetries: 3,
    exponentialBackoff: true,
    retryCondition: (error) => 
      error.message.includes('rate_limit') || 
      error.message.includes('temporary')
  }))
})
```

#### 8.3 Test Data Management & Versioning
**File:** `__tests__/fixtures/testDataManager.ts`

```javascript
export interface TestDataVersion {
  version: string
  description: string
  users: any[]
  content: any[]
  quizzes: any[]
  createdAt: Date
}

export class TestDataManager {
  private static versions: Map<string, TestDataVersion> = new Map()

  static registerVersion(version: TestDataVersion) {
    this.versions.set(version.version, version)
  }

  static getVersion(version: string): TestDataVersion {
    const data = this.versions.get(version)
    if (!data) {
      throw new Error(`Test data version ${version} not found`)
    }
    return data
  }

  static async seedVersion(testDb: TestDatabase, version: string) {
    const data = this.getVersion(version)
    
    console.log(`Seeding test data version ${version}: ${data.description}`)

    // Clean up existing data
    await this.cleanup(testDb)

    // Seed data in dependency order
    for (const user of data.users) {
      await testDb.supabase.from('vsk_users').insert(user)
    }

    for (const content of data.content) {
      await testDb.supabase.from('vsk_content').insert(content)
    }

    for (const quiz of data.quizzes) {
      await testDb.supabase.from('vsk_quizzes').insert(quiz)
    }
  }

  private static async cleanup(testDb: TestDatabase) {
    const tables = ['vsk_quiz_completions', 'vsk_content_purchases', 'vsk_quizzes', 'vsk_content', 'vsk_users']
    
    for (const table of tables) {
      await testDb.supabase.from(table).delete().neq('id', '')
    }
  }
}

// Test data versions
export const testDataV1: TestDataVersion = {
  version: '1.0',
  description: 'Basic test data with simple user/content structure',
  createdAt: new Date('2023-01-01'),
  users: [
    { id: 'v1-user-1', email: 'user1@v1.test', name: 'V1 User 1', role: 'user' },
    { id: 'v1-admin', email: 'admin@v1.test', name: 'V1 Admin', role: 'admin' }
  ],
  content: [
    { id: 'v1-content-1', title: 'V1 Content', price_cents: 2999, is_purchasable: true }
  ],
  quizzes: [
    { id: 'v1-quiz-1', title: 'V1 Quiz', content_id: 'v1-content-1' }
  ]
}

export const testDataV2: TestDataVersion = {
  version: '2.0',
  description: 'Enhanced test data with special offer pricing',
  createdAt: new Date('2023-06-01'),
  users: [
    { id: 'v2-user-1', email: 'user1@v2.test', name: 'V2 User 1', role: 'user' },
    { id: 'v2-admin', email: 'admin@v2.test', name: 'V2 Admin', role: 'admin' }
  ],
  content: [
    { 
      id: 'v2-content-1', 
      title: 'V2 Content', 
      price_cents: 2999, 
      special_offer_price_cents: 1999,
      special_offer_active: true,
      is_purchasable: true 
    }
  ],
  quizzes: [
    { id: 'v2-quiz-1', title: 'V2 Quiz', content_id: 'v2-content-1' }
  ]
}

// Register versions
TestDataManager.registerVersion(testDataV1)
TestDataManager.registerVersion(testDataV2)

// Migration testing
describe('Data Migration Tests', () => {
  it('migrates from v1 to v2 data structure', async () => {
    const testDb = new TestDatabase()
    
    // Start with v1 data
    await TestDataManager.seedVersion(testDb, '1.0')
    
    // Verify v1 structure
    const { data: v1Content } = await testDb.supabase
      .from('vsk_content')
      .select('*')
      .single()
    
    expect(v1Content.special_offer_price_cents).toBeNull()
    
    // Run migration
    await runDataMigration('v1-to-v2')
    
    // Verify v2 structure
    const { data: v2Content } = await testDb.supabase
      .from('vsk_content')
      .select('*')
      .single()
    
    expect(v2Content.special_offer_price_cents).toBeDefined()
  })
})
```

#### 8.4 CI/CD Integration & Environment Management
**File:** `.github/workflows/integration-tests.yml`

```yaml
name: Integration Tests
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  test-matrix:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        test-category: [unit, integration, e2e, performance]
        node-version: [18, 20]
        
    services:
      postgres:
        image: supabase/postgres:15.1.0.55
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
          POSTGRES_DB: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup test environment
        run: |
          cp .env.test.example .env.test
          npm run test:setup
        env:
          TEST_SUPABASE_URL: http://localhost:54321
          TEST_SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
          STRIPE_TEST_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
          STRIPE_TEST_WEBHOOK_SECRET: ${{ secrets.STRIPE_TEST_WEBHOOK_SECRET }}

      - name: Run ${{ matrix.test-category }} tests
        run: npm run test:${{ matrix.test-category }}
        timeout-minutes: 30

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results-${{ matrix.test-category }}-node${{ matrix.node-version }}
          path: |
            test-results/
            coverage/
            playwright-report/

      - name: Generate performance baseline
        if: matrix.test-category == 'performance'
        run: npm run test:performance:baseline

  security-tests:
    runs-on: ubuntu-latest
    needs: test-matrix
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level high

      - name: Run dependency vulnerability scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  test-report:
    runs-on: ubuntu-latest
    needs: [test-matrix, security-tests]
    if: always()
    steps:
      - name: Download test artifacts
        uses: actions/download-artifact@v3

      - name: Generate comprehensive test report
        run: |
          npm run test:report:generate
          npm run test:report:compare-baseline

      - name: Post results to PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs')
            const report = fs.readFileSync('test-report.md', 'utf8')
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            })
```

#### 8.5 Enhanced Test Reporting & Analytics
**File:** `__tests__/utils/testReporter.ts`

```javascript
export interface TestMetric {
  testName: string
  category: string
  duration: number
  memoryUsage: NodeJS.MemoryUsage
  success: boolean
  errorMessage?: string
  timestamp: Date
  environmentInfo: {
    nodeVersion: string
    platform: string
    cpuCount: number
    totalMemory: number
  }
}

export class TestReporter {
  private static metrics: TestMetric[] = []
  private static baseline: TestMetric[] = []

  static recordMetric(metric: TestMetric) {
    this.metrics.push(metric)
  }

  static loadBaseline(baselinePath: string) {
    try {
      const baselineData = require(baselinePath)
      this.baseline = baselineData
    } catch (error) {
      console.warn('No baseline data found, creating new baseline')
    }
  }

  static generateHTMLReport(): string {
    const successRate = this.metrics.filter(m => m.success).length / this.metrics.length * 100
    const avgDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length
    const maxMemoryUsage = Math.max(...this.metrics.map(m => m.memoryUsage.heapUsed))

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>VetSidekick Test Report</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .metric-card { 
            display: inline-block; 
            background: #f5f5f5; 
            padding: 20px; 
            margin: 10px; 
            border-radius: 8px; 
            min-width: 200px;
          }
          .success { border-left: 4px solid #4CAF50; }
          .warning { border-left: 4px solid #FF9800; }
          .error { border-left: 4px solid #F44336; }
        </style>
      </head>
      <body>
        <h1>VetSidekick Test Report</h1>
        
        <div class="metric-card success">
          <h3>Success Rate</h3>
          <div style="font-size: 2em; font-weight: bold;">${successRate.toFixed(1)}%</div>
        </div>
        
        <div class="metric-card ${avgDuration > 5000 ? 'warning' : 'success'}">
          <h3>Average Duration</h3>
          <div style="font-size: 2em; font-weight: bold;">${avgDuration.toFixed(0)}ms</div>
        </div>
        
        <div class="metric-card ${maxMemoryUsage > 100 * 1024 * 1024 ? 'warning' : 'success'}">
          <h3>Peak Memory Usage</h3>
          <div style="font-size: 2em; font-weight: bold;">${Math.round(maxMemoryUsage / 1024 / 1024)}MB</div>
        </div>

        <h2>Performance Trends</h2>
        <canvas id="performanceChart" width="800" height="400"></canvas>
        
        <h2>Test Details</h2>
        <table border="1" cellpadding="8" cellspacing="0" style="width: 100%;">
          <tr>
            <th>Test Name</th>
            <th>Category</th>
            <th>Duration (ms)</th>
            <th>Memory (MB)</th>
            <th>Status</th>
          </tr>
          ${this.metrics.map(m => `
            <tr class="${m.success ? 'success' : 'error'}">
              <td>${m.testName}</td>
              <td>${m.category}</td>
              <td>${m.duration}</td>
              <td>${Math.round(m.memoryUsage.heapUsed / 1024 / 1024)}</td>
              <td>${m.success ? '✅ Pass' : '❌ Fail'}</td>
            </tr>
          `).join('')}
        </table>

        <script>
          const ctx = document.getElementById('performanceChart').getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: ${JSON.stringify(this.metrics.map((_, i) => `Test ${i + 1}`))},
              datasets: [{
                label: 'Duration (ms)',
                data: ${JSON.stringify(this.metrics.map(m => m.duration))},
                borderColor: '#4CAF50',
                fill: false
              }, {
                label: 'Memory Usage (MB)',
                data: ${JSON.stringify(this.metrics.map(m => Math.round(m.memoryUsage.heapUsed / 1024 / 1024)))},
                borderColor: '#FF9800',
                fill: false,
                yAxisID: 'y1'
              }]
            },
            options: {
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Duration (ms)' } },
                y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Memory (MB)' } }
              }
            }
          });
        </script>
      </body>
      </html>
    `
  }

  static compareWithBaseline(): { regressions: any[], improvements: any[] } {
    const regressions = []
    const improvements = []

    for (const metric of this.metrics) {
      const baselineMetric = this.baseline.find(b => b.testName === metric.testName)
      
      if (baselineMetric) {
        const durationDiff = metric.duration - baselineMetric.duration
        const memoryDiff = metric.memoryUsage.heapUsed - baselineMetric.memoryUsage.heapUsed
        
        if (durationDiff > baselineMetric.duration * 0.2) { // 20% slower
          regressions.push({
            testName: metric.testName,
            type: 'performance',
            oldValue: baselineMetric.duration,
            newValue: metric.duration,
            change: `+${Math.round((durationDiff / baselineMetric.duration) * 100)}%`
          })
        }
        
        if (memoryDiff > baselineMetric.memoryUsage.heapUsed * 0.3) { // 30% more memory
          regressions.push({
            testName: metric.testName,
            type: 'memory',
            oldValue: Math.round(baselineMetric.memoryUsage.heapUsed / 1024 / 1024),
            newValue: Math.round(metric.memoryUsage.heapUsed / 1024 / 1024),
            change: `+${Math.round((memoryDiff / baselineMetric.memoryUsage.heapUsed) * 100)}%`
          })
        }

        if (durationDiff < -baselineMetric.duration * 0.1) { // 10% faster
          improvements.push({
            testName: metric.testName,
            type: 'performance',
            change: `${Math.round((durationDiff / baselineMetric.duration) * 100)}%`
          })
        }
      }
    }

    return { regressions, improvements }
  }

  static generateMarkdownReport(): string {
    const { regressions, improvements } = this.compareWithBaseline()
    const successRate = this.metrics.filter(m => m.success).length / this.metrics.length * 100
    const failedTests = this.metrics.filter(m => !m.success)

    return `
# 🧪 VetSidekick Test Report

## 📊 Summary
- **Success Rate**: ${successRate.toFixed(1)}% (${this.metrics.filter(m => m.success).length}/${this.metrics.length})
- **Total Duration**: ${Math.round(this.metrics.reduce((sum, m) => sum + m.duration, 0) / 1000)}s
- **Peak Memory Usage**: ${Math.round(Math.max(...this.metrics.map(m => m.memoryUsage.heapUsed)) / 1024 / 1024)}MB

## ⚠️ Performance Regressions
${regressions.length === 0 ? '✅ No regressions detected!' : regressions.map(r => 
  `- **${r.testName}** (${r.type}): ${r.oldValue} → ${r.newValue} (${r.change})`
).join('\n')}

## 🚀 Performance Improvements
${improvements.length === 0 ? 'No significant improvements detected.' : improvements.map(i => 
  `- **${i.testName}** (${i.type}): ${i.change} faster`
).join('\n')}

## ❌ Failed Tests
${failedTests.length === 0 ? '✅ All tests passed!' : failedTests.map(t => 
  `- **${t.testName}**: ${t.errorMessage || 'Unknown error'}`
).join('\n')}

---
*Report generated on ${new Date().toISOString()}*
`
  }

  static saveBaseline(path: string) {
    require('fs').writeFileSync(path, JSON.stringify(this.metrics, null, 2))
  }
}

// Integration with Jest
export function withMetrics<T extends any[]>(
  testName: string, 
  category: string, 
  testFn: (...args: T) => Promise<void>
) {
  return async (...args: T) => {
    const startTime = Date.now()
    const startMemory = process.memoryUsage()
    let success = true
    let errorMessage: string | undefined

    try {
      await testFn(...args)
    } catch (error) {
      success = false
      errorMessage = (error as Error).message
      throw error
    } finally {
      const endTime = Date.now()
      const endMemory = process.memoryUsage()

      TestReporter.recordMetric({
        testName,
        category,
        duration: endTime - startTime,
        memoryUsage: {
          rss: endMemory.rss - startMemory.rss,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          external: endMemory.external - startMemory.external,
          arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
        },
        success,
        errorMessage,
        timestamp: new Date(),
        environmentInfo: {
          nodeVersion: process.version,
          platform: process.platform,
          cpuCount: require('os').cpus().length,
          totalMemory: require('os').totalmem()
        }
      })
    }
  }
}

// Usage example
describe('Performance Monitored Tests', () => {
  it('payment processing with metrics', withMetrics(
    'Payment Processing Performance',
    'integration',
    async () => {
      const session = await paymentService.createCheckoutSession(/* params */)
      expect(session.id).toMatch(/^cs_test_/)
    }
  ))
})
```

#### 8.6 Environment-Specific Test Configuration
**File:** `__tests__/config/environmentManager.ts`

```javascript
export interface EnvironmentConfig {
  name: string
  description: string
  database: {
    url: string
    serviceRoleKey: string
    maxConnections: number
  }
  services: {
    stripe: {
      secretKey: string
      webhookSecret: string
      testMode: boolean
    }
    email: {
      apiKey: string
      provider: 'sendgrid' | 'postmark' | 'ses'
      testMode: boolean
    }
    analytics: {
      apiKey: string
      enabled: boolean
    }
  }
  features: {
    realPayments: boolean
    realEmails: boolean
    externalIntegrations: boolean
    performanceMonitoring: boolean
  }
  timeouts: {
    api: number
    database: number
    external: number
  }
}

export const environments: Record<string, EnvironmentConfig> = {
  local: {
    name: 'local',
    description: 'Local development testing',
    database: {
      url: process.env.TEST_SUPABASE_URL || 'http://localhost:54321',
      serviceRoleKey: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || '',
      maxConnections: 10
    },
    services: {
      stripe: {
        secretKey: process.env.STRIPE_TEST_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_TEST_WEBHOOK_SECRET || '',
        testMode: true
      },
      email: {
        apiKey: process.env.EMAIL_TEST_API_KEY || '',
        provider: 'sendgrid',
        testMode: true
      },
      analytics: {
        apiKey: '',
        enabled: false
      }
    },
    features: {
      realPayments: true,
      realEmails: false, // Use email capture locally
      externalIntegrations: false,
      performanceMonitoring: true
    },
    timeouts: {
      api: 10000,
      database: 5000,
      external: 15000
    }
  },

  ci: {
    name: 'ci',
    description: 'Continuous Integration testing',
    database: {
      url: process.env.CI_SUPABASE_URL || '',
      serviceRoleKey: process.env.CI_SUPABASE_SERVICE_ROLE_KEY || '',
      maxConnections: 20
    },
    services: {
      stripe: {
        secretKey: process.env.STRIPE_TEST_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_TEST_WEBHOOK_SECRET || '',
        testMode: true
      },
      email: {
        apiKey: process.env.EMAIL_TEST_API_KEY || '',
        provider: 'sendgrid',
        testMode: true
      },
      analytics: {
        apiKey: process.env.ANALYTICS_TEST_API_KEY || '',
        enabled: true
      }
    },
    features: {
      realPayments: true,
      realEmails: true,
      externalIntegrations: true,
      performanceMonitoring: true
    },
    timeouts: {
      api: 20000,
      database: 10000,
      external: 30000
    }
  },

  staging: {
    name: 'staging',
    description: 'Staging environment integration tests',
    database: {
      url: process.env.STAGING_SUPABASE_URL || '',
      serviceRoleKey: process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY || '',
      maxConnections: 30
    },
    services: {
      stripe: {
        secretKey: process.env.STRIPE_TEST_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_TEST_WEBHOOK_SECRET || '',
        testMode: true
      },
      email: {
        apiKey: process.env.EMAIL_STAGING_API_KEY || '',
        provider: 'sendgrid',
        testMode: false
      },
      analytics: {
        apiKey: process.env.ANALYTICS_STAGING_API_KEY || '',
        enabled: true
      }
    },
    features: {
      realPayments: true,
      realEmails: true,
      externalIntegrations: true,
      performanceMonitoring: true
    },
    timeouts: {
      api: 30000,
      database: 15000,
      external: 45000
    }
  },

  production: {
    name: 'production',
    description: 'Production smoke tests (read-only)',
    database: {
      url: process.env.PROD_SUPABASE_URL || '',
      serviceRoleKey: process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || '',
      maxConnections: 5
    },
    services: {
      stripe: {
        secretKey: '', // No write operations in production
        webhookSecret: '',
        testMode: false
      },
      email: {
        apiKey: '',
        provider: 'sendgrid',
        testMode: false
      },
      analytics: {
        apiKey: process.env.ANALYTICS_PROD_API_KEY || '',
        enabled: false // No test events in production analytics
      }
    },
    features: {
      realPayments: false, // Read-only smoke tests
      realEmails: false,
      externalIntegrations: false,
      performanceMonitoring: false
    },
    timeouts: {
      api: 10000,
      database: 5000,
      external: 15000
    }
  }
}

export class EnvironmentManager {
  private static currentEnv: EnvironmentConfig

  static initialize(environmentName: string = 'local') {
    const env = environments[environmentName]
    if (!env) {
      throw new Error(`Unknown environment: ${environmentName}. Available: ${Object.keys(environments).join(', ')}`)
    }

    this.currentEnv = env
    this.validateEnvironment()
    
    console.log(`🌍 Test environment initialized: ${env.name} - ${env.description}`)
  }

  static get current(): EnvironmentConfig {
    if (!this.currentEnv) {
      this.initialize() // Default to local
    }
    return this.currentEnv
  }

  private static validateEnvironment() {
    const env = this.currentEnv
    const requiredVars: Array<[string, any]> = [
      ['Database URL', env.database.url],
      ['Database Service Role Key', env.database.serviceRoleKey]
    ]

    if (env.features.realPayments) {
      requiredVars.push(['Stripe Secret Key', env.services.stripe.secretKey])
    }

    if (env.features.realEmails) {
      requiredVars.push(['Email API Key', env.services.email.apiKey])
    }

    const missingVars = requiredVars.filter(([_, value]) => !value)
    
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables for ${env.name}:\n` +
        missingVars.map(([name]) => `- ${name}`).join('\n')
      )
    }
  }

  static shouldSkipTest(requiredFeatures: (keyof EnvironmentConfig['features'])[]): boolean {
    const env = this.current
    return requiredFeatures.some(feature => !env.features[feature])
  }

  static conditionalTest(
    requiredFeatures: (keyof EnvironmentConfig['features'])[],
    testName: string,
    testFn: () => void
  ) {
    if (this.shouldSkipTest(requiredFeatures)) {
      describe.skip(`${testName} (skipped: missing features ${requiredFeatures.join(', ')})`, testFn)
    } else {
      describe(testName, testFn)
    }
  }
}

// Usage examples
describe('Environment-aware tests', () => {
  beforeAll(() => {
    EnvironmentManager.initialize(process.env.TEST_ENV || 'local')
  })

  EnvironmentManager.conditionalTest(
    ['realPayments'],
    'Real Stripe Integration Tests',
    () => {
      it('creates real checkout sessions', async () => {
        // This test only runs if realPayments feature is enabled
      })
    }
  )

  EnvironmentManager.conditionalTest(
    ['realEmails', 'externalIntegrations'],
    'Email Integration Tests',
    () => {
      it('sends real emails', async () => {
        // This test only runs if both features are enabled
      })
    }
  )
})
```

## Implementation Roadmap Enhancement

### Phase 1: Foundation (Weeks 1-2)
1. **Environment Setup**
   - Implement environment configuration system
   - Set up test data versioning
   - Create retry logic utilities
   - Configure CI/CD pipeline

### Phase 2: Core Integration (Weeks 3-6)  
1. **Database & Services**
   - Implement real database testing
   - Add Stripe integration testing
   - Set up authentication testing
   - Create file upload testing

### Phase 3: Advanced Features (Weeks 7-10)
1. **Performance & Reliability**
   - Add performance monitoring
   - Implement flaky test handling
   - Create load testing suite
   - Add security testing

### Phase 4: Reporting & Analytics (Weeks 11-12)
1. **Test Intelligence**
   - Implement comprehensive reporting
   - Set up performance baselines
   - Create regression detection
   - Add test analytics dashboard

This enhanced plan provides a production-ready testing infrastructure that will give you genuine confidence in your application's behavior across all environments and use cases