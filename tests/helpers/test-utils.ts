import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createRouter, createWebHistory, type Router } from 'vue-router'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { Component } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createMockRouter } from './mocks/router.mock'
import { queryClient } from '@/shared/query/setup'

/**
 * Creates a test Pinia instance
 */
export function createTestPinia(): Pinia {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * Creates a test router with basic routes
 */
export function createTestRouter(): Router {
  return createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/login',
        name: 'login',
        component: { template: '<div>Login</div>' },
        meta: { requiresAuth: false },
      },
      {
        path: '/',
        name: 'dashboard',
        component: { template: '<div>Dashboard</div>' },
        meta: { requiresAuth: true },
      },
    ],
  })
}

/**
 * Renders a component with all necessary providers (Pinia, Router, VueQuery)
 */
export function renderWithProviders(
  component: Component,
  options: {
    pinia?: Pinia
    router?: Router
    queryClient?: QueryClient
    props?: Record<string, unknown>
    global?: Record<string, unknown>
  } = {}
): VueWrapper {
  const pinia = options.pinia || createTestPinia()
  const router = options.router || createTestRouter()
  const client = options.queryClient || queryClient

  return mount(component, {
    props: options.props || {},
    global: {
      plugins: [pinia, router, [VueQueryPlugin, { queryClient: client }]],
      ...options.global,
    },
  })
}

/**
 * Waits for next tick and router to be ready
 */
export async function waitForRouter(router: Router): Promise<void> {
  await router.isReady()
}

/**
 * Cleans up test environment
 */
export function cleanupTest(): void {
  sessionStorage.clear()
  setActivePinia(createPinia())
}

