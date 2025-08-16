import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/UserContext';
import { Check, Loader2, ArrowRight } from 'lucide-react';

const PurchaseSuccessPage: React.FC = () => {
  const router = useRouter();
  const { contentId } = router.query;
  const { user, refreshPaymentStatus } = useUser();
  const [contentTitle, setContentTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handlePurchaseSuccess = async () => {
      if (!contentId || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Refresh payment status to get latest access
        await refreshPaymentStatus();

        // Get content details
        const response = await fetch(`/api/content/${contentId}`);
        if (response.ok) {
          const content = await response.json();
          setContentTitle(content.title || 'CPD Content');
        }
      } catch (error) {
        console.error('Error handling purchase success:', error);
      } finally {
        setIsLoading(false);
      }
    };

    handlePurchaseSuccess();
  }, [contentId, user?.id]);

  const handleGoToContent = () => {
    if (contentId) {
      window.location.href = `/player?id=${contentId}`;
    } else {
      window.location.href = '/';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Your Purchase
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Purchase Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for your purchase! You now have full access to{' '}
            <span className="font-medium text-gray-900">
              {contentTitle || 'your CPD content'}
            </span>
            , including the podcast, quiz, report, and certificate.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleGoToContent}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Access Your Content
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;