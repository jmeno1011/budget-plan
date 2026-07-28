import { fireEvent, render, screen } from '@testing-library/react'
import { PeriodCard } from '@/components/period-card'

describe('PeriodCard', () => {
  it('shows daily activity heatmap while keeping budget status and action text hidden', () => {
    render(
      <PeriodCard
        period={{
          id: 'p-1',
          name: 'July budget',
          startDate: '2026-07-01',
          endDate: '2026-07-02',
          budget: 100.99,
          expenses: [
            { id: 'e-1', date: '2026-07-01', amount: 0 },
            { id: 'e-2', date: '2026-07-02', amount: 100.99 },
          ],
        }}
        onDelete={jest.fn()}
      />,
    )

    expect(screen.queryByText(/Budget £100\.99/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Remaining/)).not.toBeInTheDocument()
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /edit period/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete period/i })).toBeInTheDocument()

    expect(screen.getByTestId('period-activity-day-2026-07-01')).toHaveClass('bg-muted')
    expect(screen.getByTestId('period-activity-day-2026-07-02')).toHaveClass('bg-primary/70')
    expect(screen.getByText('1 spent · 1 no-spend')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('period-card-header'))
    expect(screen.getByText('Spending entries')).toBeInTheDocument()
  })

  it('shows category breakdown on the period card header', () => {
    render(
      <PeriodCard
        period={{
          id: 'p-1',
          name: 'July budget',
          startDate: '2026-07-01',
          endDate: '2026-07-03',
          expenses: [
            { id: 'e-1', date: '2026-07-01', amount: 905, category: 'utilities' },
            { id: 'e-2', date: '2026-07-02', amount: 85, category: 'food' },
            { id: 'e-3', date: '2026-07-03', amount: 30, category: 'shopping' },
            { id: 'e-4', date: '2026-07-03', amount: 10 },
          ],
        }}
        onDelete={jest.fn()}
      />,
    )

    expect(screen.getByTestId('period-category-breakdown')).toBeInTheDocument()
    expect(screen.getByText('Utilities £905.00')).toBeInTheDocument()
    expect(screen.getByText('Food £85.00')).toBeInTheDocument()
    expect(screen.getByText('Shopping £30.00')).toBeInTheDocument()
    expect(screen.getByText('3 categories')).toBeInTheDocument()
  })
})
