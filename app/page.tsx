"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { HeroSection } from "@/components/hero-section";
import { SignInCard } from "@/components/sign-in-card";
import { PeriodSelector } from "@/components/period-selector";
import { PeriodCard } from "@/components/period-card";
import { SpendingChart } from "@/components/spending-chart";
import { SummaryStats } from "@/components/summary-stats";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Period } from "@/lib/types";
import { Plus, Wallet } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [personalPeriods, setPersonalPeriods] = useState<Period[]>([]);
  const [isCreatePersonalOpen, setIsCreatePersonalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const getPendingKey = (uid: string) => `budget-plan-pending-personal:${uid}`;
  const getLegacyPendingKey = (uid: string) =>
    `pound-tracker-pending-personal:${uid}`;

  const readPendingPeriods = (key: string) => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Period[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const migratePendingPeriods = (key: string, legacyKey: string) => {
    const current = readPendingPeriods(key);
    const legacy = readPendingPeriods(legacyKey);
    if (legacy.length) {
      const merged = [...current];
      legacy.forEach((period) => {
        if (!merged.some((p) => p.id === period.id)) {
          merged.push(period);
        }
      });
      writePendingPeriods(key, merged);
      try {
        window.localStorage.removeItem(legacyKey);
      } catch {
        // ignore
      }
      return merged;
    }
    return current;
  };

  const writePendingPeriods = (key: string, periods: Period[]) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(periods));
    } catch {
      // ignore storage failures
    }
  };

  const enqueuePendingPeriods = (key: string, periods: Period[]) => {
    const existing = readPendingPeriods(key);
    const merged = [...existing];
    periods.forEach((period) => {
      if (!merged.some((p) => p.id === period.id)) {
        merged.push(period);
      }
    });
    writePendingPeriods(key, merged);
  };

  const flushPendingPeriods = async (
    uid: string,
    loadedPeriods: Period[],
  ) => {
    if (!navigator.onLine) return;
    const key = getPendingKey(uid);
    const legacyKey = getLegacyPendingKey(uid);
    const pending = migratePendingPeriods(key, legacyKey);
    if (!pending.length) return;
    const missing = pending.filter(
      (period) => !loadedPeriods.some((p) => p.id === period.id),
    );
    if (!missing.length) {
      writePendingPeriods(key, []);
      return;
    }
    const merged = [...missing, ...loadedPeriods];
    try {
      await setDoc(
        doc(db, "expense_track", uid),
        {
          ownerUid: uid,
          periods: merged,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      writePendingPeriods(key, []);
      setPersonalPeriods(merged);
    } catch (e) {
      console.error("Failed to sync pending periods", e);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setPersonalPeriods([]);
        setIsLoaded(true);
        return;
      }
      setIsLoaded(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const pendingKey = getPendingKey(user.uid);
    const legacyKey = getLegacyPendingKey(user.uid);
    const pending = migratePendingPeriods(pendingKey, legacyKey);
    if (pending.length) {
      setPersonalPeriods((prev) => {
        const merged = [...prev];
        pending.forEach((period) => {
          if (!merged.some((p) => p.id === period.id)) {
            merged.unshift(period);
          }
        });
        return merged;
      });
    }
    const unsub = onSnapshot(
      doc(db, "expense_track", user.uid),
      (snap) => {
        const data = snap.data();
        const loadedPeriods = (data?.periods as Period[]) || [];
        setPersonalPeriods(loadedPeriods);
        void flushPendingPeriods(user.uid, loadedPeriods);
        setIsLoaded(true);
      },
      () => {
        setIsLoaded(true);
      },
    );
    return () => unsub();
  }, [user]);

  const savePersonalPeriods = async (nextPeriods: Period[]) => {
    if (!user) return;
    setPersonalPeriods(nextPeriods);
    if (!navigator.onLine) return;
    try {
      await setDoc(
        doc(db, "expense_track", user.uid),
        {
          ownerUid: user.uid,
          periods: nextPeriods,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (e) {
      console.error("Failed to save periods", e);
    }
  };

  const handleCreatePeriod = (period: Period) => {
    const next = [period, ...personalPeriods];
    setPersonalPeriods(next);
    if (!user) return;
    const pendingKey = getPendingKey(user.uid);
    if (!navigator.onLine) {
      enqueuePendingPeriods(pendingKey, [period]);
      return;
    }
    setDoc(
      doc(db, "expense_track", user.uid),
      {
        ownerUid: user.uid,
        periods: next,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ).catch((e) => {
      console.error("Failed to save periods", e);
      enqueuePendingPeriods(pendingKey, [period]);
    });
  };

  const handleDeletePeriod = (id: string) => {
    savePersonalPeriods(personalPeriods.filter((p) => p.id !== id));
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-svh bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Budget Plan
              </span>
            </div>
            <Link
              href="/login?redirect=/"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
            >
              Sign in
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-20">
          <div className="grid items-start gap-8 lg:grid-cols-5 lg:gap-12">
            <div className="lg:col-span-3">
              <HeroSection />
            </div>
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-8">
                <SignInCard />
              </div>
            </div>
          </div>

          <section className="mt-16 md:mt-24">
            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
                title="Shared budgets"
                description="Collaborate with housemates to track shared expenses and split costs fairly."
              />
              <FeatureCard
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                }
                title="Spending analytics"
                description="Visualize spending patterns with charts and track your budget performance."
              />
              <FeatureCard
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
                title="Period tracking"
                description="Organize spending by time periods to compare budgets month over month."
              />
            </div>
          </section>
        </main>

      </div>
    );
  }

  return (
    <main
      className={cn(
        "min-h-screen bg-background transition-opacity duration-200",
        isSigningOut && "opacity-0",
      )}
    >
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-6">
        <div className="mb-4 flex items-center gap-3 sm:mb-5 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary sm:h-11 sm:w-11 sm:rounded-xl">
            <Wallet className="h-4 w-4 text-primary-foreground sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground sm:text-2xl">
              Budget Plan
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Track spending by period
            </p>
          </div>
          <div className="ml-auto flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium text-foreground">
                {user.displayName || user.email}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsSigningOut(true);
                window.setTimeout(async () => {
                  try {
                    await signOut(auth);
                  } finally {
                    setIsSigningOut(false);
                  }
                }, 180);
              }}
            >
              Sign out
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-fit items-center rounded-full bg-secondary p-1 text-sm">
            <Link
              href="/"
              aria-current="page"
              className={cn(
                "rounded-full px-3 py-1.5 font-medium transition",
                "bg-background text-foreground shadow-sm",
              )}
            >
              Personal
            </Link>
            <Link
              href="/shared"
              className={cn(
                "rounded-full px-3 py-1.5 font-medium transition",
                "text-muted-foreground hover:text-foreground",
              )}
            >
              Shared budgets
            </Link>
          </div>

          <Dialog
            open={isCreatePersonalOpen}
            onOpenChange={setIsCreatePersonalOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add period
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add a new period</DialogTitle>
              </DialogHeader>
              <PeriodSelector
                onCreatePeriod={handleCreatePeriod}
                onCreated={() => setIsCreatePersonalOpen(false)}
                variant="plain"
                showTitle={false}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4 sm:mb-5">
          <SummaryStats periods={personalPeriods} />
        </div>
        <div className="mb-4 sm:mb-5">
          <SpendingChart periods={personalPeriods} />
        </div>
        <div className="space-y-4 sm:space-y-5">
          <div>
            <div className="mb-2.5 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                Periods ({personalPeriods.length})
              </h2>
            </div>
            {personalPeriods.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 sm:h-52">
                <Wallet className="mb-2.5 h-9 w-9 text-muted-foreground/50 sm:mb-3 sm:h-10 sm:w-10" />
                <p className="px-4 text-center text-xs text-muted-foreground sm:text-sm">
                  No periods yet
                  <br />
                  Add a period to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {personalPeriods.map((period) => (
                  <PeriodCard
                    key={period.id}
                    period={period}
                    onDelete={handleDeletePeriod}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
