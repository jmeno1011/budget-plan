import { render, screen } from '@testing-library/react'
import { SummaryStats } from '@/components/summary-stats'

describe('SummaryStats', () => {
  it('includes fixed expenses when flagged', () => {
    const fixedExpenses = [{ id: 'fx-1', name: 'Netflix', amount: 5 }]
    const periods = [
      {
        id: 'p-1',
        name: 'Alpha',
        startDate: '2026-01-01',
        endDate: '2026-01-02',
        includeFixedExpenses: true,
        expenses: [{ id: 'e-1', date: '2026-01-01', amount: 20 }],
      },
      {
        id: 'p-2',
        name: 'Beta',
        startDate: '2026-02-01',
        endDate: '2026-02-02',
        includeFixedExpenses: false,
        expenses: [{ id: 'e-2', date: '2026-02-01', amount: 10 }],
      },
    ]

    render(<SummaryStats periods={periods} fixedExpenses={fixedExpenses} />)

    expect(screen.getByText('Total spent')).toBeInTheDocument()
    expect(screen.getByText('£35.00')).toBeInTheDocument()
    expect(screen.getByText('Average per period')).toBeInTheDocument()
    expect(screen.getByText('£17.50')).toBeInTheDocument()
    expect(screen.getByText('Highest spend period')).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('£25.00')).toBeInTheDocument()
    expect(screen.getByText('Lowest spend period')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('£10.00')).toBeInTheDocument()
  })
})
