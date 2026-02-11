import type { FixedExpense, Period, SharedBudget } from "@/lib/types"

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

export const e2eSharedBudgets: SharedBudget[] = [
  {
    id: "sb-1",
    name: "Shared Alpha",
    description: "Local shared budget",
    ownerUid: "e2e-user",
    memberUids: ["e2e-user", "member-1"],
    members: [
      { uid: "e2e-user", name: "E2E User" },
      { uid: "member-1", name: "Alex" },
    ],
    inviteCode: "INVITE123",
    fixedExpenses: [
      { id: "sfx-1", name: "Netflix", amount: 5 },
    ],
    periods: [
      {
        id: "sp-1",
        name: "Shared Alpha",
        startDate: "2026-02-01",
        endDate: "2026-02-02",
        includeFixedExpenses: true,
        expenses: [
          { id: "se-1", date: "2026-02-01", amount: 10 },
          { id: "se-2", date: "2026-02-02", amount: 5 },
        ],
      },
      {
        id: "sp-2",
        name: "Shared Beta",
        startDate: "2026-03-01",
        endDate: "2026-03-01",
        includeFixedExpenses: false,
        expenses: [{ id: "se-3", date: "2026-03-01", amount: 8 }],
      },
    ],
  },
  {
    id: "sb-2",
    name: "Shared Empty",
    description: "No periods yet",
    ownerUid: "e2e-user",
    memberUids: ["e2e-user"],
    members: [{ uid: "e2e-user", name: "E2E User" }],
    periods: [],
    fixedExpenses: [],
  },
]
