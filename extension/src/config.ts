/**
 * Extension configuration
 */

/**
 * Base URL for the Pinstr web app.
 *
 * For local development:
 * - Change to "http://localhost:5173" (or your dev server port)
 * - Make sure the dev server is running
 *
 * For production:
 * - Use your deployed domain (e.g., "https://pinstr.co")
 */
export const APP_BASE_URL = "http://localhost:5173";

/**
 * Get the extension login URL
 */
export function getExtensionLoginUrl(): string {
  return `${APP_BASE_URL}/extension-login`;
}
