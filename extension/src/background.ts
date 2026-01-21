/**
 * Background service worker for Pinstr extension.
 * Handles messages from the web app login page.
 */

// Listen for messages from the web app
chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  if (message.type === "NIP07_LOGIN_SUCCESS" && message.pubkey) {
    // Store the login data in chrome.storage.local so the popup can access it
    chrome.storage.local
      .set({
        pendingLogin: {
          pubkey: message.pubkey,
          timestamp: Date.now(),
        },
      })
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Failed to store login:", error);
        sendResponse({ success: false, error: "Failed to store login" });
      });

    return true; // Keep the message channel open for async response
  }
});
