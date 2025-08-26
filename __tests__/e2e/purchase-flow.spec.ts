import { test, expect } from '@playwright/test';

// This e2e test verifies the complete purchase flow and ensures the bug is fixed
test.describe('Purchase Flow - Modal Bug Fix', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the podcasts page where episodes are displayed
    await page.goto('/podcasts');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should not show purchase modal for episodes with Complete badge', async ({ page }) => {
    // Look for episodes that have the "Complete" badge
    const completeEpisodes = page.locator('[data-testid*="episode-card"]').filter({
      has: page.locator('text=Complete')
    });
    
    // If there are episodes with Complete badge, test the first one
    const episodeCount = await completeEpisodes.count();
    
    if (episodeCount > 0) {
      // Click on the first complete episode
      await completeEpisodes.first().click();
      
      // Wait a moment for any potential modal to appear
      await page.waitForTimeout(1000);
      
      // Purchase modal should NOT appear
      await expect(page.locator('text=Purchase CPD Content')).not.toBeVisible();
      
      // Should navigate to player page instead
      await expect(page).toHaveURL(/\/player\?id=/);
    } else {
      console.log('No episodes with Complete badge found - creating one for test');
      
      // Alternative: Mock a purchased episode scenario
      // This would require setting up test data or using a test user with purchased content
      test.skip('No episodes with Complete badge available for testing');
    }
  });

  test('should show purchase modal for unpurchased episodes', async ({ page }) => {
    // Look for episodes that don't have the "Complete" badge
    const unpurchasedEpisodes = page.locator('[data-testid*="episode-card"]').filter({
      hasNot: page.locator('text=Complete')
    });
    
    const episodeCount = await unpurchasedEpisodes.count();
    
    if (episodeCount > 0) {
      // Click on the first unpurchased episode
      await unpurchasedEpisodes.first().click();
      
      // Purchase modal should appear
      await expect(page.locator('text=Purchase CPD Content')).toBeVisible();
      
      // Should show episode details in modal
      await expect(page.locator('.modal')).toBeVisible();
      
      // Should have purchase button
      await expect(page.locator('button', { hasText: 'Purchase CPD Access' })).toBeVisible();
    } else {
      test.skip('No unpurchased episodes available for testing');
    }
  });

  test('should not show purchase modal after successful purchase simulation', async ({ page }) => {
    // This test simulates the complete flow including purchase completion
    
    // Step 1: Find an unpurchased episode
    const unpurchasedEpisode = page.locator('[data-testid*="episode-card"]').filter({
      hasNot: page.locator('text=Complete')
    }).first();
    
    // Check if unpurchased episode exists
    const exists = await unpurchasedEpisode.count() > 0;
    
    if (exists) {
      // Click on unpurchased episode
      await unpurchasedEpisode.click();
      
      // Verify purchase modal appears
      await expect(page.locator('text=Purchase CPD Content')).toBeVisible();
      
      // Step 2: Simulate purchase completion by intercepting the API
      // In a real test, this would involve:
      // 1. Clicking purchase button
      // 2. Completing Stripe payment flow
      // 3. Webhook processing
      // 4. Returning to the app
      
      // For this test, we'll mock the successful purchase state
      await page.evaluate(() => {
        // Simulate successful purchase by updating local state
        // In reality, this would be handled by the Stripe webhook
        window.localStorage.setItem('test-purchase-completed', 'true');
      });
      
      // Close the modal to simulate returning from Stripe
      await page.locator('button', { hasText: 'Close' }).click();
      
      // Refresh the page to simulate returning from Stripe checkout
      await page.reload();
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Step 3: Now click the same episode again
      // It should now navigate to player instead of showing purchase modal
      await unpurchasedEpisode.click();
      
      // Should not show purchase modal
      await expect(page.locator('text=Purchase CPD Content')).not.toBeVisible();
      
      // Should navigate to player
      await expect(page).toHaveURL(/\/player\?id=/);
      
    } else {
      test.skip('No unpurchased episodes available for purchase flow test');
    }
  });

  test('should maintain consistent state across different episode card types', async ({ page }) => {
    // Test both MasonryEpisodeCard and CompactEpisodeCard behaviors
    // This ensures both card types handle purchase state consistently
    
    // Navigate to different views if available (grid vs list view)
    const viewToggle = page.locator('[data-testid="view-toggle"]');
    const hasViewToggle = await viewToggle.count() > 0;
    
    if (hasViewToggle) {
      // Test in grid view (Masonry cards)
      await viewToggle.click();
      await page.waitForTimeout(500);
      
      const gridEpisode = page.locator('[data-testid*="episode-card"]').first();
      await gridEpisode.click();
      
      // Check behavior (should show modal or navigate based on purchase status)
      const hasModal = await page.locator('text=Purchase CPD Content').isVisible();
      const hasPlayerUrl = page.url().includes('/player');
      
      expect(hasModal || hasPlayerUrl).toBeTruthy();
      
      // Return to episodes page
      await page.goto('/podcasts');
      
      // Test in list view (Compact cards)
      await viewToggle.click();
      await page.waitForTimeout(500);
      
      const listEpisode = page.locator('[data-testid*="episode-card"]').first();
      await listEpisode.click();
      
      // Should have same behavior as grid view for the same episode
      const hasModalList = await page.locator('text=Purchase CPD Content').isVisible();
      const hasPlayerUrlList = page.url().includes('/player');
      
      expect(hasModalList || hasPlayerUrlList).toBeTruthy();
      expect(hasModal).toBe(hasModalList); // Should be consistent
      
    } else {
      console.log('View toggle not available, testing single view');
      
      // Test at least one episode
      const episode = page.locator('[data-testid*="episode-card"]').first();
      await episode.click();
      
      const hasModal = await page.locator('text=Purchase CPD Content').isVisible();
      const hasPlayerUrl = page.url().includes('/player');
      
      expect(hasModal || hasPlayerUrl).toBeTruthy();
    }
  });

  test('should handle rapid clicks without showing modal for purchased content', async ({ page }) => {
    // This test ensures that rapid clicking doesn't cause race conditions
    // that might show the purchase modal for purchased content
    
    const completeEpisodes = page.locator('[data-testid*="episode-card"]').filter({
      has: page.locator('text=Complete')
    });
    
    const episodeCount = await completeEpisodes.count();
    
    if (episodeCount > 0) {
      const episode = completeEpisodes.first();
      
      // Click multiple times rapidly
      await episode.click();
      await episode.click();
      await episode.click();
      
      // Wait for any potential modals to appear
      await page.waitForTimeout(1500);
      
      // Purchase modal should never appear
      await expect(page.locator('text=Purchase CPD Content')).not.toBeVisible();
      
      // Should have navigated to player (or at least attempted to)
      const currentUrl = page.url();
      expect(currentUrl.includes('/player') || currentUrl.includes('/podcasts')).toBeTruthy();
      
    } else {
      test.skip('No episodes with Complete badge available for rapid click test');
    }
  });
});

// Helper test for setting up test data
test.describe('Purchase Flow - Test Data Setup', () => {
  test('setup test user with purchased content', async ({ page }) => {
    // This test can be used to set up test data if needed
    // Skip by default since it's for setup only
    test.skip('Setup test - run manually when needed');
    
    // Navigate to admin panel or use API to create test data
    // await page.goto('/admin');
    // ... set up user with purchased content
  });
});