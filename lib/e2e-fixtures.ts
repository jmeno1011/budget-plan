import type { FixedExpense, Period } from "@/lib/types"

export const e2eFixedExpenses: FixedExpense[] = [
  {
    id: "fx-1",
    name: "Netflix",
    amount: 5,
  },
]

export const e2ePeriods: Period[] = [
  {
    id: "p-1",
    name: "Alpha period",
    startDate: "2026-01-01",
    endDate: "2026-01-02",
    includeFixedExpenses: true,
    expenses: [
      {
        id: "e-1",
        date: "2026-01-01",
        amount: 10,
        memo: "Groceries",
        category: "food",
      },
      {
        id: "e-2",
        date: "2026-01-02",
        amount: 5,
        memo: "Transport",
        category: "transport",
      },
    ],
  },
  {
    id: "p-2",
    name: "Beta period",
    startDate: "2026-02-01",
    endDate: "2026-02-02",
    includeFixedExpenses: false,
    expenses: [
      {
        id: "e-3",
        date: "2026-02-01",
        amount: 10,
        memo: "Utilities",
        category: "utilities",
      },
    ],
  },
]
