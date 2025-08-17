import React, { useState, useEffect } from 'react';
import { ChevronDown, Users } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { userService } from '../services/userService';
import { User } from '../types/database';
import { getRoleDisplayName, getRoleColor } from '../utils/permissions';

export const HeaderUserSwitcher: React.FC = () => {
  const { user, setUser } = useUser();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await userService.findAllUsers();
        setAvailableUsers(users);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleUserChange = async (selectedUser: User) => {
    try {
      setUser(selectedUser);
      await userService.updateLastLogin(selectedUser.id);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch user:', error);
    }
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors duration-200 text-sm"
        style={{ 
          outline: 'none', 
          border: '1px solid #fbbf24',
          boxShadow: 'none'
        }}
      >
        <Users size={14} className="text-yellow-600" />
        <span className="text-yellow-800 font-medium">DEV: {user.name}</span>
        <ChevronDown size={14} className={`text-yellow-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white border border-emerald-200 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-emerald-100">
              <div className="text-xs font-medium text-emerald-500 uppercase tracking-wider">
                🔧 Dev Tools: User Switcher
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {availableUsers.map((availableUser) => (
                <button
                  key={availableUser.id}
                  onClick={() => handleUserChange(availableUser)}
                  className={`w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors duration-150 ${
                    user.id === availableUser.id ? 'bg-emerald-50 border-l-2 border-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-emerald-900">
                        {availableUser.name}
                      </div>
                      <div className="text-xs text-emerald-500">
                        {availableUser.email}
                      </div>
                    </div>
                    <div>
                      <span 
                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                        style={{ 
                          backgroundColor: `${getRoleColor(availableUser.role)}20`,
                          color: getRoleColor(availableUser.role)
                        }}
                      >
                        {getRoleDisplayName(availableUser.role)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {user && (
              <div className="p-3 border-t border-emerald-100 bg-emerald-50">
                <div className="text-xs text-emerald-600">
                  <div><strong>Current:</strong> {user.name}</div>
                  <div><strong>Role:</strong> <span style={{ color: getRoleColor(user.role) }}>{getRoleDisplayName(user.role)}</span></div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};