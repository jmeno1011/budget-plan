import { render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/hero-section'

describe('HeroSection', () => {
  it('renders the shared budget and AI cleanup story', () => {
    render(<HeroSection />)
    expect(
      screen.getByRole('heading', {
        name: /shared spending, without the bank switch/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/one person uses monzo/i)).toBeInTheDocument()
    expect(screen.getByText(/another uses revolut/i)).toBeInTheDocument()
    expect(screen.getAllByText(/ai category cleanup/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/ai sorted: food/i).length).toBeGreaterThan(0)
  })
})
