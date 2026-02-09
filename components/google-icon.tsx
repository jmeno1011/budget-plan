import { cn } from "@/lib/utils"

type GoogleIconProps = {
  className?: string
}

export function GoogleIcon({ className }: GoogleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 2.6 14.7 1.5 12 1.5 6.9 1.5 2.8 5.6 2.8 10.7S6.9 19.9 12 19.9c6.1 0 7.6-4.3 7.6-6.5 0-.4 0-.7-.1-1H12z"
      />
      <path
        fill="#34A853"
        d="M3.9 7.1l3.2 2.3c.9-1.8 2.8-3.1 4.9-3.1 1.9 0 3.2.8 4 1.5l2.7-2.6C17 2.6 14.7 1.5 12 1.5 8.3 1.5 5 3.6 3.9 7.1z"
      />
      <path
        fill="#FBBC05"
        d="M12 22.5c2.6 0 4.8-.9 6.4-2.4l-3-2.4c-.8.6-1.9 1-3.4 1-2.1 0-4-1.4-4.7-3.3l-3.2 2.5c1.2 2.8 3.9 4.6 7.9 4.6z"
      />
      <path
        fill="#4285F4"
        d="M21.6 12.3c0-.4 0-.7-.1-1H12v3.9h5.5c-.3 1.1-1.1 2.2-2.4 2.9l3 2.4c1.8-1.6 3.5-4 3.5-8.2z"
      />
    </svg>
  )
}
