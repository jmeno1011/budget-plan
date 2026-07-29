import { Suspense } from "react"
import { PageLoading } from "@/components/page-loading"
import JoinClient from "./join-client"

export default function JoinPage() {
  return (
    <Suspense fallback={<PageLoading message="Preparing invite" />}>
      <JoinClient />
    </Suspense>
  )
}
