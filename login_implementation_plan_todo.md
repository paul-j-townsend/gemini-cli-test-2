# Login Implementation Plan - VetSidekick Authentication

## Overview

Implement Google OAuth authentication for VetSidekick veterinary CPD platform, focusing on seamless user experience similar to Envato's signup flow.

## Current Tech Stack Analysis

- **Frontend**: Next.js 14, TypeScript, React
- **Backend**: Supabase (Auth, Database, Storage)
- **Styling**: Tailwind CSS
- **Current Auth**: Already using Supabase Auth with mock users

## Phase 1: Google OAuth Setup & Configuration

### 1.1 Google Cloud Console Setup

- [ ] Create/configure Google Cloud Project
- [ ] Enable Google+ API and Google OAuth2 API
- [ ] Create OAuth 2.0 Client ID credentials
- [ ] Configure authorized JavaScript origins:
  - `http://localhost:3000` (development)
  - `https://vetsidekick.com` (production)
- [ ] Configure authorized redirect URIs:
  - `http://localhost:3000/auth/callback`
  - `https://vetsidekick.com/auth/callback`

### 1.2 Supabase Auth Configuration

- [ ] Enable Google OAuth provider in Supabase Dashboard
- [ ] Configure Google OAuth settings with Client ID and Secret
- [ ] Set up redirect URLs in Supabase Auth settings
- [ ] Configure email domains (if restricting to veterinary professionals)

### 1.3 Environment Variables

```bash
# Add to .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_SUPABASE_URL=https://iixexlukgwmbtzolsnvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpeGV4bHVrZ3dtYnR6b2xzbnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzUxMTksImV4cCI6MjA2NDAxMTExOX0.KBsVs7lx8GMjpSDJYW7pKtCQvgs-aYGo_Cdypy5sttQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

## Phase 2: Dependencies & Library Installation

### 2.1 Install Required Packages

```bash
npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
npm install react-google-login # Alternative: @google-cloud/identity
```

### 2.2 Update Supabase Client Configuration

- [ ] Update `src/lib/supabase.ts` for auth helpers
- [ ] Configure auth callbacks and session management
- [ ] Update TypeScript types for auth user objects

## Phase 3: UI Components Development

### 3.1 Authentication Pages Structure

```
src/
  pages/
    auth/
      login.tsx           # Main login page
      signup.tsx          # Registration page  
      callback.tsx        # OAuth callback handler
      reset-password.tsx  # Password reset
  components/
    auth/
      LoginForm.tsx       # Email/password login
      SignupForm.tsx      # Registration form
      GoogleSignInButton.tsx  # Google OAuth button
      AuthModal.tsx       # Modal for auth flows
      ProtectedRoute.tsx  # Route protection wrapper
```

### 3.2 Google Sign-In Button Component

```typescript
// components/auth/GoogleSignInButton.tsx
interface GoogleSignInButtonProps {
  mode: 'signin' | 'signup';
  onSuccess?: (user: User) => void;
  onError?: (error: AuthError) => void;
}
```

### 3.3 Auth Modal Component (Envato-style)

- [ ] Clean, centered modal design
- [ ] Multiple auth options (Google primary, email secondary)
- [ ] Smooth transitions and loading states
- [ ] Mobile-responsive design
- [ ] Terms & Privacy Policy links

## Phase 4: Authentication Flow Implementation

### 4.1 Google OAuth Integration

```typescript
// hooks/useGoogleAuth.ts
const useGoogleAuth = () => {
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
  };
};
```

### 4.2 Authentication Context

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, metadata?: object) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
}
```

### 4.3 User Profile Enhancement

- [ ] Extend `vsk_users` table with Google profile data
- [ ] Handle profile picture from Google
- [ ] Store veterinary credentials/qualifications
- [ ] Map Google email to professional verification

## Phase 5: Route Protection & Navigation

### 5.1 Protected Routes Setup

```typescript
// components/auth/ProtectedRoute.tsx
const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth/login" />;
  if (user.role < requiredRole) return <AccessDenied />;
  
  return children;
};
```

### 5.2 Navigation Updates

