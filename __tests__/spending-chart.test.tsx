import { render, screen } from '@testing-library/react'
import { SpendingChart } from '@/components/spending-chart'

const rechartsProps: {
  barChartMargin?: { left?: number }
  yAxisRendered?: boolean
} = {}

jest.mock('recharts', () => ({
  Bar: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({
    children,
    margin,
  }: {
    children?: React.ReactNode
    margin?: { left?: number }
  }) => {
    rechartsProps.barChartMargin = margin
    return <div>{children}</div>
  },
  CartesianGrid: () => <div />,
  Cell: () => <div />,
  LabelList: ({ content }: { content?: (props: Record<string, unknown>) => React.ReactNode }) => (
    <svg>
      {content?.({ x: 1, y: 1, width: 10, height: 20, value: 1473.91 })}
    </svg>
  ),
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => <div />,
  XAxis: () => <div />,
  YAxis: () => {
    rechartsProps.yAxisRendered = true
    return <div />
  },
}))

describe('SpendingChart', () => {
  beforeEach(() => {
    rechartsProps.barChartMargin = undefined
    rechartsProps.yAxisRendered = false
  })

  it('shows empty state when no periods', () => {
    render(<SpendingChart periods={[]} fixedExpenses={[]} />)
    expect(
      screen.getByText('Add a period to see the chart'),
    ).toBeInTheDocument()
  })

  it('does not render y-axis labels and hides bar value labels on mobile', () => {
    render(
      <SpendingChart
        periods={[
          {
            id: 'p-1',
            name: 'January',
            startDate: '2026-01-01',
            endDate: '2026-01-31',
            expenses: [{ id: 'e-1', date: '2026-01-01', amount: 1473.91 }],
          },
        ]}
        fixedExpenses={[]}
      />,
    )

    expect(rechartsProps.barChartMargin?.left).toBe(0)
    expect(rechartsProps.yAxisRendered).toBe(false)
    expect(screen.getByText('£1473.91')).toHaveClass('hidden', 'sm:inline')
  })
})
