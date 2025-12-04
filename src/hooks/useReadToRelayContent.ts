import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAppContext } from '@/hooks/useAppContext';

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
  const { config } = useAppContext();

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
      // Query user-configured relays (from settings) to maximize chance of finding content
      const readRelays = config.relayMetadata.relays
        .filter(r => r.read)  // Only use relays with read permission
        .map(r => r.url);

      // Fallback to default relays if user hasn't configured any read relays
      const relayUrls = readRelays.length > 0 ? readRelays : [
        'wss://relay.damus.io',
        'wss://relay.ditto.pub',
        'wss://relay.nostr.band',
      ];

      const relayGroup = nostr.group(relayUrls);

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
        console.log('[useReadToRelayContent] 📋 Bookmark URL:', url);
        console.log('[useReadToRelayContent] 🔄 URL Variants Created:', uniqueUrls);

        let allArticles;
        try {
          console.log('[useReadToRelayContent] 🔍 Starting query for all articles...');
          allArticles = await relayGroup.query([{
            kinds: [30023],
            limit: 500,  // Get more articles to improve match chances
          }], { signal });
          console.log('[useReadToRelayContent] ✅ Query completed successfully');
        } catch (error) {
          console.error('[useReadToRelayContent] ❌ Error fetching all articles:', error);
          console.error('[useReadToRelayContent] Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
          });
          return null;  // Return null to indicate no articles found
        }

        console.log('[useReadToRelayContent] 📚 Total articles fetched from relays:', allArticles.length);

        // Helper to decode base64 safely
        const tryDecodeBase64 = (str: string): string | null => {
          try {
            return atob(str);
          } catch {
            return null;
          }
        };

        // Normalize tags for comparison (remove scheme and www, and strip trailing slashes)
        const normalizeForMatch = (str: string) =>
          str.replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/$/, '');  // Remove trailing slash

        // Filter by checking if any tag contains our URL
        uniqueEvents = allArticles.filter(event => {
          const urlTag = event.tags.find(([name]) => name === 'url')?.[1] || '';
          const rTag = event.tags.find(([name]) => name === 'r')?.[1] || '';
          const dTag = event.tags.find(([name]) => name === 'd')?.[1] || '';
          const title = event.tags.find(([name]) => name === 'title')?.[1] || '';

          const normalizedUrlTag = normalizeForMatch(urlTag);
          const normalizedRTag = normalizeForMatch(rTag);
          const normalizedDTag = normalizeForMatch(dTag);

          // Try to decode d-tag as base64 (ReadToRelay might encode URLs in d-tag)
          const decodedDTag = tryDecodeBase64(dTag);
          const normalizedDecodedDTag = decodedDTag ? normalizeForMatch(decodedDTag) : '';

          // Check if any of these tags match our URL variants
          let matchReason = '';
          const matched = uniqueUrls.some(variant => {
            const normalizedVariant = normalizeForMatch(variant);

            // For url tag and r tag, do exact match (they should contain clean URLs)
            if (normalizedUrlTag && normalizedUrlTag === normalizedVariant) {
              matchReason = `url tag exact match: "${normalizedUrlTag}" === "${normalizedVariant}"`;
              return true;
            }
            if (normalizedRTag && normalizedRTag === normalizedVariant) {
              matchReason = `r tag exact match: "${normalizedRTag}" === "${normalizedVariant}"`;
              return true;
            }

            // For d-tag, allow prefix match (to handle timestamp suffixes like "-1764004814")
            if (normalizedDTag && normalizedDTag.startsWith(normalizedVariant + '-')) {
              matchReason = `d tag prefix match: "${normalizedDTag}" starts with "${normalizedVariant}-"`;
              return true;
            }
            if (normalizedDTag && normalizedDTag === normalizedVariant) {
              matchReason = `d tag exact match: "${normalizedDTag}" === "${normalizedVariant}"`;
              return true;
            }

            // Same for decoded d-tag
            if (normalizedDecodedDTag && normalizedDecodedDTag.startsWith(normalizedVariant + '-')) {
              matchReason = `decoded d tag prefix match: "${normalizedDecodedDTag}" starts with "${normalizedVariant}-"`;
              return true;
            }
            if (normalizedDecodedDTag && normalizedDecodedDTag === normalizedVariant) {
              matchReason = `decoded d tag exact match: "${normalizedDecodedDTag}" === "${normalizedVariant}"`;
              return true;
            }

            return false;
          });

          if (matched) {
            console.log('✅ MATCH FOUND:', {
              title,
              matchReason,
              articleTags: {
                url: urlTag,
                normalizedUrl: normalizedUrlTag,
                r: rTag,
                normalizedR: normalizedRTag,
                d: dTag,
                normalizedD: normalizedDTag,
              },
            });
          }

          return matched;
        });

        console.log('[useReadToRelayContent] 🎯 Client-side filter found:', uniqueEvents.length, 'matches');
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
