import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/database';
import { userService } from '../services/userService';
import { hasPermission, hasResourcePermission, isAdmin, canManageUsers, canManageContent } from '../utils/permissions';
import type { Permission, Resource } from '../utils/permissions';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load default user from database on app start
    const loadDefaultUser = async () => {
      try {
        const defaultUser = await userService.findUserById('fed2a63e-196d-43ff-9ebc-674db34e72a7'); // Super admin by default
        if (defaultUser) {
          setUser(defaultUser);
          await userService.updateLastLogin(defaultUser.id);
        }
      } catch (error) {
        console.error('Failed to load default user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDefaultUser();
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
    setUser(null);
    // In a real app, you'd also invalidate sessions here
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
      refreshUser
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