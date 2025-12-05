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

      // Normalize URLs by removing protocol, www, and trailing slash for comparison
      const normalizeForMatch = (str: string) =>
        str.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

      // Create URL variants for relay-side filtering
      // Relays can efficiently filter by exact r tag match, so we provide common variants
      const urlVariants = new Set<string>();

      // Add the original URL as-is
      urlVariants.add(url);

      // Generate variants with/without protocol
      const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
      urlVariants.add(urlWithoutProtocol);
      urlVariants.add(`https://${urlWithoutProtocol}`);
      urlVariants.add(`http://${urlWithoutProtocol}`);

      // Generate variants with/without www
      if (urlWithoutProtocol.startsWith('www.')) {
        const withoutWww = urlWithoutProtocol.replace(/^www\./, '');
        urlVariants.add(withoutWww);
        urlVariants.add(`https://${withoutWww}`);
        urlVariants.add(`http://${withoutWww}`);
      } else {
        urlVariants.add(`www.${urlWithoutProtocol}`);
        urlVariants.add(`https://www.${urlWithoutProtocol}`);
        urlVariants.add(`http://www.${urlWithoutProtocol}`);
      }

      // Generate variants with/without trailing slash
      const additionalVariants = new Set<string>();
      urlVariants.forEach(variant => {
        if (variant.endsWith('/')) {
          additionalVariants.add(variant.slice(0, -1));
        } else {
          additionalVariants.add(`${variant}/`);
        }
      });
      additionalVariants.forEach(v => urlVariants.add(v));

      const variantsArray = Array.from(urlVariants);

      // Query for NIP-23 long-form articles with relay-side filtering by r tag
      // The NPool (nostr) is already configured to route to user's read relays via reqRouter
      // Relays will only return articles with matching r tags (much more efficient!)
      let events: NostrEvent[];

      try {
        events = await nostr.query([{
          kinds: [30023],
          '#r': variantsArray,  // Relay filters by r tag - only returns matches!
        }], { signal: AbortSignal.any([signal, AbortSignal.timeout(60000)]) });
      } catch (error) {
        console.error('[useReadToRelayContent] ❌ Error fetching articles:', error);
        return null;
      }

      // Additional client-side normalization for edge cases
      // (in case article r tag doesn't exactly match any variant)
      const normalizedBookmarkUrl = normalizeForMatch(url);
      events = events.filter(event => {
        const rTag = event.tags.find(([name]) => name === 'r')?.[1];
        if (!rTag) return false;

        const normalizedRTag = normalizeForMatch(rTag);
        return normalizedBookmarkUrl === normalizedRTag;
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
