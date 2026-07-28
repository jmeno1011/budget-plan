/// <reference types="jest" />
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeAll, beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals'
import { useState } from 'react'
import { ExpenseForm } from '@/components/expense-form'
import type { Expense } from '@/lib/types'

function ControlledExpenseForm({
  initialExpense,
  onUpdate,
}: {
  initialExpense: Expense
  onUpdate: (expense: Expense) => void
}) {
  const [expense, setExpense] = useState(initialExpense)

  return (
    <ExpenseForm
      expense={expense}
      onUpdate={(updatedExpense) => {
        setExpense(updatedExpense)
        onUpdate(updatedExpense)
      }}
    />
  )
}

describe('ExpenseForm', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn()
  })

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            category: 'food',
            confidence: 'high',
          }),
      } as Response),
    )
  })

  afterEach(() => {
    ;(global.fetch as jest.Mock).mockRestore()
  })

  it('automatically categorizes an uncategorized expense from the memo', async () => {
    const handleUpdate = jest.fn()

    render(
      <ControlledExpenseForm
        initialExpense={{
          id: 'expense-1',
          date: '2026-07-02',
          amount: 85,
          memo: '',
        }}
        onUpdate={handleUpdate}
      />,
    )

    expect(screen.queryByText('No category')).toBeNull()

    const memo = screen.getByPlaceholderText('Notes (optional)')
    fireEvent.change(memo, { target: { value: 'Food shop' } })
    fireEvent.blur(memo)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/categorize-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memo: 'Food shop', amount: 85 }),
      })
    })

    await waitFor(() => {
      expect(handleUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'food',
          categorySource: 'ai',
        }),
      )
    })
  })

  it('lets users edit an AI category manually', async () => {
    const handleUpdate = jest.fn()

    render(
      <ControlledExpenseForm
        initialExpense={{
          id: 'expense-1',
          date: '2026-07-02',
          amount: 85,
          memo: 'Food shop',
          category: 'food',
          categorySource: 'ai',
        }}
        onUpdate={handleUpdate}
      />,
    )

    expect(screen.getByText('AI sorted: Food')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /edit category/i }))
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(await screen.findByText('Shopping'))

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'shopping',
        categorySource: 'manual',
      }),
    )
  })
})
