// import * as Sentry from '@sentry/vue'
// import type { App } from 'vue'
// import type { Router } from 'vue-router'

// /**
//  * Initialize Sentry for error tracking, performance monitoring, and session replay
//  * @param app - Vue application instance
//  * @param router - Vue Router instance
//  */
// export function initSentry(app: App, router: Router): void {
//   // Only initialize if DSN is provided
//   const dsn = import.meta.env.VITE_SENTRY_DSN

//   if (!dsn) {
//     console.warn('Sentry DSN not provided. Sentry monitoring is disabled.')
//     return
//   }

//   Sentry.init({
//     app,
//     dsn,
//     integrations: [
//       Sentry.browserTracingIntegration({
//         router,
//         // Instrument navigation changes
//         enableInp: true,
//         // Trace propagation targets - adjust based on your API endpoints
//         tracePropagationTargets: [
//           'localhost',
//           /^https:\/\/.*\.yourdomain\.com/,
//           /^https:\/\/api\..*/,
//         ],
//       }),
//       Sentry.replayIntegration({
//         // Mask all text content and user input by default for privacy
//         maskAllText: true,
//         blockAllMedia: false,
//       }),
//     ],

//     // Environment configuration
//     environment: import.meta.env.MODE,
//     // Release version - can be set via environment variable
//     release: import.meta.env.VITE_APP_VERSION || undefined,

//     // Performance Monitoring
//     // Adjust sample rate based on your needs:
//     // - 1.0 = 100% of transactions (for development/testing)
//     // - 0.1 = 10% of transactions (recommended for production)
//     tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

//     // Session Replay
//     // Sample rate for session replays (0.0 to 1.0)
//     // 0.1 = 10% of sessions will be recorded
//     replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
//     // Always record replays when an error occurs
//     replaysOnErrorSampleRate: 1.0,

//     // Error tracking configuration
//     beforeSend(event, hint) {
//       // Filter out certain errors if needed
//       // For example, ignore errors from browser extensions
//       if (event.exception) {
//         const error = hint.originalException
//         if (error && typeof error === 'object' && 'message' in error) {
//           const errorMessage = String(error.message)
//           // Ignore errors from browser extensions
//           if (
//             errorMessage.includes('chrome-extension://') ||
//             errorMessage.includes('moz-extension://') ||
//             errorMessage.includes('safari-extension://')
//           ) {
//             return null
//           }
//         }
//       }
//       return event
//     },

//     // Ignore specific errors
//     ignoreErrors: [
//       // Browser extension errors
//       'top.GLOBALS',
//       'originalCreateNotification',
//       'canvas.contentDocument',
//       'MyApp_RemoveAllHighlights',
//       'atomicFindClose',
//       'fb_xd_fragment',
//       'bmi_SafeAddOnload',
//       'EBCallBackMessageReceived',
//       'conduitPage',
//       // Network errors that are not actionable
//       'NetworkError',
//       'Network request failed',
//       'Failed to fetch',
//       // ResizeObserver errors (common and usually harmless)
//       'ResizeObserver loop limit exceeded',
//       'ResizeObserver loop completed with undelivered notifications',
//     ],

//     // Set user context (can be updated later with actual user data)
//     initialScope: {
//       tags: {
//         component: 'frontend',
//       },
//     },

//     // Enable debug mode in development
//     debug: import.meta.env.DEV && import.meta.env.VITE_SENTRY_DEBUG === 'true',
//   })

//   // Set user context if available (e.g., after login)
//   // This can be called from your auth store after user logs in
//   // Example: Sentry.setUser({ id: user.id, username: user.username, email: user.email })
// }

// /**
//  * Set Sentry user context after login
//  * @param userId - User ID
//  * @param username - Username
//  * @param email - User email (optional)
//  * @param additionalData - Additional user data (optional)
//  */
// export function setSentryUser(
//   userId: string | number,
//   username?: string,
//   email?: string,
//   additionalData?: Record<string, unknown>
// ): void {
//   Sentry.setUser({
//     id: String(userId),
//     username,
//     email,
//     ...additionalData,
//   })
// }

// /**
//  * Clear Sentry user context after logout
//  */
// export function clearSentryUser(): void {
//   Sentry.setUser(null)
// }

