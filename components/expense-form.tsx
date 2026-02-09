"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { enGB } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES, type Expense, type CategoryValue } from "@/lib/types"

interface ExpenseFormProps {
  expense: Expense
  onUpdate: (expense: Expense) => void
}

export function ExpenseForm({ expense, onUpdate }: ExpenseFormProps) {
  const formatAmountInput = (amount: number) => (amount === 0 ? "" : String(amount))
  const [amountInput, setAmountInput] = useState(formatAmountInput(expense.amount))

  useEffect(() => {
    setAmountInput(formatAmountInput(expense.amount))
  }, [expense.amount])

  const handleAmountChange = (value: string) => {
    setAmountInput(value)
    if (value === "") {
      onUpdate({ ...expense, amount: 0 })
      return
    }
    if (value === "-" || value === "." || value === "-.") return
    const amount = Number(value)
    if (Number.isNaN(amount)) return
    onUpdate({ ...expense, amount })
  }

  const handleAmountBlur = () => {
    if (amountInput === "-" || amountInput === "." || amountInput === "-.") {
      setAmountInput(formatAmountInput(expense.amount))
    }
  }

  const handleMemoChange = (value: string) => {
    onUpdate({ ...expense, memo: value })
  }

  const handleCategoryChange = (value: string) => {
    onUpdate({ ...expense, category: value === "none" ? undefined : value as CategoryValue })
  }

  const formattedDate = format(parseISO(expense.date), "d MMM (EEE)", {
    locale: enGB,
  })

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-2 sm:p-3">
      <div className="mb-1.5 text-xs font-medium text-primary sm:mb-2 sm:text-sm">
        {formattedDate}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className="relative w-24 shrink-0 sm:w-28">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground sm:left-3 sm:text-sm">
            £
          </span>
          <Input
            type="number"
            step="0.01"
            value={amountInput}
            onChange={(e) => handleAmountChange(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            onBlur={handleAmountBlur}
            placeholder="0.00"
            className="h-8 bg-background border-border pl-6 text-sm text-foreground placeholder:text-muted-foreground sm:h-9 sm:pl-7 sm:text-base"
          />
        </div>

        <div className="min-w-36 flex-1 sm:w-28 sm:flex-none">
          <Select
            value={expense.category || "none"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="h-8 w-full bg-background border-border text-xs text-foreground sm:h-9 sm:text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent
              className="bg-popover border-border select-content-compact"
              align="start"
              sideOffset={6}
              collisionPadding={12}
            >
              <SelectItem value="none" className="text-muted-foreground">
                No category
              </SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full flex-1 basis-full sm:basis-auto sm:min-w-32">
          <Input
            value={expense.memo || ""}
            onChange={(e) => handleMemoChange(e.target.value)}
            placeholder="Notes (optional)"
            className="h-8 bg-background border-border text-sm text-foreground placeholder:text-muted-foreground sm:h-9 sm:text-base"
          />
        </div>
      </div>
    </div>
  )
}
