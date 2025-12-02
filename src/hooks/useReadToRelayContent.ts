import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

export interface ReadToRelayArticle {
  event: NostrEvent;
  title: string;
  content: string;
  originalUrl: string;
  author: string;
  publishedAt: number;
}

/**
 * Queries Nostr relays for ReadToRelay articles matching a URL.
 * ReadToRelay saves articles as NIP-23 long-form content (kind 30023)
 * with an 'r' tag containing the original URL.
 */
export function useReadToRelayContent(url: string, enabled: boolean = true) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['readtorelay-content', url],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Normalize URL - try multiple variants to maximize matches
      const normalizedUrl = url.replace(/^https?:\/\//, '');
      const urlVariants = [
        url,
        `https://${normalizedUrl}`,
        `http://${normalizedUrl}`,
        normalizedUrl,
      ];

      // Remove duplicates
      const uniqueUrls = [...new Set(urlVariants)];

      // Query for NIP-23 long-form articles with 'r' tag matching any URL variant
      const events = await nostr.query([{
        kinds: [30023],  // NIP-23 long-form content
        '#r': uniqueUrls,
        limit: 10,  // Multiple people may have saved the same URL
      }], { signal });

      if (events.length === 0) return null;

      // Sort by created_at (newest first)
      events.sort((a, b) => b.created_at - a.created_at);

      // Transform events into article objects
      const articles: ReadToRelayArticle[] = events.map(event => {
        const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
        const originalUrl = event.tags.find(([name]) => name === 'r')?.[1] || url;
        const publishedAtTag = event.tags.find(([name]) => name === 'published_at')?.[1];
        const publishedAt = publishedAtTag ? parseInt(publishedAtTag) : event.created_at;

        return {
          event,
          title,
          content: event.content,
          originalUrl,
          author: event.pubkey,
          publishedAt,
        };
      });

      return articles;
    },
    enabled: !!url && enabled,  // Only run if URL is provided and feature is enabled
    staleTime: 10 * 60 * 1000,  // Cache for 10 minutes
    retry: 1,  // Only retry once on failure
  });
}
