// E2E Test Suite for Critical User Journeys
// Using Playwright for end-to-end testing

import { test, expect, Page } from '@playwright/test'

// Test data
const TEST_USER = {
  email: 'test@example.com',
  name: 'Test User'
}

const TEST_CONTENT = {
  id: 'content-test-1',
  title: 'Test Veterinary Content',
  price: '£19.99'
}

class VetSidekickApp {
  constructor(public page: Page) {}

  async navigateToHome() {
    await this.page.goto('/')
    await expect(this.page).toHaveTitle(/VetSidekick/)
  }

  async clickLogin() {
    await this.page.click('[data-testid="login-button"]')
  }

  async simulateGoogleOAuth() {
    // In a real test, this would go through actual OAuth flow
    // For testing, we can mock the OAuth callback
    await this.page.goto('/auth/callback?access_token=mock_token&user_id=test_user')
  }

  async navigateToPodcasts() {
    await this.page.click('text=Podcasts')
    await expect(this.page).toHaveURL(/.*podcasts/)
  }

  async selectContent(title: string) {
    await this.page.click(`text=${title}`)
  }

  async openPurchaseModal() {
    await this.page.click('[data-testid="purchase-button"]')
    await expect(this.page.locator('[data-testid="purchase-modal"]')).toBeVisible()
  }

  async completePurchase() {
    await this.page.click('[data-testid="purchase-now-button"]')
    // In real tests, this would go through Stripe checkout
    // For testing, we can simulate successful payment
    await this.page.waitForURL(/.*success/)
  }

  async playAudio() {
    await this.page.click('[data-testid="play-button"]')
    await expect(this.page.locator('[data-testid="audio-player"]')).toHaveClass(/playing/)
  }

  async takeQuiz() {
    await this.page.click('[data-testid="start-quiz-button"]')
    await expect(this.page.locator('[data-testid="quiz-container"]')).toBeVisible()
  }

  async answerQuizQuestion(answerIndex: number) {
    await this.page.click(`[data-testid="quiz-answer-${answerIndex}"]`)
  }

  async submitQuiz() {
    await this.page.click('[data-testid="submit-quiz-button"]')
    await expect(this.page.locator('[data-testid="quiz-results"]')).toBeVisible()
  }

  async checkMyProgress() {
    await this.page.click('[data-testid="my-stuff-dropdown"]')
    await this.page.click('text=My Progress')
    await expect(this.page).toHaveURL(/.*my-progress/)
  }
}

test.describe('Journey A: New User Registration & First Purchase', () => {
  test.describe.configure({ mode: 'serial' })

  test('JA1-001 to JA4-007: Complete new user journey', async ({ page }) => {
    const app = new VetSidekickApp(page)

    // JA1: Authentication Flow
    test.step('User authentication via Google OAuth', async () => {
      await app.navigateToHome()
      await app.clickLogin()
      await app.simulateGoogleOAuth()
      
      // Verify user is logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    })

    // JA2: Content Discovery
    test.step('Browse and discover content', async () => {
      await app.navigateToPodcasts()
      
      // Verify content is displayed
      await expect(page.locator('[data-testid="content-card"]').first()).toBeVisible()
      
      // Select content
      await app.selectContent(TEST_CONTENT.title)
      
      // Verify paywall is shown
      await expect(page.locator('[data-testid="paywall"]')).toBeVisible()
    })

    // JA3: Purchase Flow
    test.step('Complete purchase process', async () => {
      await app.openPurchaseModal()
      
      // Verify pricing information
      await expect(page.locator('text=' + TEST_CONTENT.price)).toBeVisible()
      
      // Complete purchase
      await app.completePurchase()
      
      // Verify purchase success
      await expect(page.locator('text=Purchase Successful')).toBeVisible()
    })

    // JA4: Learning Experience
    test.step('Complete learning experience', async () => {
      // Play audio content
      await app.playAudio()
      
      // Fast-forward to end (in real test, might wait for actual audio)
      await page.evaluate(() => {
        const audio = document.querySelector('audio') as HTMLAudioElement
        if (audio) {
          audio.currentTime = audio.duration
        }
      })
      
      // Take quiz
      await app.takeQuiz()
      
      // Answer questions (assuming first answer is correct)
      await app.answerQuizQuestion(0)
      await app.submitQuiz()
      
      // Verify quiz completion
      await expect(page.locator('text=Quiz Completed')).toBeVisible()
      await expect(page.locator('[data-testid="certificate-download"]')).toBeVisible()
    })
  })

  test('JA3-005: Webhook processing and access grant', async ({ page }) => {
    // This test would verify the webhook processing
    // In a real scenario, we'd trigger a Stripe webhook and verify access is granted
    
    const app = new VetSidekickApp(page)
    await app.navigateToHome()
    
    // Mock webhook processing by directly calling API
    const response = await page.request.post('/api/webhooks/stripe', {
      data: {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: {
              userId: 'test-user',
              contentId: TEST_CONTENT.id
            }
          }
        }
      },
      headers: {
        'stripe-signature': 'mock-signature'
      }
    })
    
    expect(response.status()).toBe(200)
  })
})

