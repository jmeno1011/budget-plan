type FirebaseAuthError = {
  code?: string
}

export function getFirebaseAuthErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return undefined
  return (error as FirebaseAuthError).code
}

export function getGoogleSignInErrorMessage(error: unknown) {
  switch (getFirebaseAuthErrorCode(error)) {
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Google sign-in. Add this domain in Firebase Authentication settings."
    case "auth/popup-blocked":
      return "The Google sign-in popup was blocked. Allow popups for this site and try again."
    case "auth/popup-closed-by-user":
      return "The Google sign-in popup was closed before sign-in finished."
    default:
      return "Google sign-in could not start. Please try again."
  }
}

export function shouldSkipGoogleRedirectFallback(error: unknown) {
  return getFirebaseAuthErrorCode(error) === "auth/unauthorized-domain"
}
