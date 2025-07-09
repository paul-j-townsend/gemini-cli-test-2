// Auth hooks
export { useAuth } from './useAuth';

// Quiz hooks
export { useQuizCompletion } from './useQuizCompletion';

// Shared utility hooks
export { useAdminManagement } from './useAdminManagement';
export { useFormManagement } from './useFormManagement';
export { useLoadingState, useSimpleLoadingState } from './useLoadingState';

// Type exports
export type { AdminManagementHook, AdminManagementConfig } from './useAdminManagement';
export type { FormManagementHook, FormManagementConfig, ValidationSchema } from './useFormManagement';
export type { LoadingStateHook, LoadingStateConfig } from './useLoadingState';