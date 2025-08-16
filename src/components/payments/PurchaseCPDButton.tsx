import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface PurchaseCPDButtonProps {
  contentId: string;
  contentTitle?: string;
  onPurchaseStart?: () => void;
  onPurchaseComplete?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
}

export const PurchaseCPDButton: React.FC<PurchaseCPDButtonProps> = ({
  contentId,
  contentTitle = 'CPD Content',
  onPurchaseStart,
  onPurchaseComplete,
  className = '',
  variant = 'default',
}) => {
  const { user, hasFullCPDAccess, refreshPaymentStatus } = useUser();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Check if user has access to this content
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setIsCheckingAccess(false);
        return;
      }

      try {
        const access = await hasFullCPDAccess(contentId);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user, contentId, hasFullCPDAccess]);

  const handlePurchase = async () => {
    if (!user) {
      // Redirect to login
      alert('Please log in to purchase CPD content');
      return;
    }

    if (hasAccess) {
      return; // User already has access
    }

    setIsLoading(true);
    onPurchaseStart?.();

    try {
      // Create checkout session
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId,
          userId: user.id,
          type: 'content_purchase',
          successUrl: `${window.location.origin}/purchase-success?contentId=${contentId}`,
          cancelUrl: `${window.location.origin}/purchase-cancelled?contentId=${contentId}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Error creating checkout:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout process');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking access
  if (isCheckingAccess) {
    return (
      <button
        disabled
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-lg bg-emerald-300 text-emerald-500 transition-colors ${className}`}
      >
        <Loader2 size={12} className="animate-spin" />
        <span>Checking...</span>
      </button>
    );
  }

  // Show access granted state
  if (hasAccess) {
    return (
      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-lg bg-green-500 text-white ${className}`}>
        <Check size={12} />
        <span>{variant === 'compact' ? 'Owned' : 'CPD Access Granted'}</span>
      </div>
    );
  }

  // Show purchase button
  return (
    <button
      onClick={handlePurchase}
      disabled={isLoading || !user}
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-lg transition-colors ${
        isLoading || !user
          ? 'bg-emerald-400 text-white cursor-not-allowed'
          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
      } ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 size={12} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <ShoppingCart size={12} />
          <span>{variant === 'compact' ? 'Buy CPD' : 'Purchase CPD'}</span>
        </>
      )}
    </button>
  );
};

export default PurchaseCPDButton;