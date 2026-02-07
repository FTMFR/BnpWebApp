/**
 * Pure predicates for API response handling (401/403, auth URLs).
 * Used by the API client interceptor; extracted for testability.
 */

export function isLoginRequest(url: string | undefined): boolean {
  return typeof url === 'string' && url.includes('/Auth/login')
}

export function isRefreshRequest(url: string | undefined): boolean {
  return typeof url === 'string' && url.includes('/Auth/refresh')
}

export function isLogoutRequest(url: string | undefined): boolean {
  return typeof url === 'string' && url.includes('/Auth/logout')
}

export function isMfaResendOrVerifyRequest(url: string | undefined): boolean {
  if (typeof url !== 'string') return false
  return url.includes('/Auth/mfa/resend-otp') || url.includes('/Auth/mfa/verify')
}

export function isSessionCheckRequest(url: string | undefined): boolean {
  return typeof url === 'string' && url.includes('/Session/MySessions')
}

export function isUserRequest(url: string | undefined): boolean {
  return typeof url === 'string' && url.includes('/Users/')
}

export function isRefreshTokenNotFoundMessage(message: string | undefined): boolean {
  if (!message) return false
  return message.includes('یافت نشد') || message.includes('Refresh Token')
}

export function isAuthPage(pathname: string): boolean {
  const authPages = ['/login', '/register', '/forgot-password']
  return authPages.some((page) => pathname.startsWith(page))
}