test.describe('Journey B: Returning User Learning Session', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated user with existing purchases
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'returning-user', email: 'returning@example.com' }
      }))
    })
  })

  test('JB1-001 to JB1-004: Session restoration and validation', async ({ page }) => {
    const app = new VetSidekickApp(page)
    
    await app.navigateToHome()
    
    // Verify user session is restored
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    
    // Verify user has access to purchased content
    await app.navigateToPodcasts()
    await app.selectContent(TEST_CONTENT.title)
    
    // Should not see paywall
    await expect(page.locator('[data-testid="paywall"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="audio-player"]')).toBeVisible()
  })

  test('JB2-002: Resume incomplete quizzes', async ({ page }) => {
    const app = new VetSidekickApp(page)
    
    await app.navigateToHome()
    await app.navigateToPodcasts()
    await app.selectContent(TEST_CONTENT.title)
    
    // Should show resume quiz option
    await expect(page.locator('text=Resume Quiz')).toBeVisible()
    
    await page.click('text=Resume Quiz')
    
    // Should continue from where left off
    await expect(page.locator('[data-testid="quiz-progress"]')).toContainText('Question 2 of 5')
  })

  test('JB3-004: Progress statistics updates', async ({ page }) => {
    const app = new VetSidekickApp(page)
    
    await app.checkMyProgress()
    
    // Verify progress statistics are displayed
    await expect(page.locator('[data-testid="cpd-hours"]')).toBeVisible()
    await expect(page.locator('[data-testid="courses-completed"]')).toBeVisible()
    await expect(page.locator('[data-testid="average-score"]')).toBeVisible()
  })
})

test.describe('Journey C: Admin Content Management', () => {
  test.beforeEach(async ({ page }) => {
    // Set up admin user
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-admin-token',
        user: { 
          id: 'admin-user', 
          email: 'admin@example.com',
          user_metadata: { role: 'admin' }
        }
      }))
    })
  })

  test('JC1-001 to JC1-003: Admin authentication and access', async ({ page }) => {
    await page.goto('/admin')
    
    // Verify admin dashboard is accessible
    await expect(page.locator('text=Admin Dashboard')).toBeVisible()
    await expect(page.locator('[data-testid="admin-tabs"]')).toBeVisible()
  })

  test('JC2-001 to JC2-003: Content creation and management', async ({ page }) => {
    await page.goto('/admin')
    
    // Navigate to content management
    await page.click('text=Content')
    
    // Create new content
    await page.click('[data-testid="create-content-button"]')
    
    await page.fill('[data-testid="content-title"]', 'New Test Content')
    await page.fill('[data-testid="content-description"]', 'Test description')
    await page.fill('[data-testid="content-price"]', '2999')
    
    await page.click('[data-testid="save-content-button"]')
    
    // Verify content was created
    await expect(page.locator('text=Content saved successfully')).toBeVisible()
    await expect(page.locator('text=New Test Content')).toBeVisible()
  })

  test('JC3-001: User progress monitoring', async ({ page }) => {
    await page.goto('/admin')
    
    // Navigate to user progress
    await page.click('text=Progress')
    
    // Verify user progress data is displayed
    await expect(page.locator('[data-testid="user-progress-table"]')).toBeVisible()
    await expect(page.locator('[data-testid="progress-filters"]')).toBeVisible()
    
    // Test filtering
    await page.fill('[data-testid="user-search"]', 'test@example.com')
    await page.press('[data-testid="user-search"]', 'Enter')
    
    await expect(page.locator('text=test@example.com')).toBeVisible()
  })
})

