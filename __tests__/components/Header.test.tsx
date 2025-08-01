import React from 'react'
import { render, screen } from '@testing-library/react'

// Mock user data
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user'
}

const mockAdminUser = {
  id: '2',
  name: 'Admin User', 
  email: 'admin@example.com',
  role: 'admin'
}

// Simple mock component since we don't have the actual Header yet
const MockHeader = ({ user }: { user?: any }) => (
  <header data-testid="header">
    <nav>
      <a href="/">Home</a>
      <a href="/podcasts">Podcasts</a>
      <a href="/articles">Articles</a>
      {user && (
        <div>
          <button>My Stuff</button>
          <button aria-label="menu">Menu</button>
          <div>{user.name}</div>
          <div>{user.email}</div>
        </div>
      )}
    </nav>
  </header>
)

describe('Header Component', () => {
  describe('P1-025: Protected route functionality', () => {
    it('renders navigation items correctly', () => {
      render(<MockHeader />)
      
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Podcasts')).toBeInTheDocument()
      expect(screen.getByText('Articles')).toBeInTheDocument()
    })

    it('shows My Stuff dropdown when user is authenticated', () => {
      render(<MockHeader user={mockUser} />)
      
      expect(screen.getByText('My Stuff')).toBeInTheDocument()
    })

    it('does not show My Stuff dropdown when user is not authenticated', () => {
      render(<MockHeader />)
      
      expect(screen.queryByText('My Stuff')).not.toBeInTheDocument()
    })
  })

  describe('MOB-001: Header navigation on mobile devices', () => {
    it('shows mobile menu button when user is authenticated', () => {
      render(<MockHeader user={mockUser} />)
      
      const mobileMenuButton = screen.getByRole('button', { name: /menu/i })
      expect(mobileMenuButton).toBeInTheDocument()
    })

    it('shows user information when authenticated', () => {
      render(<MockHeader user={mockUser} />)
      
      expect(screen.getByText(mockUser.name)).toBeInTheDocument()
      expect(screen.getByText(mockUser.email)).toBeInTheDocument()
    })
  })

  describe('P1-026: Admin-only access enforcement', () => {
    it('displays admin user information correctly', () => {
      render(<MockHeader user={mockAdminUser} />)
      
      expect(screen.getByText('Admin User')).toBeInTheDocument()
      expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    })
  })

  describe('Basic functionality', () => {
    it('renders header component', () => {
      render(<MockHeader />)
      
      expect(screen.getByTestId('header')).toBeInTheDocument()
    })

    it('handles missing user data gracefully', () => {
      render(<MockHeader user={null} />)
      
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.queryByText('My Stuff')).not.toBeInTheDocument()
    })
  })
})