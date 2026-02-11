"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type PageTransitionProps = {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    setIsAnimating(true)
    const timer = window.setTimeout(() => {
      setIsAnimating(false)
    }, 220)
    return () => window.clearTimeout(timer)
  }, [pathname])

  return (
    <div
      className={cn(
        "page-transition",
        isAnimating && "page-transition--active",
        className,
      )}
    >
      {children}
    </div>
  )
}
