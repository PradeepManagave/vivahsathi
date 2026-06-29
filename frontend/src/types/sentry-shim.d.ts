declare module '@sentry/nextjs' {
  export function init(options: {
    dsn?: string;
    environment?: string;
    tracesSampleRate?: number;
    replaysSessionSampleRate?: number;
    replaysOnErrorSampleRate?: number;
    integrations?: unknown[];
  }): void;
  export function browserTracingIntegration(): unknown;
  export function replayIntegration(): unknown;
  export function captureException(error: unknown, context?: unknown): string;
  export function captureMessage(message: string, level?: unknown): string;
  export function setUser(user: { id?: string; email?: string; username?: string } | null): void;
  export function setTag(key: string, value: string): void;
  export function setExtra(key: string, value: unknown): void;
}
