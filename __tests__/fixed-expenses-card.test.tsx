import { fireEvent, render, screen } from '@testing-library/react'
import { FixedExpensesCard } from '@/components/fixed-expenses-card'

describe('FixedExpensesCard', () => {
  it('edits an existing fixed expense', () => {
    const handleUpdate = jest.fn()

    render(
      <FixedExpensesCard
        items={[{ id: 'fx-1', name: 'Internet', amount: 19 }]}
        onAdd={jest.fn()}
        onUpdate={handleUpdate}
        onDelete={jest.fn()}
      />,
    )

    fireEvent.click(screen.getByLabelText('Edit fixed expense'))
    fireEvent.change(screen.getByLabelText('Fixed expense name'), {
      target: { value: 'Broadband' },
    })
    fireEvent.change(screen.getByLabelText('Fixed expense amount'), {
      target: { value: '22' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(handleUpdate).toHaveBeenCalledWith({
      id: 'fx-1',
      name: 'Broadband',
      amount: 22,
    })
  })
})
