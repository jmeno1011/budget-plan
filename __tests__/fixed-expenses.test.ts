import {
  getFixedExpensesForPeriod,
  getFixedExpensesTotalForPeriod,
  snapshotFixedExpenses,
} from "@/lib/fixed-expenses"
import type { FixedExpense, Period } from "@/lib/types"

const currentFixedExpenses: FixedExpense[] = [
  { id: "fx-current", name: "Internet", amount: 22 },
]

describe("fixed expense snapshots", () => {
  it("uses a period snapshot instead of the current fixed expenses", () => {
    const period: Period = {
      id: "p-1",
      name: "March",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      includeFixedExpenses: true,
      fixedExpensesSnapshot: [
        { id: "fx-snapshot", name: "Internet", amount: 19 },
      ],
      expenses: [{ id: "e-1", date: "2026-03-01", amount: 10 }],
    }

    expect(getFixedExpensesForPeriod(period, currentFixedExpenses)).toEqual([
      { id: "fx-snapshot", name: "Internet", amount: 19 },
    ])
    expect(getFixedExpensesTotalForPeriod(period, currentFixedExpenses)).toBe(19)
  })

  it("falls back to current fixed expenses for older periods without snapshots", () => {
    const period: Period = {
      id: "p-1",
      name: "Legacy",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      includeFixedExpenses: true,
      expenses: [],
    }

    expect(getFixedExpensesForPeriod(period, currentFixedExpenses)).toEqual(
      currentFixedExpenses,
    )
    expect(getFixedExpensesTotalForPeriod(period, currentFixedExpenses)).toBe(22)
  })

  it("copies fixed expenses into a snapshot", () => {
    const snapshot = snapshotFixedExpenses(currentFixedExpenses)

    expect(snapshot).toEqual(currentFixedExpenses)
    expect(snapshot).not.toBe(currentFixedExpenses)
    expect(snapshot[0]).not.toBe(currentFixedExpenses[0])
  })
})
