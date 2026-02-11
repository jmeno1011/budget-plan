import type { User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { collectionName } from "@/lib/firestore-paths"

type LedgerMeta = {
  linkedLedger?: string
}

export async function resolveLedgerUid(user: User) {
  try {
    const snap = await getDoc(
      doc(db, collectionName("expense_track"), user.uid),
    )
    const data = snap.data() as LedgerMeta | undefined
    if (data?.linkedLedger) {
      return data.linkedLedger
    }
  } catch (e) {
    console.error("Failed to resolve ledger")
  }
  return user.uid
}
