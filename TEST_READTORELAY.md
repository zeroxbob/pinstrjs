# Testing ReadToRelay Integration

## Quick Test in Browser Console

After enabling the feature, paste this into the browser console to test if ReadToRelay content exists on your relays:

```javascript
// Test 1: Check if feature is enabled
const config = JSON.parse(localStorage.getItem('app-config') || '{}');
console.log('Feature enabled:', config.showReadToRelay);

// Test 2: Manually query for ANY ReadToRelay content
// (This bypasses the React hooks to test raw relay queries)
async function testReadToRelayQuery() {
  // Get your bookmarked URLs from the page
  const bookmarkCards = document.querySelectorAll('[data-bookmark-url]');
  const urls = Array.from(bookmarkCards).map(card => card.getAttribute('data-bookmark-url'));

  console.log('Testing URLs:', urls);

  // Note: You'll need to manually test with the useNostr hook
  // This is a conceptual example
}

// Test 3: Query for ALL kind 30023 events (not filtered by URL)
// Add this to a React component with useNostr access:
/*
const { nostr } = useNostr();
const events = await nostr.query([{ kinds: [30023], limit: 50 }]);
console.log('Found', events.length, 'ReadToRelay articles');
console.log('Sample events:', events.slice(0, 5).map(e => ({
  id: e.id.substring(0, 8),
  title: e.tags.find(([n]) => n === 'title')?.[1],
  url: e.tags.find(([n]) => n === 'r')?.[1],
})));
*/
```

## Expected Behavior

### If ReadToRelay Content Exists:
1. Console shows `eventsFound: 1` or higher
2. Badge appears on bookmark card: "Saved Copy" button
3. Clicking badge navigates to `/article/[event-id]`

### If No ReadToRelay Content Exists:
1. Console shows `eventsFound: 0`
2. No badge appears (correct behavior!)
3. This is expected - ReadToRelay adoption may be low

## How to Create Test Data

To test the feature with guaranteed data:

1. **Use the ReadToRelay browser extension:**
   - Install from: https://github.com/vcavallo/ReadToRelay
   - Visit any article (e.g., a blog post)
   - Click the ReadToRelay extension
   - Save the article to Nostr
   - Copy the article URL

2. **Bookmark the same URL in Pinstr:**
   - Use the "Save to Pinstr" bookmarklet
   - Or add manually via "Add Bookmark" dialog

3. **The badge should now appear!**
   - Refresh the bookmarks page
   - You should see "Saved Copy" badge
   - Clicking it opens the article viewer

## Troubleshooting

### Badge doesn't appear despite console showing `eventsFound: 1`:
- Check if `featureEnabled: true` in console logs
- Inspect the bookmark card HTML - is `<ReadToRelayBadge />` rendering?
- Check browser console for React errors

### Feature toggle doesn't stay enabled:
- Check localStorage: `localStorage.getItem('app-config')`
- Try clearing localStorage and re-enabling
- Check for JavaScript errors preventing state updates

### Queries always return 0 results:
- **Most likely cause:** No ReadToRelay content exists for your bookmarks
- Try querying for ALL kind 30023 events (not filtered by URL)
- Check your relay configuration - are the relays responding?

## Advanced Debugging

Add this temporary component to manually test queries:

```typescript
// src/pages/DebugReadToRelay.tsx
export function DebugReadToRelay() {
  const { nostr } = useNostr();
  const [results, setResults] = useState<string>('');

  const testQuery = async () => {
    // Query for ANY ReadToRelay content
    const events = await nostr.query([{ kinds: [30023], limit: 20 }]);

    setResults(`Found ${events.length} ReadToRelay articles:\n\n` +
      events.map(e => {
        const title = e.tags.find(([n]) => n === 'title')?.[1] || 'Untitled';
        const url = e.tags.find(([n]) => n === 'r')?.[1] || 'No URL';
        return `- ${title}\n  URL: ${url}\n  ID: ${e.id.substring(0, 16)}`;
      }).join('\n\n')
    );
  };

  return (
    <div className="container py-8">
      <Button onClick={testQuery}>Test ReadToRelay Query</Button>
      <pre className="mt-4 whitespace-pre-wrap">{results}</pre>
    </div>
  );
}
```

Add route: `<Route path="/debug-rtr" element={<DebugReadToRelay />} />`
Visit: `http://localhost:5173/debug-rtr`
