/**
 * Application environment configuration
 */
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Bakery POS & Management',
  REQUEST_TIMEOUT_MS: 15000,
} as const;
