import { fireEvent, render, screen } from '@testing-library/react'
import { FixedExpensesCard } from '@/components/fixed-expenses-card'

describe('FixedExpensesCard', () => {
  beforeEach(() => {
    Object.defineProperty(global.crypto, 'randomUUID', {
      configurable: true,
      value: jest.fn(() => 'fx-new'),
    })
  })

  it('adds a fixed expense with a payment day', () => {
    const handleAdd = jest.fn()

    render(
      <FixedExpensesCard
        items={[]}
        onAdd={handleAdd}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText('e.g. Netflix'), {
      target: { value: 'Internet' },
    })
    fireEvent.change(screen.getByPlaceholderText('e.g. 12.99'), {
      target: { value: '22' },
    })
    fireEvent.change(screen.getByPlaceholderText('Day'), {
      target: { value: '21' },
    })
    fireEvent.click(screen.getByTestId('fixed-expenses-add'))

    expect(handleAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Internet',
        amount: 22,
        paymentDay: 21,
      }),
    )
  })

  it('edits an existing fixed expense', () => {
    const handleUpdate = jest.fn()

    render(
      <FixedExpensesCard
        items={[{ id: 'fx-1', name: 'Internet', amount: 19, paymentDay: 19 }]}
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
    fireEvent.change(screen.getByLabelText('Fixed expense payment day'), {
      target: { value: '21' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(handleUpdate).toHaveBeenCalledWith({
      id: 'fx-1',
      name: 'Broadband',
      amount: 22,
      paymentDay: 21,
    })
  })
})
