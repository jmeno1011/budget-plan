"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { FixedExpense, Period } from "@/lib/types";
import { getTotalSpentForPeriod } from "@/lib/fixed-expenses";

interface SpendingChartProps {
  periods: Period[];
  fixedExpenses?: FixedExpense[];
}

export function SpendingChart({
  periods,
  fixedExpenses = [],
}: SpendingChartProps) {
  // Sort by start date (oldest first) to match the visual order on the right side
  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  const chartData = sortedPeriods.map((period) => ({
    name: period.name.length > 6 ? period.name.slice(0, 6) + ".." : period.name,
    fullName: period.name,
    total: getTotalSpentForPeriod(period, fixedExpenses),
    startDate: period.startDate,
  }));

  const primaryColor = "#22c55e";
  const totals = chartData.map((d) => d.total);
  const maxValue = Math.max(...totals, 0);
  const minValue = Math.min(...totals, 0);
  const upperBound = maxValue === 0 ? 1 : maxValue * 1.1;
  const lowerBound = minValue === 0 ? 0 : minValue * 1.1;

  const formatMoney = (value: number) => {
    if (value < 0) {
      return `-£${Math.abs(value).toFixed(2)}`;
    }
    return `£${value.toFixed(2)}`;
  };

  if (periods.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">
          Add a period to see the chart
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <h3 className="mb-3 text-base font-semibold text-card-foreground">
        Spending by Period
      </h3>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 5, left: 8, bottom: 18 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              tick={{ fill: "#6b7280", fontSize: 14 }}
              tickLine={false}
              axisLine={{ stroke: "#d1d5db" }}
              angle={0}
              textAnchor="middle"
              interval={0}
              height={26}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fill: "#6b7280", fontSize: 14 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value < 0 ? `-£${Math.abs(value)}` : `£${value}`
              }
              domain={[lowerBound, upperBound]}
              width={64}
              tickMargin={8}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
              labelStyle={{
                color: "#374151",
                marginBottom: "4px",
                fontWeight: 500,
              }}
              formatter={(value: number) => [formatMoney(value), "Total spent"]}
              labelFormatter={(_, payload) =>
                payload[0]?.payload?.fullName || ""
              }
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={primaryColor} />
              ))}
              <LabelList
                dataKey="total"
                content={({ x, y, width, height, value }) => {
                  if (value === undefined || value === null) return null;
                  const numeric = Number(value);
                  if (!Number.isFinite(numeric) || numeric === 0) return null;
                  const xPos = Number(x ?? 0) + Number(width ?? 0) / 2;
                  const yPos =
                    numeric >= 0
                      ? Number(y ?? 0) - 6
                      : Number(y ?? 0) + Number(height ?? 0) + 12;
                  return (
                    <text
                      x={xPos}
                      y={yPos}
                      textAnchor="middle"
                      fill="#374151"
                      fontSize={14}
                      fontWeight={600}
                    >
                      {formatMoney(numeric)}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
