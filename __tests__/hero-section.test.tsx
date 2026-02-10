import { render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/hero-section'

describe('HeroSection', () => {
  it('renders the main headline', () => {
    render(<HeroSection />)
    expect(
      screen.getByRole('heading', { name: /plan every period in one place/i })
    ).toBeInTheDocument()
  })
})
