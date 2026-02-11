import { render, screen } from '@testing-library/react'
import { SpendingChart } from '@/components/spending-chart'

describe('SpendingChart', () => {
  it('shows empty state when no periods', () => {
    render(<SpendingChart periods={[]} fixedExpenses={[]} />)
    expect(
      screen.getByText('Add a period to see the chart'),
    ).toBeInTheDocument()
  })
})
