"use client"

import { format, parseISO } from "date-fns"
import { enGB } from "date-fns/locale"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExpenseForm } from "@/components/expense-form"
import type { Expense } from "@/lib/types"

interface DateExpenseGroupProps {
  date: string
  expenses: Expense[]
  onAdd: (date: string) => void
  onUpdate: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function DateExpenseGroup({
  date,
  expenses,
  onAdd,
  onUpdate,
  onDelete,
}: DateExpenseGroupProps) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const formattedDate = format(parseISO(date), "d MMM (EEE)", {
    locale: enGB,
  })

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-2 sm:p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-primary sm:text-base">
          {formattedDate}
        </p>
        <p className="text-xs font-semibold text-foreground sm:text-sm">
          Day total £{total.toFixed(2)}
        </p>
      </div>

      {expenses.length > 0 ? (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <ExpenseForm
              key={expense.id}
              expense={expense}
              onUpdate={onUpdate}
              onDelete={onDelete}
              showDate={false}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-background px-3 py-2 text-xs text-muted-foreground">
          No spending entries for this day.
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2 w-full sm:w-auto"
        onClick={() => onAdd(date)}
      >
        <Plus className="h-4 w-4" />
        Add item
      </Button>
    </div>
  )
}
