/**
 * Extension configuration
 */

/**
 * Base URL for the Pinstr web app.
 * The extension always uses the production site for login.
 *
 * Note for developers: If you're developing both the extension AND the website locally,
 * you can temporarily change this to "http://localhost:5173" for testing.
 */
export const APP_BASE_URL = "https://pinstr.co";

/**
 * Get the extension login URL
 */
export function getExtensionLoginUrl(): string {
  return `${APP_BASE_URL}/extension-login`;
}
