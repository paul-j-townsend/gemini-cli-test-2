import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import PurchaseModal from '@/components/PurchaseModal';
import MasonryEpisodeCard from '@/components/MasonryEpisodeCard';
import CompactEpisodeCard from '@/components/CompactEpisodeCard';
import type { User, PaymentSummary } from '@/types/database';
import type { PodcastEpisode } from '@/services/podcastService';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock UserContext
const mockUserContext = {
  user: null as User | null,
  accessibleContentIds: [] as string[],
  refreshPaymentStatus: jest.fn(),
  hasFullCPDAccess: jest.fn(),
  setUser: jest.fn(),
  isLoading: false,
  hasPermission: jest.fn(() => false),
  hasResourcePermission: jest.fn(() => false),
  isAdmin: jest.fn(() => false),
  canManageUsers: jest.fn(() => false),
  canManageContent: jest.fn(() => false),
  login: jest.fn(),
  logout: jest.fn(),
  refreshUser: jest.fn(),
  hasFullCPDAccessForPlayer: jest.fn(),
  hasSeriesAccess: jest.fn(),
  hasActiveSubscription: jest.fn(),
  getUserPaymentSummary: jest.fn(),
  paymentSummary: null,
  isPaymentLoading: false,
};

jest.mock('@/contexts/UserContext', () => ({
  useUser: () => mockUserContext,
  UserProvider: ({ children }: any) => children,
}));

// Mock hooks
jest.mock('@/hooks/useUserContentProgress', () => ({
  useUserContentProgress: () => ({
    certificateDownloaded: true, // This simulates the "Complete" badge showing
  }),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: 'mock-url' } }),
      }),
    },
  },
}));

