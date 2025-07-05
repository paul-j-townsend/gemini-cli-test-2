import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AdminOnly, SuperAdminOnly } from '../components/ProtectedRoute';
import { UserSwitcher } from '../components/UserSwitcher';
import { db } from '../services/database';
import { User, UserRole } from '../types/database';
import { getRoleDisplayName, getRoleColor } from '../utils/permissions';

const UserManagement: React.FC = () => {
  const { user, canManageUsers, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await db.findAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const updatedUser = await db.updateUserRole(userId, newRole);
      if (updatedUser) {
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  if (!canManageUsers()) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>You don't have permission to manage users.</p>
        <p>Current role: <strong>{user?.role}</strong></p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>User Management</h1>
      
      <UserSwitcher />
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Current User Info</h2>
        <div style={{ 
          padding: '1rem', 
          border: '1px solid #ddd', 
          borderRadius: '4px',
          backgroundColor: '#f8f9fa'
        }}>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> <span style={{ color: getRoleColor(user?.role || 'viewer') }}>{getRoleDisplayName(user?.role || 'viewer')}</span></p>
          <p><strong>Can Manage Users:</strong> {canManageUsers() ? 'Yes' : 'No'}</p>
          <p><strong>Is Admin:</strong> {isAdmin() ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <AdminOnly fallback={<div>You need admin privileges to view the user list.</div>}>
        <h2>All Users</h2>
        
        {isLoading ? (
          <p>Loading users...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Last Login</th>
                  <SuperAdminOnly>
                    <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
                  </SuperAdminOnly>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{u.name}</td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{u.email}</td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                      <span style={{ color: getRoleColor(u.role), fontWeight: 'bold' }}>
                        {getRoleDisplayName(u.role)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{u.status}</td>
                    <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <SuperAdminOnly>
                      <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                        <select 
                          value={u.role} 
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          style={{ padding: '0.25rem' }}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="user">User</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                    </SuperAdminOnly>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminOnly>
    </div>
  );
};

export default UserManagement;