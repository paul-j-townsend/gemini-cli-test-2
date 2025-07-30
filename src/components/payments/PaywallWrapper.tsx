import React, { useState, useEffect } from 'react';
import { Lock, CreditCard, Check, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import PurchaseCPDButton from './PurchaseCPDButton';

interface PaywallWrapperProps {
  contentId: string;
  contentTitle?: string;
  contentType?: 'quiz' | 'certificate' | 'report' | 'content';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showPreview?: boolean;
  previewMessage?: string;
}

export const PaywallWrapper: React.FC<PaywallWrapperProps> = ({
  contentId,
  contentTitle = 'CPD Content',
  contentType = 'content',
  children,
  fallback,
  showPreview = false,
  previewMessage,
}) => {
  const { user, hasFullCPDAccess, isPaymentLoading } = useUser();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      try {
        const access = await hasFullCPDAccess(contentId);
        setHasAccess(access);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [user, contentId, hasFullCPDAccess]);

  // Show loading state while checking access
  if (isChecking || isPaymentLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // User has access - show the content
  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access - show paywall
  if (fallback) {
    return <>{fallback}</>;
  }

  const getContentTypeMessage = () => {
    switch (contentType) {
      case 'quiz':
        return 'Take the quiz and test your knowledge to earn CPD credits.';
      case 'certificate':
        return 'Download your personalized CPD certificate after completing the quiz.';
      case 'report':
        return 'Access the detailed report with learning outcomes and additional resources.';
      default:
        return 'Access the complete CPD content package including podcast, quiz, report, and certificate.';
    }
  };

  const getContentTypeIcon = () => {
    switch (contentType) {
      case 'quiz':
        return '📝';
      case 'certificate':
        return '🏆';
      case 'report':
        return '📋';
      default:
        return '🎓';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6 text-center">
      <div className="mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <div className="text-3xl mb-2">{getContentTypeIcon()}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Premium CPD Content
        </h3>
        <p className="text-gray-600 mb-4">
          {previewMessage || getContentTypeMessage()}
        </p>
      </div>

      {showPreview && (
        <div className="bg-white/50 rounded-lg p-4 mb-4 text-left">
          <h4 className="font-medium text-gray-900 mb-2">What you'll get:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Full podcast access</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Interactive quiz with explanations</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Detailed learning report</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>CPD certificate download</span>
            </li>
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <PurchaseCPDButton
          contentId={contentId}
          contentTitle={contentTitle}
          className="text-base px-6 py-3"
        />
        
        {!user && (
          <p className="text-sm text-gray-500">
            Please log in to purchase CPD content
          </p>
        )}
      </div>
    </div>
  );
};

export default PaywallWrapper;