import { useState } from 'react';
import { useNostr } from '@nostrify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export function DetailedDebugPage() {
  const { nostr } = useNostr();
  const [url, setUrl] = useState('www.yesigiveafig.com/p/part-1-my-life-is-a-lie');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);

  const runDetailedDebug = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const debugResults = {
        step1: {} as Record<string, unknown>,
        step2: {} as Record<string, unknown>,
        step3: {} as Record<string, unknown>,
        step4: {} as Record<string, unknown>,
      };

      // STEP 1: Generate URL variants
      const normalizedUrl = url.replace(/^https?:\/\//, '');
      const withoutWww = normalizedUrl.replace(/^www\./, '');
      const withWww = withoutWww.startsWith('www.') ? withoutWww : `www.${withoutWww}`;

      const urlVariants = [
        url,
        `https://${normalizedUrl}`,
        `http://${normalizedUrl}`,
        normalizedUrl,
        `https://${withoutWww}`,
        `http://${withoutWww}`,
        withoutWww,
        `https://${withWww}`,
        `http://${withWww}`,
        withWww,
      ];

      const uniqueUrls = [...new Set(urlVariants)];

      debugResults.step1 = {
        originalUrl: url,
        normalizedUrl,
        withoutWww,
        withWww,
        uniqueUrls,
        count: uniqueUrls.length,
      };

      // STEP 2: Query with #r tag
      const relayGroup = nostr.group([
        'wss://relay.damus.io',
        'wss://relay.ditto.pub',
        'wss://relay.nostr.band',
        'wss://relay.primal.net',
      ]);

      const eventsWithRTag = await relayGroup.query([{
        kinds: [30023],
        '#r': uniqueUrls,
        limit: 10,
      }], { signal: AbortSignal.timeout(5000) });

      debugResults.step2 = {
        query: { kinds: [30023], '#r': uniqueUrls, limit: 10 },
        resultsCount: eventsWithRTag.length,
        events: eventsWithRTag.map(e => ({
          id: e.id,
          title: e.tags.find(([n]) => n === 'title')?.[1],
          rTag: e.tags.find(([n]) => n === 'r')?.[1],
          allTags: e.tags,
        })),
      };

      // STEP 3: Query with #url tag
      const eventsWithUrlTag = await relayGroup.query([{
        kinds: [30023],
        '#url': uniqueUrls,
        limit: 10,
      }], { signal: AbortSignal.timeout(5000) });

      debugResults.step3 = {
        query: { kinds: [30023], '#url': uniqueUrls, limit: 10 },
        resultsCount: eventsWithUrlTag.length,
        events: eventsWithUrlTag.map(e => ({
          id: e.id,
          title: e.tags.find(([n]) => n === 'title')?.[1],
          urlTag: e.tags.find(([n]) => n === 'url')?.[1],
          allTags: e.tags,
        })),
      };

      // STEP 4: Get ALL kind 30023 events and try client-side matching
      const allArticles = await relayGroup.query([{
        kinds: [30023],
        limit: 100,
      }], { signal: AbortSignal.timeout(5000) });

      debugResults.step4.totalArticles = allArticles.length;
      debugResults.step4.allArticlesPreview = allArticles.slice(0, 10).map(e => ({
        id: e.id.substring(0, 8),
        title: e.tags.find(([n]) => n === 'title')?.[1],
        urlTag: e.tags.find(([n]) => n === 'url')?.[1],
        rTag: e.tags.find(([n]) => n === 'r')?.[1],
        dTag: e.tags.find(([n]) => n === 'd')?.[1],
      }));

      // Try matching
      const normalizeForMatch = (str: string) =>
        str.replace(/^https?:\/\//, '').replace(/^www\./, '');

      const matchedArticles = allArticles.filter(event => {
        const urlTag = event.tags.find(([name]) => name === 'url')?.[1] || '';
        const rTag = event.tags.find(([name]) => name === 'r')?.[1] || '';
        const dTag = event.tags.find(([name]) => name === 'd')?.[1] || '';

        const normalizedUrlTag = normalizeForMatch(urlTag);
        const normalizedRTag = normalizeForMatch(rTag);
        const normalizedDTag = normalizeForMatch(dTag);

        const matches = uniqueUrls.some(variant => {
          const normalizedVariant = normalizeForMatch(variant);
          return normalizedUrlTag.includes(normalizedVariant) ||
            normalizedRTag.includes(normalizedVariant) ||
            normalizedDTag.includes(normalizedVariant) ||
            normalizedVariant.includes(normalizedUrlTag) ||
            normalizedVariant.includes(normalizedRTag) ||
            normalizedVariant.includes(normalizedDTag);
        });

        if (matches) {
          // Log the match details
          console.log('[CLIENT-SIDE MATCH]', {
            eventId: event.id.substring(0, 8),
            urlTag, rTag, dTag,
            normalizedUrlTag, normalizedRTag, normalizedDTag,
            searchingFor: uniqueUrls.map(normalizeForMatch),
          });
        }

        return matches;
      });

      debugResults.step4.matchedArticles = matchedArticles.map(e => ({
        id: e.id,
        title: e.tags.find(([n]) => n === 'title')?.[1],
        urlTag: e.tags.find(([n]) => n === 'url')?.[1],
        rTag: e.tags.find(([n]) => n === 'r')?.[1],
        dTag: e.tags.find(([n]) => n === 'd')?.[1],
        allTags: e.tags,
      }));

      debugResults.step4.matchCount = matchedArticles.length;

      setResults(debugResults);
    } catch (error) {
      setResults({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Detailed ReadToRelay Debug</h1>
        <p className="text-muted-foreground mt-2">
          Step-by-step debugging of URL matching
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to test"
          />
          <Button onClick={runDetailedDebug} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Detailed Debug
          </Button>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: URL Normalization</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(results.step1, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 2: Query with #r Tag</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(results.step2, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 3: Query with #url Tag</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(results.step3, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 4: Client-Side Matching</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">All Articles Preview (first 10 of {(results.step4 as Record<string, unknown>).totalArticles as number}):</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify((results.step4 as Record<string, unknown>).allArticlesPreview, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Matched Articles ({(results.step4 as Record<string, unknown>).matchCount as number}):</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify((results.step4 as Record<string, unknown>).matchedArticles, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
