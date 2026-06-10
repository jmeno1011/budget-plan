import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PageTransition } from "@/components/page-transition";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Budget Plan - Expense Tracker",
  description: "Plan and track spending by period.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon.jpg",
        type: "image/jpeg",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <PageTransition>{children}</PageTransition>
        <footer className="border-t border-border bg-card/50">
          <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
            <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
              <p className="text-sm text-muted-foreground">
                Budget Plan · © 2026 Doh Kim
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Questions? Please contact whltn8282@gmail.com
                </p>
                ·
                <a
                  href={"https://www.linkedin.com/in/dohyoungkim1011"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
