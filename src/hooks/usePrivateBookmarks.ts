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
 * Generates a random identifier for the d-tag.
 * Using random IDs prevents any correlation between bookmarks and URLs.
 */
function generateRandomId(): string {
  return crypto.randomUUID();
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
    isPrivate: true,
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

      // Decrypt all events from the vault pubkey
      const bookmarks: Bookmark[] = [];

      for (const event of events) {
        try {
          const decryptedJson = decrypt(event.content);
          const decryptedContent = JSON.parse(
            decryptedJson
          ) as EncryptedBookmarkContent;

          // Skip "deleted" bookmarks (empty URL)
          if (!decryptedContent.url) continue;

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
 * Hook to fetch a single private bookmark by URL.
 * Since d-tags are random, we must fetch all bookmarks and find by URL.
 */
export function usePrivateBookmarkByUrl(url: string) {
  const { data: bookmarks, isLoading, error } = usePrivateBookmarks();

  const bookmark = bookmarks?.find((b) => b.url === url) ?? null;

  return {
    data: bookmark,
    isLoading,
    error,
  };
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

      // Generate random d-tag (no correlation to URL possible)
      const identifier = generateRandomId();

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

      // Only d-tag with hashed identifier - no metadata leakage
      const tags: string[][] = [["d", identifier]];

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
 *
 * Since d-tags are random, you must provide the d-tag directly.
 * Get it from the bookmark's event tags: event.tags.find(t => t[0] === 'd')?.[1]
 */
export function useDeletePrivateBookmark() {
  const { nostr } = useNostr();
  const { state, encrypt } = useVault();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dTag: string) => {
      if (state.status !== "unlocked") {
        throw new Error("Vault must be unlocked to delete private bookmarks");
      }

      if (!dTag) {
        throw new Error("d-tag is required to delete a bookmark");
      }

      // Create empty encrypted content to mark as deleted
      const emptyContent: EncryptedBookmarkContent = {
        url: "",
      };

      const encryptedContent = encrypt(JSON.stringify(emptyContent));

      const eventTemplate: EventTemplate = {
        kind: PRIVATE_BOOKMARK_KIND,
        content: encryptedContent,
        tags: [["d", dTag]],
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
