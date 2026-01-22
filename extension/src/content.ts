/**
 * Content script for Pinstr extension.
 * Extracts page metadata when requested by the popup.
 * Bridges NIP-07 requests by communicating with the injected script via postMessage.
 */

interface PageMetadata {
  url: string;
  title: string;
  description: string;
}

// Inject the script that runs in the page's main world (can access window.nostr)
const script = document.createElement("script");
script.src = chrome.runtime.getURL("injected.js");
script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);

function getPageMetadata(): PageMetadata {
  // Get URL
  const url = window.location.href;

  // Get title
  const title = document.title || "";

  // Get description from meta tags
  let description = "";

  // Try og:description first
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    description = ogDescription.getAttribute("content") || "";
  }

  // Fall back to meta description
  if (!description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      description = metaDescription.getAttribute("content") || "";
    }
  }

  // Fall back to twitter:description
  if (!description) {
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      description = twitterDescription.getAttribute("content") || "";
    }
  }

  return { url, title, description };
}

// Generate unique request IDs
let requestIdCounter = 0;
function generateRequestId(): string {
  return `req_${Date.now()}_${requestIdCounter++}`;
}

// Send a message to the injected script and wait for response
function sendToInjected<T>(type: string, payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const requestId = generateRequestId();
    const timeout = setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error("Request timed out"));
    }, 5000);

    const handler = (event: MessageEvent) => {
      // Only accept messages from the same frame
      if (event.source !== window) return;

      const { type: responseType, requestId: responseId, payload: responsePayload } = event.data || {};

      if (responseType === "PINSTR_NIP07_RESPONSE" && responseId === requestId) {
        clearTimeout(timeout);
        window.removeEventListener("message", handler);
        resolve(responsePayload as T);
      }
    };

    window.addEventListener("message", handler);
    window.postMessage({ type, requestId, payload }, "*");
  });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "GET_PAGE_METADATA") {
    const metadata = getPageMetadata();
    sendResponse(metadata);
    return true;
  }

  if (request.type === "NIP07_CHECK") {
    sendToInjected<{ available: boolean }>("PINSTR_NIP07_CHECK")
      .then((response) => sendResponse({ available: response.available }))
      .catch(() => sendResponse({ available: false }));
    return true; // Keep channel open for async response
  }

  if (request.type === "NIP07_GET_PUBLIC_KEY") {
    sendToInjected<{ pubkey?: string; error?: string }>("PINSTR_NIP07_GET_PUBLIC_KEY")
      .then((response) => sendResponse(response))
      .catch((error) => sendResponse({ error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.type === "NIP07_SIGN_EVENT") {
    sendToInjected<{ signedEvent?: unknown; error?: string }>("PINSTR_NIP07_SIGN_EVENT", {
      event: request.event,
    })
      .then((response) => sendResponse(response))
      .catch((error) => sendResponse({ error: error.message }));
    return true; // Keep channel open for async response
  }

  return true; // Keep the message channel open for async response
});
