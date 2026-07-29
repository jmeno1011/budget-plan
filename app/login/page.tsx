import { Suspense } from "react"
import { PageLoading } from "@/components/page-loading"
import LoginClient from "./login-client"

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoading message="Preparing sign in" />}>
      <LoginClient />
    </Suspense>
  )
}
