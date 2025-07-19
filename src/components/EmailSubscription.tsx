import { useState } from 'react';

interface EmailSubscriptionProps {
  className?: string;
  variant?: 'dark' | 'light';
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  showSuccessMessage?: boolean;
  redirectUrl?: string;
}

const EmailSubscription = ({ 
  className = '', 
  variant = 'dark',
  title = 'Stay Updated',
  description = 'Get the latest veterinary insights and podcast updates delivered to your inbox.',
  placeholder = 'Enter your email',
  buttonText = '',
  showSuccessMessage = true,
  redirectUrl
}: EmailSubscriptionProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setMessage('Success! Check your email to confirm.');
        setEmail('');
        
        // Track subscription event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'newsletter_signup', {
            event_category: 'engagement',
            event_label: 'email_subscription'
          });
        }
        
        // Redirect if specified
        if (redirectUrl) {
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 2000);
        }
      } else {
        const data = await response.json();
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDark = variant === 'dark';

  return (
    <div className={`${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-6 sm:p-8 rounded-xl shadow-lg ${className}`}>
      <h3 className="text-xl sm:text-2xl font-bold mb-4">{title}</h3>
      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6 text-sm sm:text-base`}>
        {description}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            required
            className={`flex-1 min-w-0 px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
              isDark 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 flex-shrink-0"
          >
            {buttonText || (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        
        {showSuccessMessage && message && (
          <p className={`text-sm ${message.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </form>
      
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-4`}>
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
};

export default EmailSubscription;
