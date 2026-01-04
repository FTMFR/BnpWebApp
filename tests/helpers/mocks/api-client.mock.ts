import { vi } from 'vitest'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

/**
 * Creates a mock axios instance for testing
 */
export function createMockApiClient(): AxiosInstance {
  const mockApiClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn(),
      },
      response: {
        use: vi.fn(),
        eject: vi.fn(),
      },
    },
    defaults: {
      headers: {
        common: {},
      },
    },
  } as unknown as AxiosInstance

  return mockApiClient
}

/**
 * Helper to mock successful API response
 */
export function mockApiSuccess<T = unknown>(
  mockClient: AxiosInstance,
  data: T
): void {
  const mockResponse: AxiosResponse<T> = {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosRequestConfig,
  }

  vi.mocked(mockClient.post).mockResolvedValue(mockResponse)
  vi.mocked(mockClient.get).mockResolvedValue(mockResponse)
  vi.mocked(mockClient.put).mockResolvedValue(mockResponse)
  vi.mocked(mockClient.patch).mockResolvedValue(mockResponse)
  vi.mocked(mockClient.delete).mockResolvedValue(mockResponse)
  vi.mocked(mockClient.request).mockResolvedValue(mockResponse)
}

/**
 * Helper to mock API error
 */
export function mockApiError(
  mockClient: AxiosInstance,
  status: number,
  message?: string,
  data?: Record<string, unknown>
): void {
  const error = {
    response: {
      status,
      statusText: getStatusText(status),
      data: {
        message: message || getDefaultErrorMessage(status),
        ...data,
      },
    },
    request: {},
    config: {} as AxiosRequestConfig,
    isAxiosError: true,
  }

  vi.mocked(mockClient.post).mockRejectedValue(error)
  vi.mocked(mockClient.get).mockRejectedValue(error)
  vi.mocked(mockClient.put).mockRejectedValue(error)
  vi.mocked(mockClient.patch).mockRejectedValue(error)
  vi.mocked(mockClient.delete).mockRejectedValue(error)
  vi.mocked(mockClient.request).mockRejectedValue(error)
}

/**
 * Helper to mock network error (no response)
 */
export function mockNetworkError(mockClient: AxiosInstance): void {
  const error = {
    request: {},
    config: {} as AxiosRequestConfig,
    message: 'Network Error',
    isAxiosError: true,
  }

  vi.mocked(mockClient.post).mockRejectedValue(error)
  vi.mocked(mockClient.get).mockRejectedValue(error)
  vi.mocked(mockClient.put).mockRejectedValue(error)
  vi.mocked(mockClient.patch).mockRejectedValue(error)
  vi.mocked(mockClient.delete).mockRejectedValue(error)
  vi.mocked(mockClient.request).mockRejectedValue(error)
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

