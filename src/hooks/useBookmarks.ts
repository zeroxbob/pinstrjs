import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * NIP-B0 Bookmark Event Structure
 * Kind: 39701
 * - d tag: URL without scheme (https:// or http:// assumed)
 * - title tag: Bookmark title
 * - published_at tag: Unix timestamp of initial publication
 * - t tags: Hashtags/topics
 * - content: Detailed description (can be empty string)
 */

export interface Bookmark {
  id: string;
  event: NostrEvent;
  url: string;
  title?: string;
  description: string;
  tags: string[];
  publishedAt?: number;
  createdAt: number;
  author: string;
  /** Whether this is a private (encrypted) bookmark */
  isPrivate?: boolean;
}

/**
 * Validates that an event is a valid NIP-B0 bookmark
 */
function validateBookmark(event: NostrEvent): boolean {
  // Must be kind 39701
  if (event.kind !== 39701) return false;

  // Must have a 'd' tag with the URL
  const dTag = event.tags.find(([name]) => name === 'd')?.[1];
  if (!dTag) return false;

  return true;
}

/**
 * Transforms a Nostr event into a Bookmark object
 */
function transformBookmark(event: NostrEvent): Bookmark {
  const dTag = event.tags.find(([name]) => name === 'd')?.[1] || '';
  const titleTag = event.tags.find(([name]) => name === 'title')?.[1];
  const publishedAtTag = event.tags.find(([name]) => name === 'published_at')?.[1];
  const topicTags = event.tags.filter(([name]) => name === 't').map(([_, value]) => value);

  // Reconstruct full URL from d tag
  const url = dTag.startsWith('http://') || dTag.startsWith('https://')
    ? dTag
    : `https://${dTag}`;

  return {
    id: event.id,
    event,
    url,
    title: titleTag,
    description: event.content,
    tags: topicTags,
    publishedAt: publishedAtTag ? parseInt(publishedAtTag) : undefined,
    createdAt: event.created_at,
    author: event.pubkey,
  };
}

/**
 * Hook to fetch all bookmarks from Nostr
 */
export function useBookmarks() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [{ kinds: [39701], limit: 100 }],
        { signal }
      );

      // Filter and transform valid bookmarks
      const bookmarks = events
        .filter(validateBookmark)
        .map(transformBookmark)
        .sort((a, b) => b.createdAt - a.createdAt);

      return bookmarks;
    },
  });
}

/**
 * Hook to fetch bookmarks from a specific user
 */
export function useUserBookmarks(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['bookmarks', 'user', pubkey],
    queryFn: async (c) => {
      if (!pubkey) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [{ kinds: [39701], authors: [pubkey], limit: 100 }],
        { signal }
      );

      const bookmarks = events
        .filter(validateBookmark)
        .map(transformBookmark)
        .sort((a, b) => b.createdAt - a.createdAt);

      return bookmarks;
    },
    enabled: !!pubkey,
  });
}

/**
 * Hook to fetch a single bookmark by its d-tag identifier
 */
export function useBookmark(pubkey: string, identifier: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['bookmark', pubkey, identifier],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [{
          kinds: [39701],
          authors: [pubkey],
          '#d': [identifier],
          limit: 1,
        }],
        { signal }
      );

      if (events.length === 0 || !validateBookmark(events[0])) {
        return null;
      }

      return transformBookmark(events[0]);
    },
    enabled: !!pubkey && !!identifier,
  });
}
