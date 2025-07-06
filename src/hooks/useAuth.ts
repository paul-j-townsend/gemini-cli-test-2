import { useUser } from '../contexts/UserContext';
import { UserRole } from '../types/database';
import type { Permission, Resource } from '../utils/permissions';

export const useAuth = () => {
  const { 
    user, 
    isLoading, 
    hasPermission, 
    hasResourcePermission, 
    isAdmin,
    canManageUsers,
    canManageContent,
    login,
    logout,
    refreshUser
  } = useUser();

  return {
    // User state
    user,
    isLoading,
    isAuthenticated: !!user,
    
    // Permission checks
    hasPermission,
    hasResourcePermission,
    isAdmin,
    canManageUsers,
    canManageContent,
    
    // Role checks
    hasRole: (role: UserRole) => user?.role === role,
    hasAnyRole: (roles: UserRole[]) => roles.includes(user?.role || 'viewer'),
    isAtLeastRole: (minRole: UserRole) => {
      if (!user) return false;
      const roleHierarchy: UserRole[] = ['viewer', 'user', 'editor', 'admin', 'super_admin'];
      const userIndex = roleHierarchy.indexOf(user.role);
      const minIndex = roleHierarchy.indexOf(minRole);
      return userIndex >= minIndex;
    },
    
    // Authentication methods
    login,
    logout,
    refreshUser,
    
    // Quick permission checks
    canRead: (resource?: Resource) => 
      resource ? hasResourcePermission(resource, 'read') : hasPermission('read'),
    canWrite: (resource?: Resource) => 
      resource ? hasResourcePermission(resource, 'write') : hasPermission('write'),
    canDelete: (resource?: Resource) => 
      resource ? hasResourcePermission(resource, 'delete') : hasPermission('delete'),
    canModerate: () => hasPermission('moderate_content'),
    canViewAnalytics: () => hasPermission('view_analytics'),
    canExportData: () => hasPermission('export_data'),
    
    // User info
    getUserDisplayName: () => user?.name || 'Unknown User',
    getUserEmail: () => user?.email || '',
    getUserRole: () => user?.role || 'viewer',
    getUserStatus: () => user?.status || 'inactive',
    isUserActive: () => user?.status === 'active',
    isUserVerified: () => user?.email_verified || false,
  };
};

export default useAuth;