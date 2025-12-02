import { useState } from 'react';
import { useNostr } from '@nostrify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/hooks/useAppContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Debug page for testing ReadToRelay integration.
 * Helps diagnose why saved copies aren't appearing on bookmarks.
 */
export function DebugReadToRelayPage() {
  const { nostr } = useNostr();
  const { config } = useAppContext();
  const navigate = useNavigate();
  const [results, setResults] = useState<string>('');
  const [testUrl, setTestUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testQueryAll = async () => {
    setIsLoading(true);
    setResults('Querying relays for ALL ReadToRelay content (kind 30023)...\n\n');

    try {
      const events = await nostr.query([{
        kinds: [30023],  // NIP-23 long-form content
        limit: 50,
      }], { signal: AbortSignal.timeout(5000) });

      const resultText = `Found ${events.length} ReadToRelay articles:\n\n` +
        events.map((e, i) => {
          const title = e.tags.find(([n]) => n === 'title')?.[1] || 'Untitled';
          const url = e.tags.find(([n]) => n === 'r')?.[1] || 'No URL';
          const client = e.tags.find(([n]) => n === 'client')?.[1] || 'Unknown';
          return `${i + 1}. ${title}\n   URL: ${url}\n   Client: ${client}\n   Event ID: ${e.id.substring(0, 16)}...`;
        }).join('\n\n');

      setResults(resultText || 'No ReadToRelay content found on your configured relays.');
    } catch (error) {
      setResults(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testQueryByUrl = async () => {
    if (!testUrl) {
      setResults('Please enter a URL to test.');
      return;
    }

    setIsLoading(true);
    const normalizedUrl = testUrl.replace(/^https?:\/\//, '');
    const urlVariants = [
      testUrl,
      `https://${normalizedUrl}`,
      `http://${normalizedUrl}`,
      normalizedUrl,
    ];
    const uniqueUrls = [...new Set(urlVariants)];

    setResults(`Querying relays for URL: ${testUrl}\nTrying variants: ${uniqueUrls.join(', ')}\n\n`);

    try {
      // Query for BOTH 'r' tag and 'url' tag (ReadToRelay uses 'url' tag)
      const [eventsWithRTag, eventsWithUrlTag] = await Promise.all([
        nostr.query([{
          kinds: [30023],
          '#r': uniqueUrls,
          limit: 10,
        }], { signal: AbortSignal.timeout(5000) }),
        nostr.query([{
          kinds: [30023],
          '#url': uniqueUrls,
          limit: 10,
        }], { signal: AbortSignal.timeout(5000) }),
      ]);

      // Combine and deduplicate
      const allEvents = [...eventsWithRTag, ...eventsWithUrlTag];
      const events = allEvents.filter((event, index, self) =>
        index === self.findIndex((e) => e.id === event.id)
      );

      const resultText = events.length > 0
        ? `✅ Found ${events.length} saved ${events.length === 1 ? 'copy' : 'copies'}:\n\n` +
          events.map((e, i) => {
            const title = e.tags.find(([n]) => n === 'title')?.[1] || 'Untitled';
            const urlTag = e.tags.find(([n]) => n === 'url')?.[1];
            const rTag = e.tags.find(([n]) => n === 'r')?.[1];
            const savedUrl = urlTag || rTag || 'No URL tag found';
            return `${i + 1}. ${title}\n   Saved URL: ${savedUrl}\n   Event ID: ${e.id.substring(0, 16)}...`;
          }).join('\n\n')
        : `❌ No saved copies found for this URL on your configured relays.`;

      setResults((prev) => prev + resultText);
    } catch (error) {
      setResults((prev) => prev + `\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <Button onClick={() => navigate(-1)} variant="ghost" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>ReadToRelay Integration Debugger</CardTitle>
          <p className="text-sm text-muted-foreground">
            Test ReadToRelay queries to diagnose why saved copies aren't appearing.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feature Status */}
          <div className="space-y-2">
            <h3 className="font-semibold">Feature Status</h3>
            <p className="text-sm">
              <strong>Enabled:</strong> {config.showReadToRelay ? '✅ Yes' : '❌ No (enable in Settings)'}
            </p>
            <p className="text-xs text-muted-foreground">
              The feature must be enabled in Settings for badges to appear.
            </p>
          </div>

          {/* Test Query All */}
          <div className="space-y-2">
            <h3 className="font-semibold">Test 1: Query All ReadToRelay Content</h3>
            <p className="text-sm text-muted-foreground">
              Query your configured relays for ANY kind 30023 events (not filtered by URL).
              This tests if ReadToRelay content exists at all on your relays.
            </p>
            <Button onClick={testQueryAll} disabled={isLoading}>
              {isLoading ? 'Querying...' : 'Query All ReadToRelay Articles'}
            </Button>
          </div>

          {/* Test Query by URL */}
          <div className="space-y-2">
            <h3 className="font-semibold">Test 2: Query by Specific URL</h3>
            <p className="text-sm text-muted-foreground">
              Enter a URL to check if ReadToRelay has saved a copy of that specific article.
            </p>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/article"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && testQueryByUrl()}
              />
              <Button onClick={testQueryByUrl} disabled={isLoading || !testUrl}>
                Test URL
              </Button>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-2">
              <h3 className="font-semibold">Results</h3>
              <pre className="bg-muted p-4 rounded-lg text-xs whitespace-pre-wrap overflow-x-auto">
                {results}
              </pre>
            </div>
          )}

          {/* Info */}
          <div className="space-y-2 border-t pt-4">
            <h3 className="font-semibold">What to Expect</h3>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li><strong>If no articles found:</strong> ReadToRelay content may be sparse - this is normal!</li>
              <li><strong>If articles found but badge doesn't appear:</strong> Check browser console for errors</li>
              <li><strong>To create test data:</strong> Use the ReadToRelay extension to save an article, then bookmark it in Pinstr</li>
              <li><strong>ReadToRelay repo:</strong> <a href="https://github.com/vcavallo/ReadToRelay" target="_blank" rel="noopener noreferrer" className="underline">github.com/vcavallo/ReadToRelay</a></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
