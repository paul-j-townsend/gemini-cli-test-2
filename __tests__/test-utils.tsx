import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { UserContext } from '@/contexts/UserContext'
import { User } from '@/types/database'

// Mock user data for testing
export const mockUser: User = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z'
}

export const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-user-id',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null
  isAuthenticated?: boolean
}

function AllTheProviders({ 
  children, 
  user = mockUser, 
  isAuthenticated = true 
}: { 
  children: React.ReactNode
  user?: User | null
  isAuthenticated?: boolean
}) {
  const mockUserContextValue = {
    user: isAuthenticated ? user : null,
    loading: false,
    isAuthenticated,
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
    refreshPaymentStatus: jest.fn(),
    hasAccess: jest.fn().mockReturnValue(true),
    hasRole: jest.fn().mockReturnValue(true)
  }

  return (
    <UserContext.Provider value={mockUserContextValue}>
      {children}
    </UserContext.Provider>
  )
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { user, isAuthenticated, ...renderOptions } = options
  
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} user={user} isAuthenticated={isAuthenticated} />,
    ...renderOptions,
  })
}

// Mock quiz data
export const mockQuiz = {
  id: 'quiz-1',
  title: 'Test Quiz',
  description: 'Test quiz description',
  questions: [
    {
      id: 'q1',
      question: 'What is 2+2?',
      explanation: 'Basic math',
      rationale: 'Simple addition',
      learning_outcome: 'Math skills',
      answers: [
        { id: 'a1', answer: '3', is_correct: false },
        { id: 'a2', answer: '4', is_correct: true },
        { id: 'a3', answer: '5', is_correct: false },
      ]
    }
  ]
}

// Mock content data
export const mockContent = {
  id: 'content-1',
  title: 'Test Content',
  description: 'Test content description',
  price_cents: 2999,
  special_offer_price_cents: 1999,
  special_offer_active: true,
  is_purchasable: true,
  audio_url: 'https://example.com/audio.mp3',
  quiz_id: 'quiz-1'
}

// Mock API responses
export const mockApiResponse = {
  success: <T>(data: T) => ({
    ok: true,
    json: async () => ({ success: true, data }),
    status: 200
  }),
  error: (message: string, status = 400) => ({
    ok: false,
    json: async () => ({ success: false, error: message }),
    status
  })
}

// Test utilities for async operations
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0))

// Mock local storage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Mock window location
export const mockLocation = {
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  href: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: ''
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'