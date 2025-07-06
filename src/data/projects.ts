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
    id: 'a1b2c3d4-e5f6-7890-abcd-123456789abc',
    name: 'Admin Dashboard',
    description: 'Main admin dashboard for system management',
    userId: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: 'b2c3d4e5-f6g7-8901-bcde-234567890bcd',
    name: 'User Analytics',
    description: 'Analytics dashboard for user behavior',
    userId: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
    status: 'completed',
    createdAt: '2024-01-10'
  },
  {
    id: 'c3d4e5f6-g7h8-9012-cdef-345678901cde',
    name: 'Mobile App',
    description: 'React Native mobile application',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    status: 'active',
    createdAt: '2024-01-20'
  },
  {
    id: 'd4e5f6g7-h8i9-0123-def0-456789012def',
    name: 'API Integration',
    description: 'Third-party API integration project',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    status: 'active',
    createdAt: '2024-01-25'
  },
  {
    id: 'e5f6g7h8-i9j0-1234-ef01-567890123ef0',
    name: 'Documentation',
    description: 'Project documentation and guides',
    userId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    status: 'completed',
    createdAt: '2024-01-05'
  },
  {
    id: 'f6g7h8i9-j0k1-2345-f012-678901234f01',
    name: 'Testing Suite',
    description: 'Automated testing implementation',
    userId: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
    status: 'archived',
    createdAt: '2024-01-01'
  }
];