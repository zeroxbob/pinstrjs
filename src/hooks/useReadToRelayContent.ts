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
 * with a 'url' tag (or 'r' tag) containing the original URL.
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

      console.log('[useReadToRelayContent] Querying for:', {
        originalUrl: url,
        urlVariants: uniqueUrls,
        filters: [
          { kinds: [30023], '#r': uniqueUrls, limit: 10 },
          { kinds: [30023], '#url': uniqueUrls, limit: 10 },
        ]
      });

      // Query for NIP-23 long-form articles with BOTH 'r' tag and 'url' tag matching any URL variant
      // ReadToRelay may use either tag depending on version
      // Query ALL relays (not just the fastest) to maximize chance of finding content
      const relayGroup = nostr.group([
        'wss://relay.damus.io',
        'wss://relay.ditto.pub',
        'wss://relay.nostr.band',
        'wss://relay.primal.net',
      ]);

      const [eventsWithRTag, eventsWithUrlTag] = await Promise.all([
        relayGroup.query([{
          kinds: [30023],  // NIP-23 long-form content
          '#r': uniqueUrls,
          limit: 10,
        }], { signal }),
        relayGroup.query([{
          kinds: [30023],  // NIP-23 long-form content
          '#url': uniqueUrls,
          limit: 10,
        }], { signal }),
      ]);

      // Combine results and deduplicate by event ID
      const allEvents = [...eventsWithRTag, ...eventsWithUrlTag];
      let uniqueEvents = allEvents.filter((event, index, self) =>
        index === self.findIndex((e) => e.id === event.id)
      );

      // If no matches found via tags, try querying ALL kind 30023 events and filter client-side
      // This handles cases where relays don't index 'url' tags properly
      if (uniqueEvents.length === 0) {
        console.log('[useReadToRelayContent] No tag matches, trying client-side filter...');
        const allArticles = await relayGroup.query([{
          kinds: [30023],
          limit: 100,  // Get recent articles
        }], { signal });

        // Filter by checking if any tag contains our URL
        uniqueEvents = allArticles.filter(event => {
          const urlTag = event.tags.find(([name]) => name === 'url')?.[1] || '';
          const rTag = event.tags.find(([name]) => name === 'r')?.[1] || '';
          const dTag = event.tags.find(([name]) => name === 'd')?.[1] || '';

          // Check if any of these tags contain our URL (allowing for timestamp suffixes)
          return uniqueUrls.some(variant =>
            urlTag.includes(variant) ||
            rTag.includes(variant) ||
            dTag.includes(variant)
          );
        });

        console.log('[useReadToRelayContent] Client-side filter found:', uniqueEvents.length);
      }

      const events = uniqueEvents;

      console.log('[useReadToRelayContent] Query results:', {
        url,
        eventsFound: events.length,
        events: events.map(e => ({
          id: e.id.substring(0, 8),
          title: e.tags.find(([n]) => n === 'title')?.[1],
          rTag: e.tags.find(([n]) => n === 'r')?.[1],
          urlTag: e.tags.find(([n]) => n === 'url')?.[1],
        })),
      });

      if (events.length === 0) return null;

      // Sort by created_at (newest first)
      events.sort((a, b) => b.created_at - a.created_at);

      // Transform events into article objects
      const articles: ReadToRelayArticle[] = events.map(event => {
        const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
        // Check both 'url' tag (used by ReadToRelay) and 'r' tag (NIP-23 standard)
        const originalUrl = event.tags.find(([name]) => name === 'url')?.[1]
          || event.tags.find(([name]) => name === 'r')?.[1]
          || url;
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
