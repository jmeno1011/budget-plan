import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

type WalletIconProps = {
  className?: string
}

export function WalletIcon({ className }: WalletIconProps) {
  return <Wallet className={cn("text-primary", className)} />
}
