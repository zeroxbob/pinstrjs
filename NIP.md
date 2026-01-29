# Custom Nostr Implementation Possibilities

This document describes the Nostr protocol implementations used in this project.

## NIP-B0: Web Bookmarks

This project implements NIP-B0 for decentralized web bookmarking on the Nostr protocol.

### Event Kinds

- **Kind 39701**: Public Web Bookmark (Addressable Event)
- **Kind 39702**: Private Web Bookmark (Encrypted, Vault-signed)

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

## Private Bookmarks (Kind 39702)

Private bookmarks use a separate kind (39702) to prevent other clients from displaying encrypted content as scrambled text.

### Vault System

Private bookmarks are encrypted and signed using a vault keypair derived from a user passphrase:

1. **Key Derivation**: Argon2id (t=3, m=65536 KiB, p=4) derives 64 bytes from the passphrase
   - First 32 bytes: Signing key (secp256k1 private key)
   - Second 32 bytes: AES-256-GCM encryption key
   - Salt: SHA256("pinstr-vault-v1:{user_pubkey}")

2. **Encryption**: AES-256-GCM with random 12-byte nonce
   - Format: `hex(nonce):hex(ciphertext)`

### Private Bookmark Structure

**Content Field:**
The `.content` field contains encrypted JSON with all bookmark data:

```json
{
  "url": "https://example.com/page",
  "title": "Page Title",
  "description": "A description",
  "tags": ["tag1", "tag2"],
  "publishedAt": 1737475200
}
```

**Tags:**
- `d`: Random UUID (prevents URL correlation)

### Example Private Bookmark Event

```json
{
  "kind": 39702,
  "content": "a1b2c3d4e5f6...:encrypted_json_here...",
  "tags": [
    ["d", "550e8400-e29b-41d4-a716-446655440000"]
  ],
  "created_at": 1737475200,
  "pubkey": "vault_pubkey_not_user_pubkey",
  "id": "...",
  "sig": "..."
}
```

### Why Separate Kinds?

Using the same kind (39701) for both public and private bookmarks causes issues:
- Other clients see encrypted content as scrambled text
- No way for clients to filter out encrypted bookmarks
- Pollutes public bookmark feeds with undecryptable content

Kind 39702 allows:
- Clean separation of public/private bookmarks
- Clients can choose to support or ignore private bookmarks
- Private bookmarks only visible to apps with vault support
