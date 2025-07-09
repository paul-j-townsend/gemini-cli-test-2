import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminManagementState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  editing: T | null;
  saving: boolean;
  deleting: string | null;
}

export interface AdminManagementActions<T> {
  fetchItems: () => Promise<void>;
  createItem: (item: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<T | null>;
  updateItem: (id: string, item: Partial<T>) => Promise<T | null>;
  deleteItem: (id: string) => Promise<boolean>;
  setEditing: (item: T | null) => void;
  clearError: () => void;
  refreshItems: () => Promise<void>;
}

export interface AdminManagementConfig {
  tableName: string;
  selectColumns?: string;
  orderBy?: { column: string; ascending?: boolean };
  enableRealtime?: boolean;
}

export interface AdminManagementHook<T> extends AdminManagementState<T>, AdminManagementActions<T> {}

/**
 * Generic hook for admin CRUD operations with Supabase
 * Provides consistent state management and error handling for admin interfaces
 * 
 * @template T - The type of the data entity
 * @param config - Configuration object for the hook
 * @returns Object containing state and actions for admin management
 * 
 * @example
 * ```typescript
 * interface Quiz {
 *   id: string;
 *   title: string;
 *   description: string;
 *   created_at: string;
 *   updated_at: string;
 * }
 * 
 * const {
 *   items: quizzes,
 *   loading,
 *   error,
 *   editing,
 *   saving,
 *   fetchItems,
 *   createItem,
 *   updateItem,
 *   deleteItem,
 *   setEditing
 * } = useAdminManagement<Quiz>({
 *   tableName: 'vsk_quizzes',
 *   selectColumns: 'id, title, description, created_at, updated_at',
 *   orderBy: { column: 'created_at', ascending: false }
 * });
 * ```
 */
export const useAdminManagement = <T extends { id: string }>(
  config: AdminManagementConfig
): AdminManagementHook<T> => {
  const { tableName, selectColumns = '*', orderBy, enableRealtime = false } = config;

  const [state, setState] = useState<AdminManagementState<T>>({
    items: [],
    loading: true,
    error: null,
    editing: null,
    saving: false,
    deleting: null,
  });

  /**
   * Fetch all items from the configured table
   */
  const fetchItems = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let query = supabase
        .from(tableName)
        .select(selectColumns);

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setState(prev => ({
        ...prev,
        items: data as unknown as T[],
        loading: false,
        error: null,
      }));
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch items',
      }));
    }
  }, [tableName, selectColumns, orderBy]);

  /**
   * Create a new item
   */
  const createItem = useCallback(async (
    item: Omit<T, 'id' | 'created_at' | 'updated_at'>
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, saving: true, error: null }));
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert([item])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newItem = data as T;
      setState(prev => ({
        ...prev,
        items: [newItem, ...prev.items],
        saving: false,
        error: null,
      }));

      return newItem;
    } catch (err) {
      console.error(`Error creating ${tableName} item:`, err);
      setState(prev => ({
        ...prev,
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to create item',
      }));
      return null;
    }
  }, [tableName]);

  /**
   * Update an existing item
   */
  const updateItem = useCallback(async (
    id: string,
    updates: Partial<T>
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, saving: true, error: null }));
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedItem = data as T;
      setState(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === id ? updatedItem : item
        ),
        saving: false,
        editing: null,
        error: null,
      }));

      return updatedItem;
    } catch (err) {
      console.error(`Error updating ${tableName} item:`, err);
      setState(prev => ({
        ...prev,
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to update item',
      }));
      return null;
    }
  }, [tableName]);

  /**
   * Delete an item
   */
  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, deleting: id, error: null }));
    
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id),
        deleting: null,
        error: null,
      }));

      return true;
    } catch (err) {
      console.error(`Error deleting ${tableName} item:`, err);
      setState(prev => ({
        ...prev,
        deleting: null,
        error: err instanceof Error ? err.message : 'Failed to delete item',
      }));
      return false;
    }
  }, [tableName]);

  /**
   * Set the currently editing item
   */
  const setEditing = useCallback((item: T | null) => {
    setState(prev => ({ ...prev, editing: item }));
  }, []);

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Refresh items (alias for fetchItems)
   */
  const refreshItems = useCallback(async () => {
    await fetchItems();
  }, [fetchItems]);

  // Initial fetch on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Set up real-time subscription if enabled
  useEffect(() => {
    if (!enableRealtime) return;

    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        () => {
          // Refresh data when changes occur
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, enableRealtime, fetchItems]);

  return {
    ...state,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    setEditing,
    clearError,
    refreshItems,
  };
};

export default useAdminManagement;