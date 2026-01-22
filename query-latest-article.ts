import { NRelay1 } from '@nostrify/nostrify';

async function getLatestArticle() {
  const relay = new NRelay1('wss://relay.damus.io');

  try {
    console.log('Querying Damus relay for latest kind 30023 event...\n');

    const events = await relay.query([{ kinds: [30023], limit: 1 }], {
      signal: AbortSignal.timeout(10000)
    });

    if (events.length === 0) {
      console.log('No kind 30023 events found on this relay.');
      return;
    }

    const event = events[0];

    console.log('=== LATEST KIND 30023 EVENT ===\n');
    console.log('Event ID:', event.id);
    console.log('Author (pubkey):', event.pubkey);
    console.log('Created at:', new Date(event.created_at * 1000).toLocaleString());
    console.log('\nTags:');

    // Extract important tags
    const dTag = event.tags.find(([name]) => name === 'd')?.[1];
    const title = event.tags.find(([name]) => name === 'title')?.[1];
    const summary = event.tags.find(([name]) => name === 'summary')?.[1];
    const publishedAt = event.tags.find(([name]) => name === 'published_at')?.[1];
    const topics = event.tags.filter(([name]) => name === 't').map(([, value]) => value);

    if (dTag) console.log('  - Identifier (d):', dTag);
    if (title) console.log('  - Title:', title);
    if (summary) console.log('  - Summary:', summary);
    if (publishedAt) console.log('  - Published at:', new Date(parseInt(publishedAt) * 1000).toLocaleString());
    if (topics.length > 0) console.log('  - Topics:', topics.join(', '));

    console.log('\nContent (first 500 characters):');
    console.log('---');
    console.log(event.content.substring(0, 500) + (event.content.length > 500 ? '...' : ''));
    console.log('---\n');

    console.log('Full event object:');
    console.log(JSON.stringify(event, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

getLatestArticle();
