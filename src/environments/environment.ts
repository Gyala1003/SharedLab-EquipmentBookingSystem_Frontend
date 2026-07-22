/**
 * Production environment (default). Swapped for environment.development.ts
 * during `ng serve` / development builds via fileReplacements in angular.json.
 */
export const environment = {
  production: true,
  appName: 'Lab & Equipment Booking',
  apiBaseUrl: 'https://yourdomain.com/api',
  defaultLocale: 'vi',
  supportedLocales: ['vi', 'en'] as const,
}
