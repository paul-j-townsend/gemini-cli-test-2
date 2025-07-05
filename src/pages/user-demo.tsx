import React from 'react';
import { UserSwitcher } from '../components/UserSwitcher';
import { Dashboard } from '../components/Dashboard';

const UserDemo: React.FC = () => {
  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Multi-User Demo</h1>
      <p>This page demonstrates the multi-user functionality with dummy data.</p>
      
      <UserSwitcher />
      <Dashboard />
    </div>
  );
};

export default UserDemo;