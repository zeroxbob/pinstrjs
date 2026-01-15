/**
 * Hooks for managing private (encrypted) bookmarks.
 *
 * Private bookmarks are:
 * - Signed by the vault keypair (not user's nsec)
 * - Encrypted with AES-256-GCM
 * - Stored on relays under the vault pubkey
 * - Only decryptable by the user with the passphrase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNostr } from "@nostrify/react";
import { finalizeEvent, type EventTemplate } from "nostr-tools/pure";
import type { NostrEvent } from "@nostrify/nostrify";
import { useVault, useVaultPubkey, useIsVaultUnlocked } from "@/hooks/useVault";
import type { Bookmark } from "./useBookmarks";
import type { CreateBookmarkData } from "./useCreateBookmark";

/**
 * Kind for private bookmarks (same as public, but signed by vault key)
 */
const PRIVATE_BOOKMARK_KIND = 39701;

/**
 * Marker tag to identify encrypted private bookmarks
 */
const ENCRYPTED_TAG = ["encrypted", "aes-256-gcm"];

/**
 * Structure of encrypted bookmark content
 */
interface EncryptedBookmarkContent {
  url: string;
  title?: string;
  description?: string;
  tags?: string[];
  publishedAt?: number;
}

/**
 * Extracts the URL without the scheme for the d-tag
 */
