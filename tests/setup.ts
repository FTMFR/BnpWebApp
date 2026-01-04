import { beforeEach, afterEach, vi } from 'vitest'

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

beforeEach(() => {
  // Clear sessionStorage before each test
  sessionStorageMock.clear()

  // Setup sessionStorage mock
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  })
})

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks()
  sessionStorageMock.clear()
})

