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
      // Use React Query's abort signal for cancellation
      const signal = c.signal;

      // Normalize the URL for matching - check 'r' tag with multiple URL variants
      const normalizeForMatch = (str: string) =>
        str.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

      // Create URL variants to handle different formats
      const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
      const urlWithHttps = urlWithoutProtocol.startsWith('http') ? urlWithoutProtocol : `https://${urlWithoutProtocol}`;
      const urlWithHttp = urlWithoutProtocol.startsWith('http') ? urlWithoutProtocol : `http://${urlWithoutProtocol}`;

      const urlVariants = [
        url,                    // Original (e.g., https://example.com/page or example.com/page)
        urlWithHttps,           // With https://
        urlWithHttp,            // With http://
        urlWithoutProtocol,     // Without protocol
      ];

      const normalizedVariants = [...new Set(urlVariants.map(normalizeForMatch))];

      // Query for NIP-23 long-form articles
      // The NPool (nostr) is already configured to route to user's read relays via reqRouter
      let events: NostrEvent[];

      try {
        // Fetch recent articles (relays efficiently filter by kind)
        // NPool automatically routes to user's configured read relays
        events = await nostr.query([{
          kinds: [30023],
          limit: 500,  // Fetch enough articles to find matches
        }], { signal: AbortSignal.any([signal, AbortSignal.timeout(60000)]) });
      } catch (error) {
        console.error('[useReadToRelayContent] ❌ Error fetching articles:', error);
        return null;
      }

      // Filter client-side for URL matches in 'r' tag only
      events = events.filter(event => {
        const rTag = event.tags.find(([name]) => name === 'r')?.[1];
        if (!rTag) return false;

        const normalizedRTag = normalizeForMatch(rTag);
        return normalizedVariants.some(variant => variant === normalizedRTag);
      });

      if (events.length === 0) {
        return null;
      }

      // Sort by created_at (newest first)
      events.sort((a, b) => b.created_at - a.created_at);

      // Transform events into article objects
      const articles: ReadToRelayArticle[] = events.map(event => {
        const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
        // Use 'r' tag for original URL (NIP-23 standard)
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
