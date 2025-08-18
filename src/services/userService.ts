import { User, UserRole } from '../types/database';

// Lazy load admin client to avoid importing on client side
const getSupabaseAdmin = async () => {
  const { supabaseAdmin } = await import('@/lib/supabase-admin');
  return supabaseAdmin;
};

// Mock users for development since we don't have real auth setup
const mockUsers: User[] = [
  {
    id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
    email: 'admin@vetsidekick.com',
    name: 'Super Admin',
    role: 'super_admin',
    status: 'active',
    last_login_at: new Date().toISOString(),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    email_verified: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    last_login_at: '2024-01-14T14:20:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-14T14:20:00Z',
    email_verified: true
  },
  {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    email: 'editor@example.com',
    name: 'Editor User',
    role: 'editor',
    status: 'active',
    last_login_at: '2024-01-13T09:15:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-13T09:15:00Z',
    email_verified: true
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
    status: 'active',
    last_login_at: '2024-01-12T16:30:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-12T16:30:00Z',
    email_verified: true
  },
  {
    id: '987fcdeb-51a2-43d5-8f6e-123456789def',
    email: 'viewer@example.com',
    name: 'Viewer User',
    role: 'viewer',
    status: 'active',
    last_login_at: '2024-01-11T11:45:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-11T11:45:00Z',
    email_verified: true
  }
];

class UserService {
  // Simulate delay for realistic behavior
  private async simulateDelay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async findUserById(id: string): Promise<User | null> {
    await this.simulateDelay();
    return mockUsers.find(user => user.id === id) || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    await this.simulateDelay();
    return mockUsers.find(user => user.email === email) || null;
  }

  async findAllUsers(): Promise<User[]> {
    await this.simulateDelay();
    return [...mockUsers];
  }

  async findUsersByRole(role: UserRole): Promise<User[]> {
    await this.simulateDelay();
    return mockUsers.filter(user => user.role === role);
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    await this.simulateDelay();
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    await this.simulateDelay();
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockUsers[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.simulateDelay();
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    mockUsers.splice(userIndex, 1);
    return true;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.simulateDelay();
    const user = mockUsers.find(user => user.id === id);
    if (user) {
      user.last_login_at = new Date().toISOString();
      user.updated_at = new Date().toISOString();
    }
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<UserRole, number>;
  }> {
    await this.simulateDelay();
    const activeUsers = mockUsers.filter(user => user.status === 'active');
    const usersByRole = mockUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<UserRole, number>);

    return {
      totalUsers: mockUsers.length,
      activeUsers: activeUsers.length,
      usersByRole
    };
  }
}

export const userService = new UserService();
export default userService;