test.describe('Mobile User Experience', () => {
  test.use({ 
    viewport: { width: 375, height: 667 } // iPhone SE
  })

  test('MOB-001 to MOB-010: Mobile navigation and interactions', async ({ page }) => {
    const app = new VetSidekickApp(page)
    
    await app.navigateToHome()
    
    // Test mobile menu
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    
    // Test navigation
    await page.click('text=Podcasts')
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible()
    
    // Test touch interactions
    await page.locator('[data-testid="content-card"]').first().tap()
    await expect(page.locator('[data-testid="content-details"]')).toBeVisible()
  })

  test('MOB-011 to MOB-013: Audio player touch controls', async ({ page }) => {
    await page.goto('/podcasts/test-content')
    
    // Test touch controls
    await page.locator('[data-testid="play-button"]').tap()
    await expect(page.locator('[data-testid="audio-player"]')).toHaveClass(/playing/)
    
    // Test scrubbing
    const progressBar = page.locator('[data-testid="progress-bar"]')
    const bbox = await progressBar.boundingBox()
    
    if (bbox) {
      await page.touchscreen.tap(bbox.x + bbox.width * 0.5, bbox.y + bbox.height * 0.5)
      // Verify playback position changed
      await expect(page.locator('[data-testid="current-time"]')).not.toContainText('00:00')
    }
  })
})

test.describe('Error Scenarios & Edge Cases', () => {
  test('ERR-001: Network failure during checkout', async ({ page }) => {
    // Simulate network failure
    await page.route('/api/payments/checkout', route => {
      route.abort('failed')
    })

    const app = new VetSidekickApp(page)
    await app.navigateToHome()
    await app.navigateToPodcasts()
    await app.selectContent(TEST_CONTENT.title)
    await app.openPurchaseModal()
    
    await page.click('[data-testid="purchase-now-button"]')
    
    // Verify error handling
    await expect(page.locator('text=Network error')).toBeVisible()
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('ERR-012: Browser refresh during quiz handling', async ({ page }) => {
    await page.goto('/quiz/test-quiz-1')
    
    // Start quiz and answer first question
    await page.click('[data-testid="quiz-answer-0"]')
    
    // Refresh page
    await page.reload()
    
    // Should restore quiz state
    await expect(page.locator('text=Resume Quiz')).toBeVisible()
    
    await page.click('text=Resume Quiz')
    
    // Should continue from current question
    await expect(page.locator('[data-testid="quiz-question"]')).toBeVisible()
  })

  test('ERR-028: File upload corruption', async ({ page }) => {
    await page.goto('/admin')
    await page.click('text=Content')
    
    // Simulate corrupt file upload
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'corrupt.mp3',
      mimeType: 'audio/mp3',
      buffer: Buffer.from('corrupt data')
    })
    
    // Should show error message
    await expect(page.locator('text=File upload failed')).toBeVisible()
    await expect(page.locator('text=Please try again')).toBeVisible()
  })
})

test.describe('Performance Tests', () => {
  test('PERF-001: Page load time < 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000)
  })

  test('PERF-002: Audio streaming startup < 2 seconds', async ({ page }) => {
    await page.goto('/podcasts/test-content')
    
    const startTime = Date.now()
    await page.click('[data-testid="play-button"]')
    
    // Wait for audio to start playing
    await page.waitForFunction(() => {
      const audio = document.querySelector('audio') as HTMLAudioElement
      return audio && !audio.paused
    })
    
    const startupTime = Date.now() - startTime
    expect(startupTime).toBeLessThan(2000)
  })
})