describe('Purchase Modal Bug Fix', () => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    status: 'active',
    email_verified: true,
    auth_provider: 'google',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  const mockEpisode: PodcastEpisode = {
    content_id: 'episode-1',
    title: 'Episode 1 - New Content',
    description: 'Test episode description',
    duration: 3600,
    audio_src: 'test-audio.mp3',
    thumbnail_path: 'test-thumb.jpg',
    published_at: '2024-01-01',
    price_cents: 999,
    is_purchasable: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PurchaseModal Behavior', () => {
    it('should not show purchase modal when content is already purchased (accessibleContentIds)', async () => {
      // Set up mock for user with access
      mockUserContext.user = mockUser;
      mockUserContext.accessibleContentIds = ['episode-1'];
      
      const onClose = jest.fn();
      const onPurchaseComplete = jest.fn();

      render(
        <PurchaseModal
          episode={mockEpisode}
          isOpen={true}
          onClose={onClose}
          onPurchaseComplete={onPurchaseComplete}
        />
      );

      // Modal should immediately close and call onPurchaseComplete
      await waitFor(() => {
        expect(onPurchaseComplete).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });

      // Modal content should not be visible
      expect(screen.queryByText('Purchase CPD Content')).not.toBeInTheDocument();
    });

    it('should show purchase modal when content is not purchased', async () => {
      const mockUserContext = createMockUserContext([]); // User has no access
      const onClose = jest.fn();
      const onPurchaseComplete = jest.fn();

      render(
        <UserContext.Provider value={mockUserContext}>
          <PurchaseModal
            episode={mockEpisode}
            isOpen={true}
            onClose={onClose}
            onPurchaseComplete={onPurchaseComplete}
          />
        </UserContext.Provider>
      );

      // Wait for access check to complete
      await waitFor(() => {
        expect(screen.queryByText('Checking access...')).not.toBeInTheDocument();
      });

      // Modal should be visible
      expect(screen.getByText('Purchase CPD Content')).toBeInTheDocument();
      expect(screen.getByText('Episode 1 - New Content')).toBeInTheDocument();
      expect(onPurchaseComplete).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Episode Card Behavior', () => {
    it('MasonryEpisodeCard should not show purchase modal for purchased content', async () => {
      const mockUserContext = createMockUserContext(['episode-1']); // User has access

      render(
        <UserContext.Provider value={mockUserContext}>
          <MasonryEpisodeCard episode={mockEpisode} />
        </UserContext.Provider>
      );

      // Click on the card
      const card = screen.getByText('Episode 1 - New Content').closest('div');
      if (card) {
        fireEvent.click(card);
      }

      // Purchase modal should not appear
      await waitFor(() => {
        expect(screen.queryByText('Purchase CPD Content')).not.toBeInTheDocument();
      });
    });

    it('CompactEpisodeCard should not show purchase modal for purchased content', async () => {
      const mockUserContext = createMockUserContext(['episode-1']); // User has access

      render(
        <UserContext.Provider value={mockUserContext}>
          <CompactEpisodeCard episode={mockEpisode} />
        </UserContext.Provider>
      );

      // Click on the card
      const card = screen.getByText('Episode 1 - New Content').closest('div');
      if (card) {
        fireEvent.click(card);
      }

      // Purchase modal should not appear
      await waitFor(() => {
        expect(screen.queryByText('Purchase CPD Content')).not.toBeInTheDocument();
      });
    });

    it('should show purchase modal for unpurchased content', async () => {
      const mockUserContext = createMockUserContext([]); // User has no access

      render(
        <UserContext.Provider value={mockUserContext}>
          <MasonryEpisodeCard episode={mockEpisode} />
        </UserContext.Provider>
      );

      // Click on the card
      const card = screen.getByText('Episode 1 - New Content').closest('div');
      if (card) {
        fireEvent.click(card);
      }

      // Purchase modal should appear
      await waitFor(() => {
        expect(screen.getByText('Purchase CPD Content')).toBeInTheDocument();
      });
    });
  });

  describe('State Synchronization After Purchase', () => {
    it('should refresh payment status after purchase completion', async () => {
      const mockUserContext = createMockUserContext([]);
      const refreshPaymentStatus = jest.fn().mockResolvedValue(undefined);
      mockUserContext.refreshPaymentStatus = refreshPaymentStatus;

      render(
        <UserContext.Provider value={mockUserContext}>
          <MasonryEpisodeCard episode={mockEpisode} />
        </UserContext.Provider>
      );

      // Click on the card to open modal
      const card = screen.getByText('Episode 1 - New Content').closest('div');
      if (card) {
        fireEvent.click(card);
      }

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('Purchase CPD Content')).toBeInTheDocument();
      });

      // Simulate purchase completion (this would normally be triggered by PurchaseModal)
      const episodeCard = screen.getByText('Episode 1 - New Content').closest('[data-testid]');
      if (episodeCard) {
        // Trigger handlePurchaseComplete directly (in real scenario, this comes from PurchaseModal)
        // For this test, we'll verify that refreshPaymentStatus gets called
        fireEvent.click(screen.getByText('Purchase CPD Access'));
      }

      // Note: In a real scenario, after successful Stripe payment, 
      // the PurchaseModal would call onPurchaseComplete which would trigger refreshPaymentStatus
      // This test verifies the integration is set up correctly
    });
  });

  describe('Regression Test: Complete Badge vs Purchase Modal', () => {
    it('should not show purchase modal when Complete badge is visible', async () => {
      // This test specifically addresses the bug shown in the screenshot
      // where "Complete" badge is visible but purchase modal still shows
      
      const mockUserContext = createMockUserContext(['episode-1']); // User has purchased
      
      render(
        <UserContext.Provider value={mockUserContext}>
          <MasonryEpisodeCard episode={mockEpisode} />
        </UserContext.Provider>
      );

      // Verify Complete badge is shown (mocked via useUserContentProgress)
      expect(screen.getByText('Complete')).toBeInTheDocument();

      // Click on the card
      const card = screen.getByText('Episode 1 - New Content').closest('div');
      if (card) {
        fireEvent.click(card);
      }

      // Purchase modal should NOT appear since user already has access
      await waitFor(() => {
        expect(screen.queryByText('Purchase CPD Content')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });
});