import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { db } from '../services/database';
import { User } from '../types/database';
import { getRoleDisplayName, getRoleColor } from '../utils/permissions';

export const UserSwitcher: React.FC = () => {
  const { user, setUser } = useUser();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await db.findAllUsers();
        setAvailableUsers(users);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleUserChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUserId = event.target.value;
    if (!selectedUserId) {
      setUser(null);
      return;
    }

    try {
      const selectedUser = await db.findUserById(selectedUserId);
      if (selectedUser) {
        setUser(selectedUser);
        await db.updateLastLogin(selectedUser.id);
      }
    } catch (error) {
      console.error('Failed to switch user:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        padding: '1rem', 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        backgroundColor: '#f9f9f9',
        marginBottom: '1rem'
      }}>
        <h3>🔧 Dev Tools: User Switcher</h3>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '1rem', 
      border: '1px solid #ccc', 
      borderRadius: '4px',
      backgroundColor: '#f9f9f9',
      marginBottom: '1rem'
    }}>
      <h3>🔧 Dev Tools: User Switcher</h3>
      <div style={{ marginBottom: '0.5rem' }}>
        <label htmlFor="user-switcher">Switch User: </label>
        <select 
          id="user-switcher"
          value={user?.id || ''} 
          onChange={handleUserChange}
          style={{ marginLeft: '0.5rem', padding: '0.25rem' }}
        >
          <option value="">Select a user...</option>
          {availableUsers.map(availableUser => (
            <option key={availableUser.id} value={availableUser.id}>
              {availableUser.name} ({getRoleDisplayName(availableUser.role)})
            </option>
          ))}
        </select>
      </div>
      
      {user && (
        <div style={{ 
          fontSize: '0.9rem', 
          color: '#666',
          marginTop: '0.5rem'
        }}>
          <div>
            <strong>Current User:</strong> {user.name} ({user.email})
          </div>
          <div>
            <strong>Role:</strong> 
            <span style={{ 
              color: getRoleColor(user.role), 
              fontWeight: 'bold',
              marginLeft: '0.25rem'
            }}>
              {getRoleDisplayName(user.role)}
            </span>
          </div>
          <div>
            <strong>Status:</strong> {user.status}
          </div>
          <div>
            <strong>Last Login:</strong> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
          </div>
        </div>
      )}
    </div>
  );
};