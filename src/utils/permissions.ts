import { UserRole } from '../types/database';

export type Permission = 
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'
  | 'manage_users'
  | 'manage_content'
  | 'manage_settings'
  | 'view_analytics'
  | 'moderate_content'
  | 'export_data';

export type Resource = 
  | 'users'
  | 'articles'
  | 'podcasts'
  | 'quizzes'
  | 'comments'
  | 'settings'
  | 'analytics'
  | 'system';

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY: UserRole[] = [
  'viewer',
  'user', 
  'editor',
  'admin',
  'super_admin'
];

// Permission definitions for each role
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  viewer: [
    'read'
  ],
  user: [
    'read',
    'write' // Can write own content
  ],
  editor: [
    'read',
    'write',
    'moderate_content',
    'manage_content'
  ],
  admin: [
    'read',
    'write',
    'delete',
    'manage_content',
    'manage_users',
    'view_analytics',
    'moderate_content',
    'export_data'
  ],
  super_admin: [
    'read',
    'write',
    'delete',
    'admin',
    'manage_users',
    'manage_content',
    'manage_settings',
    'view_analytics',
    'moderate_content',
    'export_data'
  ]
};

// Resource-specific permissions
const RESOURCE_PERMISSIONS: Record<Resource, Record<UserRole, Permission[]>> = {
  users: {
    viewer: [],
    user: ['read'],
    editor: ['read'],
    admin: ['read', 'write', 'delete', 'manage_users'],
    super_admin: ['read', 'write', 'delete', 'manage_users', 'admin']
  },
  articles: {
    viewer: ['read'],
    user: ['read', 'write'],
    editor: ['read', 'write', 'delete', 'manage_content'],
    admin: ['read', 'write', 'delete', 'manage_content'],
    super_admin: ['read', 'write', 'delete', 'manage_content', 'admin']
  },
  podcasts: {
    viewer: ['read'],
    user: ['read'],
    editor: ['read', 'write', 'delete', 'manage_content'],
    admin: ['read', 'write', 'delete', 'manage_content'],
    super_admin: ['read', 'write', 'delete', 'manage_content', 'admin']
  },
  quizzes: {
    viewer: ['read'],
    user: ['read', 'write'],
    editor: ['read', 'write', 'delete', 'manage_content'],
    admin: ['read', 'write', 'delete', 'manage_content'],
    super_admin: ['read', 'write', 'delete', 'manage_content', 'admin']
  },
  comments: {
    viewer: ['read'],
    user: ['read', 'write'],
    editor: ['read', 'write', 'delete', 'moderate_content'],
    admin: ['read', 'write', 'delete', 'moderate_content'],
    super_admin: ['read', 'write', 'delete', 'moderate_content', 'admin']
  },
  settings: {
    viewer: [],
    user: [],
    editor: [],
    admin: ['read', 'write', 'manage_settings'],
    super_admin: ['read', 'write', 'manage_settings', 'admin']
  },
  analytics: {
    viewer: [],
    user: [],
    editor: ['read', 'view_analytics'],
    admin: ['read', 'view_analytics', 'export_data'],
    super_admin: ['read', 'view_analytics', 'export_data', 'admin']
  },
  system: {
    viewer: [],
    user: [],
    editor: [],
    admin: ['read'],
    super_admin: ['read', 'write', 'delete', 'admin']
  }
};

// Permission checking utilities
export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole].includes(permission);
};

export const hasResourcePermission = (
  userRole: UserRole, 
  resource: Resource, 
  permission: Permission
): boolean => {
  const resourcePerms = RESOURCE_PERMISSIONS[resource][userRole];
  return resourcePerms.includes(permission);
};

export const hasAnyPermission = (userRole: UserRole, permissions: Permission[]): boolean => {
  const userPermissions = ROLE_PERMISSIONS[userRole];
  return permissions.some(permission => userPermissions.includes(permission));
};

export const hasAllPermissions = (userRole: UserRole, permissions: Permission[]): boolean => {
  const userPermissions = ROLE_PERMISSIONS[userRole];
  return permissions.every(permission => userPermissions.includes(permission));
};

export const isRoleHigherThan = (userRole: UserRole, compareRole: UserRole): boolean => {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const compareIndex = ROLE_HIERARCHY.indexOf(compareRole);
  return userIndex > compareIndex;
};

export const isRoleAtLeast = (userRole: UserRole, minimumRole: UserRole): boolean => {
  const userIndex = ROLE_HIERARCHY.indexOf(userRole);
  const minimumIndex = ROLE_HIERARCHY.indexOf(minimumRole);
  return userIndex >= minimumIndex;
};

export const getUserPermissions = (userRole: UserRole): Permission[] => {
  return [...ROLE_PERMISSIONS[userRole]];
};

export const getResourcePermissions = (userRole: UserRole, resource: Resource): Permission[] => {
  return [...RESOURCE_PERMISSIONS[resource][userRole]];
};

// Role checking utilities
export const isAdmin = (userRole: UserRole): boolean => {
  return isRoleAtLeast(userRole, 'admin');
};

export const isSuperAdmin = (userRole: UserRole): boolean => {
  return userRole === 'super_admin';
};

export const isEditor = (userRole: UserRole): boolean => {
  return isRoleAtLeast(userRole, 'editor');
};

export const canManageUsers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'manage_users');
};

export const canManageContent = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'manage_content');
};

export const canViewAnalytics = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'view_analytics');
};

export const canModerateContent = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'moderate_content');
};

// Helper function to get human-readable role name
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    viewer: 'Viewer',
    user: 'User',
    editor: 'Editor',
    admin: 'Admin',
    super_admin: 'Super Admin'
  };
  return roleNames[role];
};

// Helper function to get role color for UI
export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    viewer: '#6B7280',
    user: '#3B82F6',
    editor: '#10B981',
    admin: '#F59E0B',
    super_admin: '#EF4444'
  };
  return roleColors[role];
};