import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostrPublish } from '@/hooks/useNostrPublish';

export interface CreateBookmarkData {
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
    // Remove the protocol and return the rest
    return urlObj.host + urlObj.pathname + urlObj.search + urlObj.hash;
  } catch {
    // If URL parsing fails, strip common protocols manually
    return url.replace(/^https?:\/\//, '');
  }
}

/**
 * Hook to create a new bookmark (NIP-B0)
 */
export function useCreateBookmark() {
  const { mutateAsync: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookmarkData) => {
      // Validate URL
      if (!data.url) {
        throw new Error('URL is required');
      }

      // Ensure URL has a protocol
      let fullUrl = data.url;
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `https://${fullUrl}`;
      }

      // Extract identifier for d-tag (URL without scheme)
      const identifier = extractIdentifier(fullUrl);

      // Build tags array
      const tags: string[][] = [
        ['d', identifier],
      ];

      // Add optional title tag
      if (data.title) {
        tags.push(['title', data.title]);
      }

      // Add optional published_at tag
      if (data.publishedAt) {
        tags.push(['published_at', data.publishedAt.toString()]);
      }

      // Add topic tags
      if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => {
          tags.push(['t', tag.toLowerCase()]);
        });
      }

      // Create the bookmark event
      const event = await publishEvent({
        kind: 39701,
        content: data.description || '',
        tags,
      });

      return event;
    },
    onSuccess: () => {
      // Invalidate bookmarks queries to refetch
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

/**
 * Hook to delete a bookmark
 */
export function useDeleteBookmark() {
  const { mutateAsync: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (identifier: string) => {
      // To delete, we publish a kind 39701 event with the same d-tag but empty content and no other tags
      // This effectively replaces the bookmark with an empty one
      const event = await publishEvent({
        kind: 39701,
        content: '',
        tags: [['d', identifier]],
      });

      return event;
    },
    onSuccess: () => {
      // Invalidate bookmarks queries to refetch
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}
