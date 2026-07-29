import { render, screen } from '@testing-library/react'
import { PageLoading } from '@/components/page-loading'

describe('PageLoading', () => {
  it('shows an animated loading state with a descriptive message', () => {
    render(<PageLoading message="Syncing budgets" />)

    expect(screen.getByRole('status', { name: /syncing budgets/i })).toBeInTheDocument()
    expect(screen.getByText('Syncing budgets')).toBeInTheDocument()
  })
})
