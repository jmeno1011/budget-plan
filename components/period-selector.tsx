"use client";

import { useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";
import { format, eachDayOfInterval } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Period } from "@/lib/types";

interface PeriodSelectorProps {
  onCreatePeriod: (period: Period) => void;
  onCreated?: () => void;
  variant?: "card" | "plain";
  showTitle?: boolean;
}

export function PeriodSelector({
  onCreatePeriod,
  onCreated,
  variant = "card",
  showTitle = true,
}: PeriodSelectorProps) {
  const [periodName, setPeriodName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [budget, setBudget] = useState("");
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const handleStartOpenChange = (open: boolean) => {
    setIsStartOpen(open);
    if (open) setIsEndOpen(false);
  };

  const handleEndOpenChange = (open: boolean) => {
    setIsEndOpen(open);
    if (open) setIsStartOpen(false);
  };

  const handleStartSelect = (date?: Date) => {
    if (!date) return;
    setStartDate(date);
    if (endDate && endDate < date) {
      setEndDate(undefined);
    }
    setIsStartOpen(false);
  };

  const handleEndSelect = (date?: Date) => {
    if (!date) return;
    setEndDate(date);
    setIsEndOpen(false);
  };

  const handleCreate = () => {
    if (!periodName || !startDate || !endDate) return;

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const expenses = days.map((day) => ({
      id: crypto.randomUUID(),
      date: format(day, "yyyy-MM-dd"),
      amount: 0,
      memo: "",
    }));

    const parsedBudget = budget.trim() ? Number(budget) : undefined;
    const budgetValue =
      parsedBudget !== undefined && Number.isFinite(parsedBudget)
        ? parsedBudget
        : undefined;

    const newPeriod: Period = {
      id: crypto.randomUUID(),
      name: periodName,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      expenses,
    };
    if (budgetValue !== undefined) {
      newPeriod.budget = budgetValue;
    }

    onCreatePeriod(newPeriod);
    onCreated?.();
    setPeriodName("");
    setStartDate(undefined);
    setEndDate(undefined);
    setBudget("");
  };

  return (
    <div
      className={cn(
        "space-y-3 sm:space-y-4",
        variant === "card" &&
          "rounded-lg border border-border bg-card p-4 sm:p-6",
      )}
    >
      {showTitle && (
        <h3 className="text-base font-semibold text-card-foreground sm:text-lg">
          Add a new period
        </h3>
      )}

      <div className="space-y-2">
        <Label htmlFor="period-name" className="text-sm text-muted-foreground">
          Period name
        </Label>
        <Input
          id="period-name"
          placeholder="e.g. January living costs"
          value={periodName}
          onChange={(e) => setPeriodName(e.target.value)}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Start date</Label>
          <Popover open={isStartOpen} onOpenChange={handleStartOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-auto min-h-10 justify-start text-left font-normal border-border bg-background px-3 py-2",
                  !startDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="text-sm">
                  {startDate ? format(startDate, "dd/MM/yy") : "Select"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-popover border-border"
              align="start"
            >
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">End date</Label>
          <Popover open={isEndOpen} onOpenChange={handleEndOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-auto min-h-10 justify-start text-left font-normal border-border bg-background px-3 py-2",
                  !endDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="text-sm">
                  {endDate ? format(endDate, "dd/MM/yy") : "Select"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-popover border-border"
              align="start"
            >
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndSelect}
                disabled={(date) => (startDate ? date < startDate : false)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="period-budget"
          className="text-sm text-muted-foreground"
        >
          Budget (optional)
        </Label>
        <Input
          id="period-budget"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 1200.00"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          onWheel={(e) => e.currentTarget.blur()}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <Button
        onClick={handleCreate}
        disabled={!periodName || !startDate || !endDate}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create period
      </Button>
    </div>
  );
}
