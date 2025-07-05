import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/database';
import type { Permission, Resource } from '../utils/permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  // Role-based protection
  requiredRole?: UserRole;
  minRole?: UserRole;
  allowedRoles?: UserRole[];
  // Permission-based protection
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  // Resource-specific protection
  resource?: Resource;
  resourcePermission?: Permission;
  // Fallback components
  fallback?: ReactNode;
  unauthorizedComponent?: ReactNode;
  loadingComponent?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  minRole,
  allowedRoles,
  requiredPermission,
  requiredPermissions,
  resource,
  resourcePermission,
  fallback,
  unauthorizedComponent,
  loadingComponent
}) => {
  const {
    user,
    isLoading,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAtLeastRole,
    hasPermission,
    hasResourcePermission
  } = useAuth();

  // Show loading state
  if (isLoading) {
    return loadingComponent || <div>Loading...</div>;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return unauthorizedComponent || fallback || <div>Please log in to access this content.</div>;
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    return unauthorizedComponent || fallback || <div>Insufficient permissions. Required role: {requiredRole}</div>;
  }

  if (minRole && !isAtLeastRole(minRole)) {
    return unauthorizedComponent || fallback || <div>Insufficient permissions. Minimum role required: {minRole}</div>;
  }

  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    return unauthorizedComponent || fallback || <div>Insufficient permissions. Allowed roles: {allowedRoles.join(', ')}</div>;
  }

  // Check permission requirements
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return unauthorizedComponent || fallback || <div>Insufficient permissions. Required permission: {requiredPermission}</div>;
  }

  if (requiredPermissions && !requiredPermissions.every(permission => hasPermission(permission))) {
    return unauthorizedComponent || fallback || <div>Insufficient permissions. Required permissions: {requiredPermissions.join(', ')}</div>;
  }

  // Check resource-specific permissions
  if (resource && resourcePermission && !hasResourcePermission(resource, resourcePermission)) {
    return unauthorizedComponent || fallback || <div>Insufficient permissions for {resource}. Required: {resourcePermission}</div>;
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Convenience components for common use cases
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <ProtectedRoute minRole="admin" fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const EditorOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <ProtectedRoute minRole="editor" fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const UserOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <ProtectedRoute minRole="user" fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const SuperAdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <ProtectedRoute requiredRole="super_admin" fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;