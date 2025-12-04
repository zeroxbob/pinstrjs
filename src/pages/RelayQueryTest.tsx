import { useState } from 'react';
import { useNostr } from '@nostrify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export function RelayQueryTest() {
  const { nostr } = useNostr();
  const [url, setUrl] = useState('https://www.theguardian.com/books/2025/mar/19/george-orwell-me-richard-blair-life-with-extraordinary-father');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string>('');

  const testQuery = async () => {
    setIsLoading(true);
    setResults('');

    console.clear();
    console.log('🧪 Relay Query Test Started');
    console.log('=' .repeat(60));

    try {
      // Strip timestamp
      const urlWithoutTimestamp = url.replace(/-\d{10,}$/, '');
      console.log('\n📋 URL Processing:');
      console.log('  Original:', url);
      console.log('  Without timestamp:', urlWithoutTimestamp);

      // Create variants
      const normalizedUrl = urlWithoutTimestamp.replace(/^https?:\/\//, '');
      const withoutWww = normalizedUrl.replace(/^www\./, '');
      const withWww = withoutWww.startsWith('www.') ? withoutWww : `www.${withoutWww}`;

      const urlVariants = [
        url,
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

      console.log('\n🔄 URL Variants Created:');
      uniqueUrls.forEach((variant, i) => {
        console.log(`  ${i + 1}. ${variant}`);
      });

      // Test with single relay first
      const relay = nostr.relay('wss://relay.damus.io');

      console.log('\n🔍 Testing with relay.damus.io...');
      console.log('\n📡 Query Filter:');
      const filter = {
        kinds: [30023],
        '#url': uniqueUrls,
        limit: 10,
      };
      console.log(JSON.stringify(filter, null, 2));

      const events = await relay.query([filter], { signal: AbortSignal.timeout(10000) });

      console.log(`\n✅ Query Complete: ${events.length} events found`);

      if (events.length === 0) {
        console.log('\n⚠️  No events found with #url tag filter');
        console.log('Testing each URL variant individually...\n');

        for (const variant of uniqueUrls) {
          const singleResult = await relay.query([{
            kinds: [30023],
            '#url': [variant],
            limit: 1,
          }], { signal: AbortSignal.timeout(5000) });

          if (singleResult.length > 0) {
            console.log(`✅ FOUND with variant: ${variant}`);
            console.log('   Title:', singleResult[0].tags.find(([n]) => n === 'title')?.[1]);
            console.log('   url tag:', singleResult[0].tags.find(([n]) => n === 'url')?.[1]);
          }
        }
      } else {
        console.log('\n📄 Events Found:');
        events.forEach((event, i) => {
          const title = event.tags.find(([n]) => n === 'title')?.[1];
          const urlTag = event.tags.find(([n]) => n === 'url')?.[1];
          const dTag = event.tags.find(([n]) => n === 'd')?.[1];

          console.log(`\n${i + 1}. ${title}`);
          console.log(`   ID: ${event.id.substring(0, 16)}...`);
          console.log(`   url tag: ${urlTag}`);
          console.log(`   d tag: ${dTag}`);
        });
      }

      setResults(`✅ Query complete - check console for details\nFound: ${events.length} events`);

    } catch (error) {
      console.error('\n❌ Error during query:', error);
      setResults(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
      console.log('\n' + '='.repeat(60));
      console.log('🧪 Test Complete');
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Relay Query Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Test URL:</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to test"
              className="mb-4"
            />
          </div>

          <Button
            onClick={testQuery}
            disabled={isLoading || !url}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Query...
              </>
            ) : (
              'Run Relay Query Test'
            )}
          </Button>

          {results && (
            <div className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {results}
                  </pre>
                  <p className="text-sm text-muted-foreground mt-4">
                    Check browser console (F12) for detailed output
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
