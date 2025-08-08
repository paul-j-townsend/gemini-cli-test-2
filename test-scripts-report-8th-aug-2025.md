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
    const event = this.stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { id: sessionId } }
      }),
      secret: process.env.STRIPE_WEBHOOK_SECRET!
    })
    
    return event
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
      const webhookEvent = await testStripe.simulateWebhook(session.id)
      
      // Process webhook - should update real database
      const result = await paymentService.processWebhook(
        JSON.stringify(webhookEvent.payload),
        webhookEvent.signature
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

## Implementation Strategy

### Step 1: Environment Setup
1. **Create Test Database Instance**
   - Set up dedicated Supabase test project
   - Configure test-specific environment variables
   - Implement database seeding scripts

2. **Configure Stripe Test Mode**
   - Set up Stripe test webhooks
   - Create test products and prices
   - Configure webhook endpoints for testing

3. **Test Data Management**
   - Create comprehensive test data fixtures
   - Implement cleanup utilities
   - Design test data that covers edge cases

### Step 2: Gradual Migration
1. **Start with Service Layer**
   - Rewrite payment service tests first
   - Then authentication service tests
   - Finally database service tests

2. **Move to API Layer**
   - Test actual Next.js API routes
   - Validate middleware and error handling
   - Test request/response validation

3. **Component Integration**
   - Replace mock components with real ones
   - Test with real context providers
   - Validate user interactions

4. **E2E Enhancement**
   - Implement real browser automation
   - Test actual user workflows
   - Validate cross-browser compatibility

### Step 3: Test Isolation Strategy
```javascript
// New: __tests__/utils/testIsolation.ts
export class TestIsolation {
  private static testRunId: string
  
  static generateTestRunId() {
    this.testRunId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return this.testRunId
  }
  
  static createTestUser(baseEmail: string) {
    return `${this.testRunId}-${baseEmail}`
  }
  
  static createTestId(prefix: string) {
    return `${prefix}-${this.testRunId}`
  }
  
  static async cleanupTestData(supabase: SupabaseClient) {
    // Clean up all data with current test run ID
    await supabase.from('vsk_users')
      .delete()
      .like('email', `%${this.testRunId}%`)
      
    await supabase.from('vsk_content')
      .delete()
      .like('id', `%${this.testRunId}%`)
      
    // ... cleanup other tables
  }
}
```

## Performance Considerations

### Database Performance
- Use test database with realistic data volumes
- Implement proper indexing for test queries
- Monitor query performance during tests

### Test Execution Speed
- Implement test data caching where appropriate
- Use database transactions for faster cleanup
- Parallelize independent test suites

### Resource Management
- Implement proper cleanup to prevent resource leaks
- Use connection pooling for database tests
- Manage Stripe API rate limits during testing

## Risk Mitigation

### Test Data Isolation
- Ensure tests don't interfere with each other
- Implement robust cleanup mechanisms
- Use unique identifiers for all test data

### External Service Dependencies
- Implement circuit breakers for external services
- Have fallback strategies for service outages
- Monitor external service usage and costs

### Security Considerations
- Never use production API keys in tests
- Implement proper secret management
- Validate that test data doesn't expose sensitive information

## Success Metrics

### Coverage Improvements
- **Database Operations:** 95% coverage of real query patterns
- **API Endpoints:** 100% coverage of request/response validation
- **Payment Flows:** Complete end-to-end transaction testing
- **Authentication:** Full OAuth and session management testing

### Quality Improvements
- **Bug Detection:** Ability to catch real-world integration issues
- **Performance:** Identify actual database and API performance problems
- **Security:** Validate real security policies and access controls
- **User Experience:** Test actual user workflows and edge cases

## Conclusion

The current mock-heavy test suite provides limited confidence in real-world system behavior. By implementing this comprehensive rewrite strategy, VetSidekick will achieve:

1. **Higher Test Fidelity:** Tests that reflect actual system behavior
2. **Better Bug Detection:** Ability to catch integration issues before production
3. **Performance Validation:** Real-world performance testing
4. **Security Assurance:** Validation of actual security policies and access controls
5. **User Experience Confidence:** Testing of complete user workflows

The phased approach ensures minimal disruption to development while gradually building a robust, real-world testing infrastructure that provides genuine confidence in system reliability and user experience.

## Next Steps

1. **Immediate (Week 1):** Set up test database and Stripe test environment
2. **Short-term (Weeks 2-4):** Implement service layer integration tests
3. **Medium-term (Weeks 5-8):** Rewrite API and component tests
4. **Long-term (Weeks 9-12):** Enhance E2E tests and implement performance monitoring

This comprehensive approach will transform the VetSidekick test suite from a collection of isolated unit tests into a robust, real-world validation system that provides genuine confidence in system reliability and user experience.