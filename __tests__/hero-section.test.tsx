import { render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/hero-section'

describe('HeroSection', () => {
  it('renders the shared budget story headline', () => {
    render(<HeroSection />)
    expect(
      screen.getByRole('heading', {
        name: /share a budget without sharing a bank/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/one person uses monzo/i)).toBeInTheDocument()
    expect(screen.getByText(/another uses revolut/i)).toBeInTheDocument()
  })
})
