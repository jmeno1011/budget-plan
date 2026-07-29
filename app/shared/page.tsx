import { Suspense } from "react"
import { PageLoading } from "@/components/page-loading"
import SharedClient from "./shared-client"

export default function SharedPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading shared budgets" />}>
      <SharedClient />
    </Suspense>
  )
}