function extractIdentifier(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.host + urlObj.pathname + urlObj.search + urlObj.hash;
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

/**
 * Transforms a decrypted event into a Bookmark object
 */
function transformPrivateBookmark(
  event: NostrEvent,
  decryptedContent: EncryptedBookmarkContent
): Bookmark {
  // Reconstruct full URL from decrypted content
  const url =
    decryptedContent.url.startsWith("http://") ||
    decryptedContent.url.startsWith("https://")
      ? decryptedContent.url
      : `https://${decryptedContent.url}`;

  return {
    id: event.id,
    event,
    url,
    title: decryptedContent.title,
    description: decryptedContent.description || "",
    tags: decryptedContent.tags || [],
    publishedAt: decryptedContent.publishedAt,
    createdAt: event.created_at,
    author: event.pubkey, // This is the vault pubkey
  };
}

/**
 * Hook to fetch all private bookmarks from the vault.
 * Returns decrypted bookmarks when vault is unlocked.
 */
export function usePrivateBookmarks() {
  const { nostr } = useNostr();
  const { state, decrypt } = useVault();
  const vaultPubkey = useVaultPubkey();
  const isUnlocked = useIsVaultUnlocked();

  return useQuery({
    queryKey: ["privateBookmarks", vaultPubkey],
    queryFn: async (c) => {
      if (!vaultPubkey || state.status !== "unlocked") {
        return [];
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      const events = await nostr.query(
        [
          {
            kinds: [PRIVATE_BOOKMARK_KIND],
            authors: [vaultPubkey],
            limit: 100,
          },
        ],
        { signal }
      );

      // Filter to only encrypted events and decrypt them
      const bookmarks: Bookmark[] = [];

      for (const event of events) {
        // Check for encrypted tag
        const hasEncryptedTag = event.tags.some(
          ([name, value]) => name === "encrypted" && value === "aes-256-gcm"
        );

        if (!hasEncryptedTag) continue;

        try {
          const decryptedJson = decrypt(event.content);
          const decryptedContent = JSON.parse(
            decryptedJson
          ) as EncryptedBookmarkContent;
          bookmarks.push(transformPrivateBookmark(event, decryptedContent));
        } catch (error) {
          // Skip events that fail to decrypt (might be corrupted or wrong key)
          console.warn(
            "[PrivateBookmarks] Failed to decrypt event:",
            event.id,
            error
          );
        }
      }

      // Sort by creation date, newest first
      return bookmarks.sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: isUnlocked && !!vaultPubkey,
  });
}

/**
 * Hook to fetch a single private bookmark by URL identifier.
 */
export function usePrivateBookmark(identifier: string) {
  const { nostr } = useNostr();
  const { state, decrypt } = useVault();
  const vaultPubkey = useVaultPubkey();
  const isUnlocked = useIsVaultUnlocked();

  return useQuery({
    queryKey: ["privateBookmark", vaultPubkey, identifier],
    queryFn: async (c) => {
      if (!vaultPubkey || state.status !== "unlocked") {
        return null;
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [
          {
            kinds: [PRIVATE_BOOKMARK_KIND],
            authors: [vaultPubkey],
            "#d": [identifier],
            limit: 1,
          },
        ],
        { signal }
      );

      if (events.length === 0) {
        return null;
      }

      const event = events[0];

      // Check for encrypted tag
      const hasEncryptedTag = event.tags.some(
        ([name, value]) => name === "encrypted" && value === "aes-256-gcm"
      );

      if (!hasEncryptedTag) {
        return null;
      }

      try {
        const decryptedJson = decrypt(event.content);
        const decryptedContent = JSON.parse(
          decryptedJson
        ) as EncryptedBookmarkContent;
        return transformPrivateBookmark(event, decryptedContent);
      } catch {
        return null;
      }
    },
    enabled: isUnlocked && !!vaultPubkey && !!identifier,
  });
}

/**
 * Hook to create a new private bookmark.
 * The bookmark is encrypted and signed with the vault key.
 */
export function useCreatePrivateBookmark() {
  const { nostr } = useNostr();
  const { state, encrypt } = useVault();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookmarkData) => {
      if (state.status !== "unlocked") {
        throw new Error("Vault must be unlocked to create private bookmarks");
      }

      // Validate URL
      if (!data.url) {
        throw new Error("URL is required");
      }

      // Ensure URL has a protocol
      let fullUrl = data.url;
      if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
        fullUrl = `https://${fullUrl}`;
      }

      // Extract identifier for d-tag
      const identifier = extractIdentifier(fullUrl);

      // Create content object to encrypt
      const contentToEncrypt: EncryptedBookmarkContent = {
        url: fullUrl,
        title: data.title,
        description: data.description,
        tags: data.tags,
        publishedAt: data.publishedAt,
      };

      // Encrypt the content
      const encryptedContent = encrypt(JSON.stringify(contentToEncrypt));

      // Build tags array
      const tags: string[][] = [
        ["d", identifier],
        ENCRYPTED_TAG,
      ];

      // Create the event template
      const eventTemplate: EventTemplate = {
        kind: PRIVATE_BOOKMARK_KIND,
        content: encryptedContent,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      };

      // Sign with vault key
      const signedEvent = finalizeEvent(eventTemplate, state.keys.signingKey);

      // Publish to relays
      await nostr.event(signedEvent, { signal: AbortSignal.timeout(5000) });

      return signedEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privateBookmarks"] });
    },
  });
}

/**
 * Hook to delete a private bookmark.
 * Publishes an empty encrypted event with the same d-tag.
 */
export function useDeletePrivateBookmark() {
  const { nostr } = useNostr();
  const { state, encrypt } = useVault();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (identifier: string) => {
      if (state.status !== "unlocked") {
        throw new Error("Vault must be unlocked to delete private bookmarks");
      }

      // Create empty encrypted content to mark as deleted
      const emptyContent: EncryptedBookmarkContent = {
        url: "",
      };

      const encryptedContent = encrypt(JSON.stringify(emptyContent));

      const eventTemplate: EventTemplate = {
        kind: PRIVATE_BOOKMARK_KIND,
        content: encryptedContent,
        tags: [["d", identifier], ENCRYPTED_TAG],
        created_at: Math.floor(Date.now() / 1000),
      };

      const signedEvent = finalizeEvent(eventTemplate, state.keys.signingKey);

      await nostr.event(signedEvent, { signal: AbortSignal.timeout(5000) });

      return signedEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privateBookmarks"] });
    },
  });
}
