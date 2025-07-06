export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
}

export const dummyUsers: User[] = [
  {
    id: 'fed2a63e-196d-43ff-9ebc-674db34e72a7',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'user'
  },
  {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'viewer'
  }
];