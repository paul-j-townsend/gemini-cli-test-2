import React from 'react';
import { useRouter } from 'next/router';
import { X, ArrowLeft, CreditCard } from 'lucide-react';

const PurchaseCancelledPage: React.FC = () => {
  const router = useRouter();
  const { contentId } = router.query;

  const handleTryAgain = () => {
    // Go back to the content page where they can try purchasing again
    if (contentId) {
      router.push(`/player?id=${contentId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Purchase Cancelled
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your payment was cancelled and no charges were made. You can try again whenever you're ready.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Try Purchase Again
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCancelledPage;