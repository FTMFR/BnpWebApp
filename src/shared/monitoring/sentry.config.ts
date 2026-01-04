// TODO: Enable Sentry when needed
// import * as Sentry from '@sentry/vue';
// import type { App } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function initSentry(_app: unknown, _router: unknown): void {
  // Sentry is disabled for now
  // Only initialize in production
  // if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  //   Sentry.init({
  //     app,
  //     dsn: import.meta.env.VITE_SENTRY_DSN,
  //     integrations: [
  //       Sentry.browserTracingIntegration({
  //         routingInstrumentation: Sentry.vueRouterInstrumentation(router),
  //         tracePropagationTargets: ['localhost', /^https:\/\/.*\.yourdomain\.com/],
  //       }),
  //     ],
  //     // Performance Monitoring
  //     tracesSampleRate: 1.0,
  //     // Session Replay
  //     replaysSessionSampleRate: 0.1,
  //     replaysOnErrorSampleRate: 1.0,
  //     environment: import.meta.env.MODE,
  //   });
  // }
}

