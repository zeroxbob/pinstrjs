# Custom Nostr Implementation Possibilities

This document describes the Nostr protocol implementations used in this project.

## NIP-B0: Web Bookmarks

This project implements NIP-B0 for decentralized web bookmarking on the Nostr protocol.

### Event Kind

- **Kind 39701**: Web Bookmark (Addressable Event)

### Event Structure

**Content Field:**
The `.content` field contains a detailed description of the web bookmark. It may be empty.

**Required Tags:**
- `d`: The URL without the scheme (https:// or http:// is always assumed)

**Optional Tags:**
- `t`: Topics/hashtags relevant to the bookmark
- `published_at`: Unix timestamp (stringified) of when the bookmark was first published
- `title`: Descriptive title suitable for HTML link elements

### Example Event

```json
{
  "kind": 39701,
  "content": "A comprehensive guide to the Nostr protocol and its implementation possibilities",
  "tags": [
    ["d", "github.com/nostr-protocol/nips"],
    ["title", "Nostr Implementation Possibilities"],
    ["published_at", "1737475200"],
    ["t", "nostr"],
    ["t", "protocol"],
    ["t", "documentation"]
  ],
  "created_at": 1737475200,
  "pubkey": "...",
  "id": "...",
  "sig": "..."
}
```

### Querying Bookmarks

Bookmarks can be queried using the standard Nostr filter format:

```typescript
// Query all bookmarks by a specific author
const bookmarks = await nostr.query([{
  kinds: [39701],
  authors: [pubkey],
  limit: 50
}], { signal });

// Query a specific bookmark by URL
const bookmark = await nostr.query([{
  kinds: [39701],
  authors: [pubkey],
  '#d': ['github.com/nostr-protocol/nips']
}], { signal });
```

### Comments on Bookmarks

According to NIP-B0, responses to kind 39701 events must use kind 1111 events as comments with NIP-22, establishing a structured comment hierarchy.

### Implementation Notes

- The `d` tag enables clients to query bookmark events by URL
- The specification assumes HTTPS or HTTP scheme universally, eliminating redundancy
- Multiple users can bookmark the same URL, each creating their own kind 39701 event
- Bookmarks are addressable events, meaning only the latest version per user+URL combination is stored
