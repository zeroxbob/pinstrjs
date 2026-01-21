/**
 * Injected script that runs in the page's main world.
 * This script can access window.nostr from NIP-07 extensions.
 * It communicates with the content script via postMessage.
 */

interface Nip07Nostr {
  getPublicKey(): Promise<string>;
  signEvent(event: {
    kind: number;
    content: string;
    tags: string[][];
    created_at: number;
  }): Promise<{
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    tags: string[][];
    content: string;
    sig: string;
  }>;
}

declare const window: Window & { nostr?: Nip07Nostr };

// Listen for messages from the content script
window.addEventListener("message", async (event) => {
  // Only accept messages from the same frame
  if (event.source !== window) return;

  const { type, requestId, payload } = event.data || {};
  if (!type?.startsWith("PINSTR_NIP07_")) return;

  if (type === "PINSTR_NIP07_CHECK") {
    window.postMessage(
      {
        type: "PINSTR_NIP07_RESPONSE",
        requestId,
        payload: { available: typeof window.nostr !== "undefined" },
      },
      "*"
    );
  }

  if (type === "PINSTR_NIP07_GET_PUBLIC_KEY") {
    try {
      if (!window.nostr) {
        throw new Error("NIP-07 extension not available");
      }
      const pubkey = await window.nostr.getPublicKey();
      window.postMessage(
        {
          type: "PINSTR_NIP07_RESPONSE",
          requestId,
          payload: { pubkey },
        },
        "*"
      );
    } catch (error) {
      window.postMessage(
        {
          type: "PINSTR_NIP07_RESPONSE",
          requestId,
          payload: { error: error instanceof Error ? error.message : "Failed to get public key" },
        },
        "*"
      );
    }
  }

  if (type === "PINSTR_NIP07_SIGN_EVENT") {
    try {
      if (!window.nostr) {
        throw new Error("NIP-07 extension not available");
      }
      const signedEvent = await window.nostr.signEvent(payload.event);
      window.postMessage(
        {
          type: "PINSTR_NIP07_RESPONSE",
          requestId,
          payload: { signedEvent },
        },
        "*"
      );
    } catch (error) {
      window.postMessage(
        {
          type: "PINSTR_NIP07_RESPONSE",
          requestId,
          payload: { error: error instanceof Error ? error.message : "Failed to sign event" },
        },
        "*"
      );
    }
  }
});

// Signal that the injected script is ready
window.postMessage({ type: "PINSTR_NIP07_READY" }, "*");
