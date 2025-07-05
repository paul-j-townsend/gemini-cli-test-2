import React from 'react';
import { useUser } from '../contexts/UserContext';
import { mockProjects } from '../data/projects';

export const Dashboard: React.FC = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user logged in</div>;
  }

  const userProjects = mockProjects.filter(project => project.userId === user.id);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Dashboard</h1>
      
      <div style={{ 
        padding: '1rem', 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        marginBottom: '1rem',
        backgroundColor: '#f8f9fa'
      }}>
        <h2>Welcome, {user.name}!</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      <div>
        <h3>Your Projects ({userProjects.length})</h3>
        {userProjects.length === 0 ? (
          <p>No projects found for this user.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {userProjects.map(project => (
              <div 
                key={project.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#fff'
                }}
              >
                <h4>{project.name}</h4>
                <p>{project.description}</p>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  <span>Status: <strong>{project.status}</strong></span>
                  <span>Created: {project.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {user.role === 'admin' && (
        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          border: '1px solid #ffa500',
          borderRadius: '4px',
          backgroundColor: '#fff8dc'
        }}>
          <h3>🔐 Admin Panel</h3>
          <p>You have admin privileges. Here you could manage all users and projects.</p>
        </div>
      )}
    </div>
  );
};