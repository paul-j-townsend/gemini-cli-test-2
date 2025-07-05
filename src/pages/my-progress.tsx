import React from 'react';
import { UserSwitcher } from '../components/UserSwitcher';
import { UserProgressDashboard } from '../components/UserProgressDashboard';
import { useAuth } from '../hooks/useAuth';

const MyProgress: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>My Learning Progress</h1>
        <p>Please log in to view your progress.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <UserSwitcher />
      <UserProgressDashboard />
    </div>
  );
};

export default MyProgress;