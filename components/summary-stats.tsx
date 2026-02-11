"use client";

import {
  TrendingUp,
  TrendingDown,
  Calendar,
  PoundSterling,
} from "lucide-react";
import type { FixedExpense, Period } from "@/lib/types";

interface SummaryStatsProps {
  periods: Period[];
  fixedExpenses?: FixedExpense[];
}

export function SummaryStats({ periods, fixedExpenses = [] }: SummaryStatsProps) {
  const fixedTotal = fixedExpenses.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const periodTotal = (period: Period) =>
    period.expenses.reduce((s, exp) => s + exp.amount, 0) +
    (period.includeFixedExpenses ? fixedTotal : 0);

  const totalSpending = periods.reduce(
    (sum, period) => sum + periodTotal(period),
    0,
  );

  const periodTotals = periods.map((period) => ({
    name: period.name,
    total: periodTotal(period),
  }));

  const averagePerPeriod =
    periods.length > 0 ? totalSpending / periods.length : 0;

  const maxPeriod = periodTotals.reduce(
    (max, p) => (p.total > max.total ? p : max),
    periodTotals[0] || { name: "-", total: 0 },
  );

  const minPeriod = periodTotals.reduce(
    (min, p) => (p.total < min.total ? p : min),
    periodTotals[0] || { name: "-", total: 0 },
  );

  const formatMoney = (value: number) => {
    if (value < 0) {
      return `-£${Math.abs(value).toFixed(2)}`;
    }
    return `£${value.toFixed(2)}`;
  };

  const stats = [
    {
      label: "Total spent",
      value: formatMoney(totalSpending),
      icon: PoundSterling,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Average per period",
      value: formatMoney(averagePerPeriod),
      icon: Calendar,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      label: "Highest spend period",
      value: maxPeriod.name,
      subValue: formatMoney(maxPeriod.total),
      icon: TrendingUp,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Lowest spend period",
      value: minPeriod?.name || "-",
      subValue: minPeriod ? formatMoney(minPeriod.total) : "",
      icon: TrendingDown,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-card p-2 sm:rounded-xl sm:p-3"
        >
          <div className="flex items-start gap-2 sm:gap-2.5">
            <div
              className={`shrink-0 rounded-full p-1.5 sm:p-1.5 ${stat.bgColor}`}
            >
              <stat.icon
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.color}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-sm font-bold text-card-foreground truncate sm:text-base">
                {stat.value}
              </p>
              {stat.subValue && (
                <p className="text-xs text-muted-foreground">
                  {stat.subValue}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
