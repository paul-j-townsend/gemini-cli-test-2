import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ContentPurchase, Subscription, PaymentSummary, SubscriptionStatus } from '../types/database';
import { userService } from '../services/userService';
import { accessControlService } from '../services/accessControlService';
import { hasPermission, hasResourcePermission, isAdmin, canManageUsers, canManageContent } from '../utils/permissions';
import type { Permission, Resource } from '../utils/permissions';
import { supabase } from '@/lib/supabase';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  // Permission checking methods
  hasPermission: (permission: Permission) => boolean;
  hasResourcePermission: (resource: Resource, permission: Permission) => boolean;
  isAdmin: () => boolean;
  canManageUsers: () => boolean;
  canManageContent: () => boolean;
  // User management methods
  login: (email: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // Payment-related methods
  hasFullCPDAccess: (contentId: string) => Promise<boolean>;
  hasFullCPDAccessForPlayer: (contentId: string) => Promise<boolean>;
  hasSeriesAccess: (seriesId: string) => Promise<boolean>;
  hasActiveSubscription: () => Promise<boolean>;
  getUserPaymentSummary: () => Promise<PaymentSummary | null>;
  refreshPaymentStatus: () => Promise<void>;
  // Payment state
  accessibleContentIds: string[];
  paymentSummary: PaymentSummary | null;
  isPaymentLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Payment state
  const [accessibleContentIds, setAccessibleContentIds] = useState<string[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  useEffect(() => {
    // Check for existing Supabase session on app start
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // User is authenticated with Supabase, find their profile
          let user = await userService.findUserByEmail(session.user.email || '');
          
          if (!user) {
            // Create user profile if doesn't exist
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
          }
          
          if (user) {
            setUser(user);
            await userService.updateLastLogin(user.id);
          }
        } else {
          // No Supabase session, use mock user for development
          console.log('No Supabase session found, using mock user for development');
          const mockUser = await userService.findUserById('fed2a63e-196d-43ff-9ebc-674db34e72a7');
          if (mockUser) {
            setUser(mockUser);
            console.log('Mock user loaded:', mockUser);
          } else {
            console.log('Mock user not found, creating default user state');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in, update user context
        let user = await userService.findUserByEmail(session.user.email || '');
        if (user) {
          setUser(user);
          await userService.updateLastLogin(user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out, fall back to default user or clear user
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Permission checking methods
  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const checkResourcePermission = (resource: Resource, permission: Permission): boolean => {
    if (!user) return false;
    return hasResourcePermission(user.role, resource, permission);
  };

  const checkIsAdmin = (): boolean => {
    if (!user) return false;
    return isAdmin(user.role);
  };

  const checkCanManageUsers = (): boolean => {
    if (!user) return false;
    return canManageUsers(user.role);
  };

  const checkCanManageContent = (): boolean => {
    if (!user) return false;
    return canManageContent(user.role);
  };

  // User management methods
  const login = async (email: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      const foundUser = await userService.findUserByEmail(email);
      if (foundUser && foundUser.status === 'active') {
        setUser(foundUser);
        await userService.updateLastLogin(foundUser.id);
        return foundUser;
      }
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Sign out from Supabase Auth
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user even if logout fails
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const refreshedUser = await userService.findUserById(user.id);
      if (refreshedUser) {
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  // Payment-related methods
  const hasFullCPDAccess = async (contentId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      return await accessControlService.hasFullCPDAccessClient(user.id, contentId);
    } catch (error) {
      console.error('Error checking CPD access:', error);
      return false;
    }
  };

  // Special method for player page that always grants access in development
  const hasFullCPDAccessForPlayer = async (contentId: string): Promise<boolean> => {
    if (!user) return false;
    
    // In development, always grant access on player page
    if (user && contentId) {
      return true;
    }
    
    return false;
  };

  const hasSeriesAccess = async (seriesId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      return await accessControlService.hasSeriesAccess(user.id, seriesId);
    } catch (error) {
      console.error('Error checking series access:', error);
      return false;
    }
  };

  const hasActiveSubscription = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      return await accessControlService.hasActiveSubscriptionClient(user.id);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  };

  const getUserPaymentSummary = async (): Promise<PaymentSummary | null> => {
    if (!user) return null;
    
    try {
      const summary = await accessControlService.getUserPaymentSummaryClient(user.id);
      return {
        totalPurchases: summary.totalPurchases,
        totalSpent: summary.totalSpent,
        hasActiveSubscription: summary.hasActiveSubscription,
        subscriptionStatus: summary.subscriptionStatus as SubscriptionStatus | null,
        purchasedContentIds: summary.purchasedContentIds,
      };
    } catch (error) {
      console.error('Error getting payment summary:', error);
      return null;
    }
  };

  const refreshPaymentStatus = async (): Promise<void> => {
    if (!user) return;
    
    setIsPaymentLoading(true);
    try {
      // Get accessible content IDs
      const contentIds = await accessControlService.getUserAccessibleContentClient(user.id);
      setAccessibleContentIds(contentIds);

      // Get payment summary
      const summary = await getUserPaymentSummary();
      setPaymentSummary(summary);
    } catch (error) {
      console.error('Error refreshing payment status:', error);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // Load payment data when user changes
  useEffect(() => {
    if (user) {
      refreshPaymentStatus();
    } else {
      setAccessibleContentIds([]);
      setPaymentSummary(null);
    }
  }, [user?.id]);

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      isLoading,
      hasPermission: checkPermission,
      hasResourcePermission: checkResourcePermission,
      isAdmin: checkIsAdmin,
      canManageUsers: checkCanManageUsers,
      canManageContent: checkCanManageContent,
      login,
      logout,
      refreshUser,
      // Payment methods
      hasFullCPDAccess,
      hasFullCPDAccessForPlayer,
      hasSeriesAccess,
      hasActiveSubscription,
      getUserPaymentSummary,
      refreshPaymentStatus,
      // Payment state
      accessibleContentIds,
      paymentSummary,
      isPaymentLoading,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};