- [ ] Add user menu/avatar in navigation
- [ ] Show authentication status
- [ ] Update existing mock user system
- [ ] Add sign out functionality

## Phase 6: Database Schema Updates

### 6.1 User Table Enhancements

```sql
-- Add Google OAuth fields to vsk_users
ALTER TABLE vsk_users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
ALTER TABLE vsk_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE vsk_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE vsk_users ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';
ALTER TABLE vsk_users ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- Create index for Google ID lookups
CREATE INDEX IF NOT EXISTS idx_vsk_users_google_id ON vsk_users(google_id);
```

### 6.2 Authentication Triggers

```sql
-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.vsk_users (
    id, 
    email, 
    full_name,
    avatar_url,
    provider,
    google_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_app_meta_data->>'provider',
    NEW.raw_user_meta_data->>'sub'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Phase 7: User Experience Enhancements

### 7.1 Onboarding Flow

- [ ] Welcome modal for new users
- [ ] Professional information collection
- [ ] CPD preferences setup
- [ ] Email verification process

### 7.2 Account Management

- [ ] Profile settings page
- [ ] Account linking (email + Google)
- [ ] Password management
- [ ] Account deletion/deactivation

## Phase 8: Security & Error Handling

### 8.1 Security Measures

- [ ] Rate limiting on auth endpoints
- [ ] CSRF protection
- [ ] Secure session management
- [ ] Input validation and sanitization

### 8.2 Error Handling

```typescript
// utils/authErrors.ts
const AUTH_ERROR_MESSAGES = {
  'invalid_credentials': 'Invalid email or password',
  'email_not_confirmed': 'Please check your email and click the confirmation link',
  'google_oauth_error': 'Google sign-in failed. Please try again',
  'rate_limit_exceeded': 'Too many attempts. Please wait before trying again'
};
```

### 8.3 Loading States & UX

- [ ] Skeleton loaders during auth checks
- [ ] Smooth transitions between auth states
- [ ] Clear error messaging
- [ ] Success confirmations

## Phase 9: Testing & Quality Assurance

### 9.1 Authentication Testing

- [ ] Unit tests for auth hooks and utilities
- [ ] Integration tests for auth flows
- [ ] E2E tests for complete user journeys
- [ ] Google OAuth flow testing

### 9.2 Security Testing

- [ ] Session management testing
- [ ] XSS prevention verification
- [ ] CSRF protection testing
- [ ] Data access control verification

## Phase 10: Deployment & Monitoring

### 10.1 Production Configuration

- [ ] Configure production Google OAuth credentials
- [ ] Set up production environment variables
- [ ] Configure Supabase production settings
- [ ] SSL certificate verification

### 10.2 Monitoring & Analytics

- [ ] Auth success/failure rate monitoring
- [ ] User registration analytics
- [ ] Error tracking and alerting
- [ ] Performance monitoring

## Implementation Priority Order

### High Priority (Week 1)

1. ✅ Google Cloud Console setup
2. ✅ Supabase OAuth configuration  
3. ✅ Install required dependencies
4. ✅ Create basic Google sign-in component

### Medium Priority (Week 2)

5. ✅ Implement authentication context
6. ✅ Create login/signup UI components
7. ✅ Set up protected routes
8. ✅ Database schema updates

### Lower Priority (Week 3-4)

9. ✅ Enhanced user onboarding
10. ✅ Account management features
11. ✅ Comprehensive testing
12. ✅ Production deployment

## Success Metrics

- [ ] 95%+ successful Google OAuth authentications
- [ ] <2 second average auth flow completion time
- [ ] Zero security vulnerabilities in auth flow
- [ ] 90%+ user satisfaction with login experience

## Risk Mitigation

- **OAuth Provider Changes**: Implement fallback email authentication
- **API Rate Limits**: Implement exponential backoff and user feedback
- **Security Vulnerabilities**: Regular security audits and dependency updates
- **User Experience**: A/B testing for auth flow optimization

## Notes

- This implementation leverages your existing Supabase infrastructure
- Maintains compatibility with current user roles system
- Provides foundation for additional OAuth providers (Apple, Facebook)
- Ensures GDPR compliance for EU veterinary professionals
