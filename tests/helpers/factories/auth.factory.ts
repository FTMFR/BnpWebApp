import type { LoginCredentials, LoginResponse } from '../../../src/shared/composables/useAuth'
import type { AuthUser } from '../../../src/stores/auth'

/**
 * Factory function to create mock login credentials
 */
export function createLoginCredentials(
  overrides?: Partial<LoginCredentials>
): LoginCredentials {
  return {
    UserName: 'testuser',
    Password: 'password123',
    ...overrides,
  }
}

/**
 * Factory function to create mock login response
 */
export function createLoginResponse(
  overrides?: Partial<LoginResponse>
): LoginResponse {
  return {
    Token: 'mock-jwt-token-12345',
    ExpiresAt: '2024-12-31T23:59:59Z',
    UserName: 'testuser',
    Roles: ['user'],
    RequiresMfa: false,
    MfaToken: '',
    OtpExpirySeconds: 0,
    MaskedMobileNumber: '0912***1234',
    CaptchaId: '',
    CaptchaImage: '',
    ...overrides,
  }
}

/**
 * Factory function to create mock login response with MFA
 */
export function createMfaLoginResponse(
  overrides?: Partial<LoginResponse>
): LoginResponse {
  return createLoginResponse({
    RequiresMfa: true,
    MfaToken: 'mfa-token-12345',
    OtpExpirySeconds: 300,
    Token: '', // No token when MFA is required
    ...overrides,
  })
}

/**
 * Factory function to create mock auth user
 */
export function createAuthUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    id: 1,
    UserName: 'testuser',
    FirstName: 'Test',
    LastName: 'User',
    Email: 'test@example.com',
    Phone: '02112345678',
    MobileNumber: '09121234567',
    UserCode: 'USR001',
    IpAddress: '127.0.0.1',
    ZamanInsert: '2024-01-01T00:00:00Z',
    ZamanLastEdit: '2024-01-01T00:00:00Z',
    IsActive: true,
    PasswordLastChangedAt: '2024-01-01T00:00:00Z',
    LastLoginAt: '2024-01-01T00:00:00Z',
    MustChangePassword: false,
    ...overrides,
  }
}

/**
 * Factory function to create mock API error
 */
export function createApiError(
  status: number,
  message?: string,
  data?: Record<string, unknown>
) {
  return {
    response: {
      status,
      statusText: getStatusText(status),
      data: {
        message: message || getDefaultErrorMessage(status),
        ...data,
      },
    },
    request: {},
    config: {},
    isAxiosError: true,
  }
}

/**
 * Factory function to create network error (no response)
 */
export function createNetworkError() {
  return {
    request: {},
    config: {},
    message: 'Network Error',
    isAxiosError: true,
  }
}

function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
  }
  return statusTexts[status] || 'Error'
}

function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'درخواست نامعتبر است',
    401: 'نام کاربری یا رمز عبور اشتباه است',
    403: 'شما دسترسی به این بخش را ندارید',
    404: 'یافت نشد',
    500: 'خطای سرور رخ داده است',
  }
  return messages[status] || 'خطایی رخ داده است'
}

