import { User, UserRole, UserStatus, UserSession } from '../types/database';

// Mock database with in-memory storage
class MockDatabase {
  private users: User[] = [
    {
      id: '1',
      email: 'super@admin.com',
      name: 'Super Admin',
      role: 'super_admin',
      status: 'active',
      avatar: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      lastLoginAt: '2024-01-15T10:30:00Z',
      emailVerified: true,
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        timezone: 'UTC',
        language: 'en'
      }
    },
    {
      id: '2',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      avatar: null,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      lastLoginAt: '2024-01-14T14:20:00Z',
      emailVerified: true,
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: false,
          marketing: true
        },
        timezone: 'America/New_York',
        language: 'en'
      }
    },
    {
      id: '3',
      email: 'editor@example.com',
      name: 'Editor User',
      role: 'editor',
      status: 'active',
      avatar: null,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      lastLoginAt: '2024-01-13T09:15:00Z',
      emailVerified: true,
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        timezone: 'Europe/London',
        language: 'en'
      }
    },
    {
      id: '4',
      email: 'user@example.com',
      name: 'Regular User',
      role: 'user',
      status: 'active',
      avatar: null,
      createdAt: '2024-01-04T00:00:00Z',
      updatedAt: '2024-01-04T00:00:00Z',
      lastLoginAt: '2024-01-12T16:45:00Z',
      emailVerified: true,
      preferences: {
        theme: 'light',
        notifications: {
          email: false,
          push: true,
          marketing: false
        },
        timezone: 'Pacific/Auckland',
        language: 'en'
      }
    },
    {
      id: '5',
      email: 'viewer@example.com',
      name: 'Viewer User',
      role: 'viewer',
      status: 'active',
      avatar: null,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z',
      lastLoginAt: '2024-01-11T11:30:00Z',
      emailVerified: true,
      preferences: {
        theme: 'light',
        notifications: {
          email: false,
          push: false,
          marketing: false
        },
        timezone: 'UTC',
        language: 'en'
      }
    }
  ];

  private sessions: UserSession[] = [];

  // User operations
  async findUserById(id: string): Promise<User | null> {
    await this.simulateDelay();
    return this.users.find(user => user.id === id) || null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    await this.simulateDelay();
    return this.users.find(user => user.email === email) || null;
  }

  async findAllUsers(): Promise<User[]> {
    await this.simulateDelay();
    return [...this.users];
  }

  async findUsersByRole(role: UserRole): Promise<User[]> {
    await this.simulateDelay();
    return this.users.filter(user => user.role === role);
  }

  async findUsersByStatus(status: UserStatus): Promise<User[]> {
    await this.simulateDelay();
    return this.users.filter(user => user.status === status);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await this.simulateDelay();
    const newUser: User = {
      ...userData,
      id: (this.users.length + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    await this.simulateDelay();
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.simulateDelay();
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    return true;
  }

  async updateUserRole(id: string, role: UserRole): Promise<User | null> {
    return this.updateUser(id, { role });
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<User | null> {
    return this.updateUser(id, { status });
  }

  async updateLastLogin(id: string): Promise<User | null> {
    return this.updateUser(id, { lastLoginAt: new Date().toISOString() });
  }

  // Session operations
  async createSession(userId: string, token: string, expiresAt: string): Promise<UserSession> {
    await this.simulateDelay();
    const session: UserSession = {
      id: (this.sessions.length + 1).toString(),
      userId,
      token,
      expiresAt,
      createdAt: new Date().toISOString()
    };
    this.sessions.push(session);
    return session;
  }

  async findSessionByToken(token: string): Promise<UserSession | null> {
    await this.simulateDelay();
    return this.sessions.find(session => session.token === token) || null;
  }

  async deleteSession(token: string): Promise<boolean> {
    await this.simulateDelay();
    const sessionIndex = this.sessions.findIndex(session => session.token === token);
    if (sessionIndex === -1) return false;
    
    this.sessions.splice(sessionIndex, 1);
    return true;
  }

  async deleteUserSessions(userId: string): Promise<number> {
    await this.simulateDelay();
    const initialLength = this.sessions.length;
    this.sessions = this.sessions.filter(session => session.userId !== userId);
    return initialLength - this.sessions.length;
  }

  // Utility methods
  private async simulateDelay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Reset database (for testing)
  async reset(): Promise<void> {
    this.users = [];
    this.sessions = [];
  }
}

export const db = new MockDatabase();
export default db;