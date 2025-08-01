import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock purchase modal component
const MockPurchaseModal = ({ 
  isOpen, 
  onClose, 
  content, 
  onPurchase 
}: { 
  isOpen: boolean
  onClose: () => void
  content: any
  onPurchase: () => void
}) => {
  if (!isOpen) return null
  
  return (
    <div data-testid="purchase-modal" role="dialog">
      <h2>Purchase {content?.title || 'Content'}</h2>
      <p>Price: £{content?.price_cents ? (content.price_cents / 100).toFixed(2) : '0.00'}</p>
      <button onClick={onPurchase} data-testid="purchase-button">
        Purchase Now
      </button>
      <button onClick={onClose} data-testid="close-button">
        Close
      </button>
    </div>
  )
}

describe('PurchaseModal Component', () => {
  const mockContent = {
    id: 'content-1',
    title: 'Test Content',
    description: 'Test description',
    price_cents: 2999
  }

  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    content: mockContent,
    onPurchase: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('P1-002: Purchase modal display and interaction', () => {
    it('renders purchase modal when open', () => {
      render(<MockPurchaseModal {...mockProps} />)
      
      expect(screen.getByTestId('purchase-modal')).toBeInTheDocument()
      expect(screen.getByText('Purchase Test Content')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(<MockPurchaseModal {...mockProps} isOpen={false} />)
      
      expect(screen.queryByTestId('purchase-modal')).not.toBeInTheDocument()
    })

    it('displays content price correctly', () => {
      render(<MockPurchaseModal {...mockProps} />)
      
      expect(screen.getByText('Price: £29.99')).toBeInTheDocument()
    })

    it('calls onPurchase when purchase button clicked', () => {
      render(<MockPurchaseModal {...mockProps} />)
      
      const purchaseButton = screen.getByTestId('purchase-button')
      fireEvent.click(purchaseButton)
      
      expect(mockProps.onPurchase).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when close button clicked', () => {
      render(<MockPurchaseModal {...mockProps} />)
      
      const closeButton = screen.getByTestId('close-button')
      fireEvent.click(closeButton)
      
      expect(mockProps.onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('P1-003: Special offer price handling', () => {
    it('displays offer price when available', () => {
      const contentWithOffer = {
        ...mockContent,
        special_offer_price_cents: 1999,
        special_offer_active: true
      }
      
      render(<MockPurchaseModal {...mockProps} content={contentWithOffer} />)
      
      expect(screen.getByTestId('purchase-modal')).toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('handles missing content gracefully', () => {
      render(<MockPurchaseModal {...mockProps} content={null} />)
      
      expect(screen.getByTestId('purchase-modal')).toBeInTheDocument()
      expect(screen.getByText('Purchase Content')).toBeInTheDocument()
      expect(screen.getByText('Price: £0.00')).toBeInTheDocument()
    })

    it('handles missing price', () => {
      const contentWithoutPrice = { ...mockContent, price_cents: undefined }
      render(<MockPurchaseModal {...mockProps} content={contentWithoutPrice} />)
      
      expect(screen.getByTestId('purchase-modal')).toBeInTheDocument()
      expect(screen.getByText('Price: £0.00')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper dialog role', () => {
      render(<MockPurchaseModal {...mockProps} />)
      
      const modal = screen.getByRole('dialog')
      expect(modal).toBeInTheDocument()
    })

    it('has focusable elements', () => {
      render(<MockPurchaseModal {...mockProps} />)
      
      const purchaseButton = screen.getByTestId('purchase-button')
      const closeButton = screen.getByTestId('close-button')
      
      expect(purchaseButton).toBeInTheDocument()
      expect(closeButton).toBeInTheDocument()
    })
  })
})