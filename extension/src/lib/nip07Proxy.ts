/**
 * NIP-07 Proxy for Chrome extension popup.
 *
 * Since NIP-07 extensions inject window.nostr into web pages (not extension popups),
 * we use the content script as a bridge. The content script runs in the context
 * of the active tab where window.nostr IS available.
 */

import type { NostrSigner, NostrEvent } from "@nostrify/nostrify";

interface SignEventRequest {
  kind: number;
  content: string;
  tags: string[][];
  created_at: number;
}

/**
 * Ensure content script is injected in the active tab.
 * This handles cases where pages were open before the extension was installed.
 */
async function ensureContentScript(tabId: number): Promise<void> {
  try {
    // Try to inject the content script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
  } catch {
    // Script might already be injected or page doesn't allow injection
    // This is fine, we'll try to send the message anyway
  }
}

/**
 * Send a message to the content script, injecting it first if necessary.
 */
async function sendToContentScript<T>(
  tabId: number,
  message: Record<string, unknown>
): Promise<T | null> {
  // First, try sending the message directly
  try {
    const response = await chrome.tabs.sendMessage(tabId, message);
    return response as T;
  } catch {
    // Content script might not be injected yet
  }

  // Try injecting the content script and retry
  await ensureContentScript(tabId);

  // Wait a moment for the script to initialize
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Try again
  try {
    const response = await chrome.tabs.sendMessage(tabId, message);
    return response as T;
  } catch {
    return null;
  }
}

/**
 * Check if NIP-07 is available on the current tab.
 */
export async function checkNip07Available(): Promise<boolean> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return false;

    // Check if it's a restricted URL where we can't inject scripts
    if (
      tab.url?.startsWith("chrome://") ||
      tab.url?.startsWith("chrome-extension://") ||
      tab.url?.startsWith("about:") ||
      tab.url?.startsWith("edge://") ||
      tab.url?.startsWith("brave://")
    ) {
      return false;
    }

    const response = await sendToContentScript<{ available: boolean }>(tab.id, {
      type: "NIP07_CHECK",
    });
    return response?.available === true;
  } catch {
    return false;
  }
}

/**
 * Get public key from NIP-07 extension via content script.
 */
export async function nip07GetPublicKey(): Promise<string> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) {
    throw new Error("No active tab");
  }

  const response = await sendToContentScript<{ pubkey?: string; error?: string }>(tab.id, {
    type: "NIP07_GET_PUBLIC_KEY",
  });

  if (response?.error) {
    throw new Error(response.error);
  }

  if (!response?.pubkey) {
    throw new Error("Failed to get public key. Make sure your NIP-07 extension is unlocked.");
  }

  return response.pubkey;
}

/**
 * Sign an event using NIP-07 extension via content script.
 */
export async function nip07SignEvent(event: SignEventRequest): Promise<NostrEvent> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id) {
    throw new Error("No active tab");
  }

  const response = await sendToContentScript<{ signedEvent?: NostrEvent; error?: string }>(
    tab.id,
    {
      type: "NIP07_SIGN_EVENT",
      event,
    }
  );

  if (response?.error) {
    throw new Error(response.error);
  }

  if (!response?.signedEvent) {
    throw new Error("Failed to sign event");
  }

  return response.signedEvent;
}

/**
 * A NostrSigner implementation that uses NIP-07 via the content script bridge.
 */
export class Nip07ProxySigner implements NostrSigner {
  private pubkey: string;

  constructor(pubkey: string) {
    this.pubkey = pubkey;
  }

  async getPublicKey(): Promise<string> {
    return this.pubkey;
  }

  async signEvent(event: Omit<NostrEvent, "id" | "pubkey" | "sig">): Promise<NostrEvent> {
    return nip07SignEvent({
      kind: event.kind,
      content: event.content,
      tags: event.tags,
      created_at: event.created_at,
    });
  }

  // NIP-04 encryption (optional, not implemented for now)
  readonly nip04 = undefined;

  // NIP-44 encryption (optional, not implemented for now)
  readonly nip44 = undefined;
}
