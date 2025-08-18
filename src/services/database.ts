// Lazy load admin client to avoid importing on client side
const getSupabaseAdmin = async () => {
  const { supabaseAdmin } = await import('@/lib/supabase-admin');
  return supabaseAdmin;
};
import { User, UserRole, UserStatus } from '../types/database';
import { userService } from './userService';

// Database service that handles direct Supabase operations
// For user-related operations, it delegates to userService which contains mock data
class MockDatabase {
  async findUserById(id: string): Promise<User | null> {
    return await userService.findUserById(id);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await userService.findUserByEmail(email);
  }

  async findAllUsers(): Promise<User[]> {
    return await userService.findAllUsers();
  }

  async findUsersByRole(role: UserRole): Promise<User[]> {
    return await userService.findUsersByRole(role);
  }

  async findUsersByStatus(status: UserStatus): Promise<User[]> {
    const allUsers = await userService.findAllUsers();
    return allUsers.filter(user => user.status === status);
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    return await userService.createUser(userData);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    return await userService.updateUser(id, updates);
  }

  async deleteUser(id: string): Promise<boolean> {
    return await userService.deleteUser(id);
  }

  async updateLastLogin(id: string): Promise<void> {
    return await userService.updateLastLogin(id);
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<UserRole, number>;
  }> {
    return await userService.getUserStats();
  }

  // Database operations for quiz completions (if needed)
  async createQuizCompletion(completionData: any): Promise<any> {
    const supabaseAdmin = await getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('vsk_quiz_completions')
      .insert(completionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz completion:', error);
      throw new Error('Failed to create quiz completion');
    }
    return data;
  }

  // Add other database operations as needed...
}

export const db = new MockDatabase();
export default db;