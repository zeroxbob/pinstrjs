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
      // First, strip any trailing timestamp suffix (e.g., -1764792475)
      // This handles cases where the bookmark URL has the timestamp appended
      const urlWithoutTimestamp = url.replace(/-\d{10,}$/, '');

      const normalizedUrl = urlWithoutTimestamp.replace(/^https?:\/\//, '');
      const withoutWww = normalizedUrl.replace(/^www\./, '');
      const withWww = withoutWww.startsWith('www.') ? withoutWww : `www.${withoutWww}`;

      const urlVariants = [
        url,                              // Original URL as-is (with timestamp if present)
        urlWithoutTimestamp,              // URL with timestamp stripped
        `https://${normalizedUrl}`,       // With https://
        `http://${normalizedUrl}`,        // With http://
        normalizedUrl,                    // Without scheme
        `https://${withoutWww}`,          // Without www + https
        `http://${withoutWww}`,           // Without www + http
        withoutWww,                       // Without www, without scheme
        `https://${withWww}`,             // With www + https
        `http://${withWww}`,              // With www + http
        withWww,                          // With www, without scheme
      ];

      // Remove duplicates
      const uniqueUrls = [...new Set(urlVariants)];

      console.log('[useReadToRelayContent] 🔍 Starting query for URL:', url);
      console.log('[useReadToRelayContent] 📋 URL after timestamp strip:', urlWithoutTimestamp);
      console.log('[useReadToRelayContent] 🔄 Created URL variants:', uniqueUrls);

      // Query for NIP-23 long-form articles
      // The NPool (nostr) is already configured to route to user's read relays via reqRouter
      // No need to manually create a relay group - just use nostr directly

      // Query for kind 30023 events (relays index by kind efficiently)
      // We can't rely on #url or #r tags (not indexed by most relays)
      // The #d tag IS indexed, but contains timestamp suffixes, so we fetch a broader set
      // and filter client-side for matches
      console.log('[useReadToRelayContent] 📋 Bookmark URL:', url);
      console.log('[useReadToRelayContent] 🔄 URL Variants Created:', uniqueUrls);

      let uniqueEvents: NostrEvent[];

      try {
        console.log('[useReadToRelayContent] 🔍 Fetching kind 30023 events for client-side filtering...');

        // Fetch recent articles (relays efficiently filter by kind)
        // NPool automatically routes to user's configured read relays
        uniqueEvents = await nostr.query([{
          kinds: [30023],
          limit: 500,  // Fetch enough articles to find matches
        }], { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) });

        console.log('[useReadToRelayContent] ✅ Fetched', uniqueEvents.length, 'articles');
      } catch (error) {
        console.error('[useReadToRelayContent] ❌ Error fetching articles:', error);
        return null;
      }

      // Filter client-side for URL matches
      console.log('[useReadToRelayContent] 🔍 Filtering for URL matches...');

      const normalizeForMatch = (str: string) =>
        str.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

      uniqueEvents = uniqueEvents.filter(event => {
        const urlTag = event.tags.find(([name]) => name === 'url')?.[1] || '';
        const rTag = event.tags.find(([name]) => name === 'r')?.[1] || '';
        const dTag = event.tags.find(([name]) => name === 'd')?.[1] || '';

        const normalizedUrlTag = normalizeForMatch(urlTag);
        const normalizedRTag = normalizeForMatch(rTag);
        const normalizedDTag = normalizeForMatch(dTag);

        return uniqueUrls.some(variant => {
          const normalizedVariant = normalizeForMatch(variant);

          // Exact match for url and r tags
          if (normalizedUrlTag && normalizedUrlTag === normalizedVariant) {
            console.log('✅ MATCH (url tag):', event.tags.find(t => t[0] === 'title')?.[1]);
            return true;
          }
          if (normalizedRTag && normalizedRTag === normalizedVariant) {
            console.log('✅ MATCH (r tag):', event.tags.find(t => t[0] === 'title')?.[1]);
            return true;
          }

          // Prefix match for d tag (handles timestamp suffixes like -1764004814)
          if (normalizedDTag && (
            normalizedDTag === normalizedVariant ||
            normalizedDTag.startsWith(normalizedVariant + '-')
          )) {
            console.log('✅ MATCH (d tag):', event.tags.find(t => t[0] === 'title')?.[1]);
            return true;
          }

          return false;
        });
      });

      console.log('[useReadToRelayContent] 🎯 Found', uniqueEvents.length, 'matching articles');

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

      console.log(`[useReadToRelayContent] 🎯 Result: Found ${events.length} matching articles for URL: ${url}`);

      if (events.length === 0) {
        console.log('[useReadToRelayContent] ⚠️ No matches found for this URL');
        return null;
      }

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
