import { useParams, useNavigate } from 'react-router-dom';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Displays ReadToRelay articles (NIP-23 long-form content) with legal disclaimer.
 * These are community-saved versions of web articles.
 */
export function ArticlePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { nostr } = useNostr();

  const { data: event, isLoading } = useQuery({
    queryKey: ['article', eventId],
    queryFn: async (c) => {
      console.log('[ArticlePage] 🔍 Fetching event by ID:', eventId);

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(60000)]);  // 60 seconds to match useReadToRelayContent

      try {
        const events = await nostr.query([{ ids: [eventId!] }], { signal });
        console.log('[ArticlePage] ✅ Query returned', events.length, 'events');

        if (events.length === 0) {
          console.warn('[ArticlePage] ⚠️ Event not found on relays. Event ID:', eventId);
        } else {
          console.log('[ArticlePage] 📄 Event found:', {
            id: events[0].id.substring(0, 8),
            kind: events[0].kind,
            title: events[0].tags.find(t => t[0] === 'title')?.[1],
          });
        }

        return events[0] || null;
      } catch (err) {
        console.error('[ArticlePage] ❌ Error fetching event:', err);
        throw err;
      }
    },
    enabled: !!eventId,
  });

  const author = useAuthor(event?.pubkey || '');
  const authorName = author.data?.metadata?.name || 'Anonymous';

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Article not found</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  // Check both 'url' tag (used by ReadToRelay) and 'r' tag (NIP-23 standard)
  const originalUrl = event.tags.find(([name]) => name === 'url')?.[1]
    || event.tags.find(([name]) => name === 'r')?.[1];
  const client = event.tags.find(([name]) => name === 'client')?.[1];

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <Button onClick={() => navigate(-1)} variant="ghost" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Legal Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Community-Saved Content</AlertTitle>
        <AlertDescription>
          This article was saved to Nostr by a community member using{' '}
          {client || 'ReadToRelay'}. Pinstr displays this content as-is from
          decentralized relays. We respect copyright and intellectual property
          rights.{' '}
          {originalUrl && (
            <>
              Please{' '}
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                visit the original source
              </a>{' '}
              to support the author.
            </>
          )}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{title}</CardTitle>
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
            <span>Saved by {authorName}</span>
            {originalUrl && (
              <Button
                onClick={() => window.open(originalUrl, '_blank')}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                Original Source
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {event.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
