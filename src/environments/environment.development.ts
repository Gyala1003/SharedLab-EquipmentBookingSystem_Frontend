/** Development environment. Points at the local C# backend. */
export const environment = {
  production: false,
  appName: 'Lab & Equipment Booking',
  apiBaseUrl: 'https://localhost:7080/api',
  defaultLocale: 'vi',
  supportedLocales: ['vi', 'en'] as const,
}
