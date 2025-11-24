/**
 * Environment configuration utilities
 * Handles automatic detection of development vs production environments
 */

/**
 * Get the base URL for the application
 * - Development: http://localhost:5173
 * - Production: https://pinstr.co
 */
export function getBaseUrl(): string {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return 'http://localhost:5173';
  }

  // Check if VITE_BASE_URL is set in environment variables (optional override)
  if (import.meta.env.VITE_BASE_URL) {
    return import.meta.env.VITE_BASE_URL;
  }

  // Production: use the custom domain
  return 'https://pinstr.co';
}

/**
 * Get the bookmarklet URL for the current environment
 */
export function getBookmarkletUrl(): string {
  return `${getBaseUrl()}/bookmarklet?popup=true`;
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

/**
 * Get the current environment name
 */
export function getEnvironment(): 'development' | 'production' {
  return import.meta.env.DEV ? 'development' : 'production';
}
