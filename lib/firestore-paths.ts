export const shouldUseTestPrefix = () => {
  if (process.env.NEXT_PUBLIC_FIREBASE_USE_TEST_PREFIX === "true") {
    return true
  }
  if (typeof window === "undefined") return false
  const host = window.location.hostname
  return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0"
}

export const collectionName = (base: string) =>
  shouldUseTestPrefix() ? `test_${base}` : base
