import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { PodcastEpisode } from '@/services/podcastService';
import { supabase } from '@/lib/supabase';

interface PurchaseModalProps {
  episode: PodcastEpisode;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete?: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  episode,
  isOpen,
  onClose,
  onPurchaseComplete,
}) => {
  const { user, hasFullCPDAccess, refreshPaymentStatus } = useUser();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Check if user has access when modal opens
  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !isOpen) {
        setHasAccess(false);
        setIsCheckingAccess(false);
        return;
      }

      try {
        const access = await hasFullCPDAccess(episode.content_id);
        setHasAccess(access);
        if (access) {
          // If user already has access, close modal and complete
          onPurchaseComplete?.();
          onClose();
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user, episode.content_id, hasFullCPDAccess, isOpen, onPurchaseComplete, onClose]);

  const getDefaultThumbnailUrl = (): string => {
    try {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl('thumbnails/1753642620645-zoonoses-s1e2.png');
      return data.publicUrl;
    } catch (error) {
      return 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=300&h=300&fit=crop&crop=center';
    }
  };

  const getThumbnailUrl = (episode: PodcastEpisode): string => {
    if (!episode || !episode.thumbnail_path || episode.thumbnail_path.trim() === '') {
      return getDefaultThumbnailUrl();
    }
    try {
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(episode.thumbnail_path);
      return data.publicUrl || getDefaultThumbnailUrl();
    } catch (error) {
      console.warn('Error getting thumbnail URL:', error);
      return getDefaultThumbnailUrl();
    }
  };

  const formatPrice = (cents: number): string => {
    return `£${(cents / 100).toFixed(2)}`;
  };

  const getCurrentPrice = (): number => {
    // Check if special offer is active and within date range
    if (episode.special_offer_active && episode.special_offer_price_cents) {
      const now = new Date();
      const startDate = episode.special_offer_start_date ? new Date(episode.special_offer_start_date) : null;
      const endDate = episode.special_offer_end_date ? new Date(episode.special_offer_end_date) : null;
      
      // If dates are set, check if we're within the offer period
      const withinDateRange = (!startDate || now >= startDate) && (!endDate || now <= endDate);
      
      if (withinDateRange) {
        return episode.special_offer_price_cents;
      }
    }
    
    return episode.price_cents || 999; // Default to £9.99 if no price set
  };

  const getRegularPrice = (): number => {
    return episode.price_cents || 999;
  };

  const isSpecialOfferActive = (): boolean => {
    if (!episode.special_offer_active || !episode.special_offer_price_cents) return false;
    
    const now = new Date();
    const startDate = episode.special_offer_start_date ? new Date(episode.special_offer_start_date) : null;
    const endDate = episode.special_offer_end_date ? new Date(episode.special_offer_end_date) : null;
    
    return (!startDate || now >= startDate) && (!endDate || now <= endDate);
  };

  const handlePurchase = async () => {
    if (!user) {
      alert('Please log in to purchase CPD content');
      return;
    }

    if (hasAccess) {
      onPurchaseComplete?.();
      onClose();
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        contentId: episode.content_id,
        userId: user.id,
        type: 'content_purchase',
        priceCents: getCurrentPrice(),
        successUrl: `${window.location.origin}/purchase-success?contentId=${episode.content_id}`,
        cancelUrl: `${window.location.origin}/purchase-cancelled?contentId=${episode.content_id}`,
      };
      
      console.log('Purchase request:', requestBody);
      
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Error creating checkout:', error);
      
      let errorMessage = 'Failed to start checkout process';
      if (error instanceof Error) {
        if (error.message.includes('already has access')) {
          errorMessage = 'You already have access to this content. Please refresh the page.';
          // Refresh payment status to update UI
          refreshPaymentStatus?.();
        } else if (error.message.includes('not purchasable')) {
          errorMessage = 'This content is not available for purchase at this time.';
        } else if (error.message.includes('price not set')) {
          errorMessage = 'Content pricing information is not available. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">Purchase CPD Content</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {isCheckingAccess ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-primary-600" />
              <span className="ml-2 text-neutral-600">Checking access...</span>
            </div>
          ) : (
            <>
              {/* Episode Info */}
              <div className="flex gap-4 mb-6">
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
                  <Image
                    src={getThumbnailUrl(episode)}
                    alt={episode.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-2 line-clamp-2">
                    {episode.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                    {episode.description}
                  </p>
                  {episode.duration && (
                    <div className="text-xs text-neutral-500">
                      <span className="font-medium">CPD: </span>
                      {Math.floor(episode.duration / 3600) > 0 
                        ? `${Math.floor(episode.duration / 3600)} hour${Math.floor(episode.duration / 3600) > 1 ? 's' : ''}` 
                        : `${Math.floor(episode.duration / 60)} min`}
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <h4 className="font-medium text-neutral-900 mb-3">What's included:</h4>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    Full podcast access
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    Podcast transcript
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    Downloadable PDF: Comprehensive report on the subject matter. All information sources included
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    CPD certificate
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    RCVS CPD Activity Log
                  </li>
                </ul>
              </div>


              {/* Price and Purchase */}
              <div className="text-center">
                <div className="mb-4">
                  {isSpecialOfferActive() ? (
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-lg text-neutral-500 line-through">
                          {formatPrice(getRegularPrice())}
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatPrice(getCurrentPrice())}
                        </span>
                      </div>
                      <div className="text-sm text-green-600 font-medium mb-1">
                        {episode.special_offer_description || 'Special Offer'}
                      </div>
                      {episode.special_offer_end_date && (
                        <div className="text-xs text-neutral-500">
                          Offer ends {new Date(episode.special_offer_end_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-neutral-900">
                      {formatPrice(getCurrentPrice())}
                    </div>
                  )}
                  <div className="text-sm text-neutral-500 mt-2">One-time purchase</div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={isLoading || !user}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isLoading || !user
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Purchase CPD Access
                    </>
                  )}
                </button>

                {!user && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Please log in to purchase content
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;