import { useState } from 'react';
import { useNostr } from '@nostrify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function TestQueryPage() {
  const { nostr } = useNostr();
  const [testUrl, setTestUrl] = useState(
    'https://www.theguardian.com/books/2025/mar/19/george-orwell-me-richard-blair-life-with-extraordinary-father'
  );
  const [results, setResults] = useState<{
    urlVariants: string[];
    urlTagResults: number;
    rTagResults: number;
    clientSideMatches: number;
    matchedEvents: Array<{
      id: string;
      title: string;
      urlTag: string;
      dTag: string;
    }>;
    allEvents: unknown[];
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResults(null);

    try {
      console.log('🔍 Testing query for:', testUrl);

      // Create URL variants (same logic as useReadToRelayContent)
      const urlWithoutTimestamp = testUrl.replace(/-\d{10,}$/, '');
      const normalizedUrl = urlWithoutTimestamp.replace(/^https?:\/\//, '');
      const withoutWww = normalizedUrl.replace(/^www\./, '');
      const withWww = withoutWww.startsWith('www.') ? withoutWww : `www.${withoutWww}`;

      const urlVariants = [
        testUrl,
        urlWithoutTimestamp,
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

      console.log('📋 URL Variants:', uniqueUrls);

      // Test 1: Query with #url tag
      console.log('🔄 Test 1: Querying relay.damus.io with #url tag...');
      const relay = nostr.relay('wss://relay.damus.io');
      const eventsWithUrlTag = await relay.query(
        [
          {
            kinds: [30023],
            '#url': uniqueUrls,
            limit: 10,
          },
        ],
        { signal: AbortSignal.timeout(5000) }
      );

      console.log('✅ #url query results:', eventsWithUrlTag.length, 'events');

      // Test 2: Query with #r tag
      console.log('🔄 Test 2: Querying relay.damus.io with #r tag...');
      const eventsWithRTag = await relay.query(
        [
          {
            kinds: [30023],
            '#r': uniqueUrls,
            limit: 10,
          },
        ],
        { signal: AbortSignal.timeout(5000) }
      );

      console.log('✅ #r query results:', eventsWithRTag.length, 'events');

      // Test 3: Fetch all articles and filter client-side
      console.log('🔄 Test 3: Fetching all articles for client-side filtering...');
      const allArticles = await relay.query(
        [
          {
            kinds: [30023],
            limit: 100,
          },
        ],
        { signal: AbortSignal.timeout(10000) }
      );

      console.log('✅ Fetched', allArticles.length, 'articles');

      // Filter client-side
      const normalizeForMatch = (str: string) => {
        return str.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '').toLowerCase();
      };

      const matched = allArticles.filter((event) => {
        const urlTag = event.tags.find(([name]) => name === 'url')?.[1] || '';
        const rTag = event.tags.find(([name]) => name === 'r')?.[1] || '';
        const dTag = event.tags.find(([name]) => name === 'd')?.[1] || '';

        const normalizedUrlTag = normalizeForMatch(urlTag);
        const normalizedRTag = normalizeForMatch(rTag);
        const normalizedDTag = normalizeForMatch(dTag);

        return uniqueUrls.some((variant) => {
          const normalizedVariant = normalizeForMatch(variant);
          return (
            normalizedUrlTag === normalizedVariant ||
            normalizedRTag === normalizedVariant ||
            normalizedDTag.startsWith(normalizedVariant + '-') ||
            normalizedDTag === normalizedVariant
          );
        });
      });

      console.log('✅ Client-side filter found:', matched.length, 'matches');

      // Set results
      setResults({
        urlVariants: uniqueUrls,
        urlTagResults: eventsWithUrlTag.length,
        rTagResults: eventsWithRTag.length,
        clientSideMatches: matched.length,
        matchedEvents: matched.map((e) => ({
          id: e.id.substring(0, 8),
          title: e.tags.find((t) => t[0] === 'title')?.[1] || 'Untitled',
          urlTag: e.tags.find((t) => t[0] === 'url')?.[1] || '',
          dTag: e.tags.find((t) => t[0] === 'd')?.[1] || '',
        })),
        allEvents: eventsWithUrlTag.concat(eventsWithRTag),
      });
    } catch (error) {
      console.error('❌ Test failed:', error);
      setResults({
        urlVariants: [],
        urlTagResults: 0,
        rTagResults: 0,
        clientSideMatches: 0,
        matchedEvents: [],
        allEvents: [],
        error: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test Nostr Query for Guardian Article</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test URL:</label>
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter URL to test"
            />
          </div>

          <Button onClick={runTest} disabled={loading}>
            {loading ? 'Running Tests...' : 'Run Query Test'}
          </Button>

          {results && (
            <div className="space-y-4 mt-6">
              {results.error ? (
                <div className="text-red-500">
                  <strong>Error:</strong> {results.error}
                </div>
              ) : (
                <>
                  <div>
                    <strong>URL Variants Created:</strong>
                    <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded text-xs overflow-auto">
                      {JSON.stringify(results.urlVariants, null, 2)}
                    </pre>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{results.urlTagResults}</div>
                        <div className="text-sm text-muted-foreground">#url tag matches</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{results.rTagResults}</div>
                        <div className="text-sm text-muted-foreground">#r tag matches</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{results.clientSideMatches}</div>
                        <div className="text-sm text-muted-foreground">Client-side matches</div>
                      </CardContent>
                    </Card>
                  </div>

                  {results.matchedEvents.length > 0 && (
                    <div>
                      <strong>Matched Events:</strong>
                      <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded text-xs overflow-auto">
                        {JSON.stringify(results.matchedEvents, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
