import { fireEvent, render, screen } from '@testing-library/react'
import { DateExpenseGroup } from '@/components/date-expense-group'

describe('DateExpenseGroup', () => {
  it('shows multiple entries for one day with an automatic day total', () => {
    render(
      <DateExpenseGroup
        date="2026-06-01"
        expenses={[
          { id: 'e-1', date: '2026-06-01', amount: 54.74, memo: 'water' },
          { id: 'e-2', date: '2026-06-01', amount: 113.67, memo: 'elect' },
          { id: 'e-3', date: '2026-06-01', amount: 46.45, memo: 'asda' },
        ]}
        onAdd={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    )

    expect(screen.getByText('1 Jun (Mon)')).toBeInTheDocument()
    expect(screen.getByText('Day total £214.86')).toBeInTheDocument()
    expect(screen.getByDisplayValue('water')).toBeInTheDocument()
    expect(screen.getByDisplayValue('elect')).toBeInTheDocument()
    expect(screen.getByDisplayValue('asda')).toBeInTheDocument()
  })

  it('adds a new entry for the day', () => {
    const handleAdd = jest.fn()

    render(
      <DateExpenseGroup
        date="2026-06-01"
        expenses={[]}
        onAdd={handleAdd}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /add item/i }))

    expect(handleAdd).toHaveBeenCalledWith('2026-06-01')
  })
})
