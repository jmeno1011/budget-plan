export interface Expense {
  id: string
  date: string
  amount: number
  memo?: string
  category?: string
}

export interface Period {
  id: string
  name: string
  startDate: string
  endDate: string
  expenses: Expense[]
  budget?: number
  includeFixedExpenses?: boolean
}

export interface FixedExpense {
  id: string
  name: string
  amount: number
}

export interface SharedBudget {
  id: string
  name: string
  description?: string
  ownerUid: string
  memberUids: string[]
  members?: Array<{
    uid: string
    name?: string
    email?: string
  }>
  periods: Period[]
  fixedExpenses?: FixedExpense[]
  inviteCode?: string
}

export const CATEGORIES = [
  { value: "food", label: "Food" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
  { value: "entertainment", label: "Leisure" },
  { value: "utilities", label: "Utilities" },
  { value: "health", label: "Health" },
  { value: "other", label: "Other" },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]["value"]
