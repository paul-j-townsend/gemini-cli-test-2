import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';
import { ContentPurchase, Subscription, Content } from '@/types/database';

export class AccessControlService {

  // Check if user has full CPD access to specific content
  async hasFullCPDAccess(userId: string, contentId: string): Promise<boolean> {
    try {
      // Check if user has an active subscription (grants access to all content)
      const hasSubscription = await this.hasActiveSubscription(userId);
      if (hasSubscription) {
        return true;
      }

      // Check if user has purchased this specific content
      const hasPurchase = await this.hasContentPurchase(userId, contentId);
      if (hasPurchase) {
        return true;
      }

      // Check if content is free (price_cents is null or 0)
      const { data: content } = await supabaseAdmin
        .from('vsk_content')
        .select('price_cents, is_purchasable')
        .eq('id', contentId)
        .single();

      if (content && (!content.price_cents || content.price_cents === 0 || !content.is_purchasable)) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking CPD access:', error);
      return false;
    }
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('vsk_subscriptions')
        .select('id, status, current_period_end')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .single();

      if (error || !data) {
        return false;
      }

      // Check if subscription is still within current period
      const now = new Date();
      const periodEnd = new Date(data.current_period_end);
      
      return periodEnd > now;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  // Check if user has purchased specific content
  async hasContentPurchase(userId: string, contentId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('vsk_content_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .eq('status', 'completed')
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking content purchase:', error);
      return false;
    }
  }

  // Get all content IDs that user has access to
  async getUserAccessibleContent(userId: string): Promise<string[]> {
    try {
      const accessibleContentIds: string[] = [];

      // If user has active subscription, they have access to all purchasable content
      const hasSubscription = await this.hasActiveSubscription(userId);
      if (hasSubscription) {
        const { data: allContent } = await supabaseAdmin
          .from('vsk_content')
          .select('id')
          .eq('is_published', true);
        
        return allContent?.map(c => c.id) || [];
      }

      // Get purchased content
      const { data: purchases } = await supabaseAdmin
        .from('vsk_content_purchases')
        .select('content_id')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (purchases) {
        accessibleContentIds.push(...purchases.map(p => p.content_id));
      }

      // Get free content (price_cents is null/0 or not purchasable)
      const { data: freeContent } = await supabaseAdmin
        .from('vsk_content')
        .select('id')
        .eq('is_published', true)
        .or('price_cents.is.null,price_cents.eq.0,is_purchasable.eq.false');

      if (freeContent) {
        accessibleContentIds.push(...freeContent.map(c => c.id));
      }

      // Remove duplicates
      return [...new Set(accessibleContentIds)];
    } catch (error) {
      console.error('Error getting accessible content:', error);
      return [];
    }
  }

  // Get user's payment summary
  async getUserPaymentSummary(userId: string): Promise<{
    totalPurchases: number;
    totalSpent: number;
    hasActiveSubscription: boolean;
    subscriptionStatus: string | null;
    purchasedContentIds: string[];
  }> {
    try {
      // Get purchases
      const { data: purchases } = await supabaseAdmin
        .from('vsk_content_purchases')
        .select('content_id, amount_paid_cents')
        .eq('user_id', userId)
        .eq('status', 'completed');

      // Get subscription
      const { data: subscription } = await supabaseAdmin
        .from('vsk_subscriptions')
        .select('status')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .single();

      const totalPurchases = purchases?.length || 0;
      const totalSpent = purchases?.reduce((sum, p) => sum + p.amount_paid_cents, 0) || 0;
      const purchasedContentIds = purchases?.map(p => p.content_id) || [];
      const hasActiveSubscription = !!subscription;
      const subscriptionStatus = subscription?.status || null;

      return {
        totalPurchases,
        totalSpent,
        hasActiveSubscription,
        subscriptionStatus,
        purchasedContentIds,
      };
    } catch (error) {
      console.error('Error getting payment summary:', error);
      return {
        totalPurchases: 0,
        totalSpent: 0,
        hasActiveSubscription: false,
        subscriptionStatus: null,
        purchasedContentIds: [],
      };
    }
  }

  // Client-side version - for development, assume access is granted if user is authenticated
  async hasFullCPDAccessClient(userId: string, contentId: string): Promise<boolean> {
    // In development, only grant access for specific scenarios to avoid showing "Owned" everywhere
    // Check if we're on the player page by looking at the current URL
    if (typeof window !== 'undefined' && window.location.pathname === '/player') {
      // On player page, grant access for authenticated users
      if (userId && contentId) {
        return true;
      }
    }
    
    // For podcast panels and other pages, don't grant automatic access
    // This prevents showing "Owned" pills incorrectly
    return false;
  }

  // Client-side version of hasActiveSubscription - avoids RLS issues
  async hasActiveSubscriptionClient(userId: string): Promise<boolean> {
    // In development, assume authenticated users have active subscription
    if (userId) {
      return true;
    }
    return false;
  }

  // Client-side version of getUserPaymentSummary - avoids RLS issues
  async getUserPaymentSummaryClient(userId: string): Promise<{
    totalPurchases: number;
    totalSpent: number;
    hasActiveSubscription: boolean;
    subscriptionStatus: string | null;
    purchasedContentIds: string[];
  }> {
    // In development, return mock data for authenticated users
    if (userId) {
      return {
        totalPurchases: 0,
        totalSpent: 0,
        hasActiveSubscription: true,
        subscriptionStatus: 'active',
        purchasedContentIds: [],
      };
    }
    
    return {
      totalPurchases: 0,
      totalSpent: 0,
      hasActiveSubscription: false,
      subscriptionStatus: null,
      purchasedContentIds: [],
    };
  }

  // Get user's accessible content IDs for client-side use
  async getUserAccessibleContentClient(userId: string): Promise<string[]> {
    // In development, if user is authenticated, grant access to all content
    if (userId) {
      try {
        // Just get all published content without checking subscriptions/purchases
        const { data: allContent } = await supabase
          .from('vsk_content')
          .select('id')
          .eq('is_published', true);
        
        return allContent?.map(c => c.id) || [];
      } catch (error) {
        console.error('Error getting accessible content (client):', error);
        return [];
      }
    }
    return [];
  }

  // Check if user has series access (all episodes in series)
  async hasSeriesAccess(userId: string, seriesId: string): Promise<boolean> {
    try {
      // If user has active subscription, they have access to all series
      const hasSubscription = await this.hasActiveSubscription(userId);
      if (hasSubscription) {
        return true;
      }

      // Get all content in series
      const { data: seriesContent } = await supabaseAdmin
        .from('vsk_content')
        .select('id')
        .eq('series_id', seriesId)
        .eq('is_published', true);

      if (!seriesContent || seriesContent.length === 0) {
        return false;
      }

      // Check if user has purchased all content in series
      for (const content of seriesContent) {
        const hasAccess = await this.hasFullCPDAccess(userId, content.id);
        if (!hasAccess) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking series access:', error);
      return false;
    }
  }
}

export const accessControlService = new AccessControlService();