import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { userService } from '@/services/userService';
import { useUser } from '@/contexts/UserContext';

const AuthCallback = () => {
  const router = useRouter();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Authentication failed. Please try again.');
          return;
        }

        if (session?.user) {
          // Try to find existing user by email
          let user = await userService.findUserByEmail(session.user.email || '');
          
          if (!user) {
            // Create new user if doesn't exist
            const newUser = {
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    session.user.email?.split('@')[0] || 'User',
              role: 'user' as const,
              status: 'active' as const,
              email_verified: true,
              auth_provider: 'google' as const,
              supabase_auth_id: session.user.id,
              avatar_url: session.user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            user = await userService.createUser(newUser);
          } else {
            // Update existing user with OAuth info
            user = await userService.updateUser(user.id, {
              auth_provider: 'google' as const,
              supabase_auth_id: session.user.id,
              email_verified: true,
              avatar_url: session.user.user_metadata?.avatar_url || user.avatar_url,
              updated_at: new Date().toISOString()
            });
          }

          if (user) {
            setUser(user);
            await userService.updateLastLogin(user.id);
            router.push('/');
          } else {
            setError('Failed to create or update user profile.');
          }
        } else {
          setError('No user session found.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-emerald-900 mb-2">Completing sign in...</h2>
          <p className="text-sm text-emerald-600">Please wait while we set up your account.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-center max-w-md px-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-emerald-900 mb-2">Authentication Error</h2>
          <p className="text-sm text-emerald-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;