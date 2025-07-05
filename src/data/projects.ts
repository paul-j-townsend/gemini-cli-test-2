export interface Project {
  id: string;
  name: string;
  description: string;
  userId: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Admin Dashboard',
    description: 'Main admin dashboard for system management',
    userId: '1',
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'User Analytics',
    description: 'Analytics dashboard for user behavior',
    userId: '1',
    status: 'completed',
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Mobile App',
    description: 'React Native mobile application',
    userId: '2',
    status: 'active',
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    name: 'API Integration',
    description: 'Third-party API integration project',
    userId: '2',
    status: 'active',
    createdAt: '2024-01-25'
  },
  {
    id: '5',
    name: 'Documentation',
    description: 'Project documentation and guides',
    userId: '3',
    status: 'completed',
    createdAt: '2024-01-05'
  },
  {
    id: '6',
    name: 'Testing Suite',
    description: 'Automated testing implementation',
    userId: '1',
    status: 'archived',
    createdAt: '2024-01-01'
  }
];