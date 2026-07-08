import { render, screen } from '@testing-library/react'
import { SpendingChart } from '@/components/spending-chart'

const rechartsProps: {
  barChartMargin?: { left?: number }
  yAxisWidth?: number
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
  LabelList: () => <div />,
  ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Tooltip: () => <div />,
  XAxis: () => <div />,
  YAxis: ({ width }: { width?: number }) => {
    rechartsProps.yAxisWidth = width
    return <div />
  },
}))

describe('SpendingChart', () => {
  beforeEach(() => {
    rechartsProps.barChartMargin = undefined
    rechartsProps.yAxisWidth = undefined
  })

  it('shows empty state when no periods', () => {
    render(<SpendingChart periods={[]} fixedExpenses={[]} />)
    expect(
      screen.getByText('Add a period to see the chart'),
    ).toBeInTheDocument()
  })

  it('reserves enough space for y-axis labels', () => {
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

    expect(rechartsProps.barChartMargin?.left).toBeGreaterThanOrEqual(0)
    expect(rechartsProps.yAxisWidth).toBeGreaterThanOrEqual(64)
  })
})
