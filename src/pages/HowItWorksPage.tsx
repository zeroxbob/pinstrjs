import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function HowItWorksPage() {
  useSeoMeta({
    title: 'How It Works - Pinstr',
    description: 'Learn how Pinstr works: client-side architecture, public bookmarks on Nostr, and encrypted private bookmarks.',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-8 hover:opacity-80 transition-opacity"
          >
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Pinstr
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Bookmarks on Nostr
            </p>
          </Link>

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">How It Works</h2>
          <p className="text-muted-foreground mt-1">
            A look under the hood at how Pinstr stores and protects your bookmarks.
          </p>
        </div>

        <div className="space-y-6">
          {/* Architecture Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Pinstr is a client-side web application. There is no Pinstr server. Everything
                happens in your browser: signing events, encrypting private bookmarks, and
                communicating with Nostr relays.
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
{`┌─────────────────────────────────────────────────┐
│                  Your Browser                   │
│                                                 │
│  ┌───────────┐    ┌───────────┐    ┌─────────┐  │
│  │  Pinstr   │───▶│  NIP-07   │───▶│  Sign   │  │
│  │   App     │    │  Signer   │    │  Event  │  │
│  └─────┬─────┘    └───────────┘    └─────────┘  │
│        │                                        │
└────────┼────────────────────────────────────────┘
         │
         │  Signed Nostr events
         ▼
┌────────────────┐  ┌────────────────┐
│   Relay A      │  │   Relay B      │  ...
│  wss://...     │  │  wss://...     │
└────────────────┘  └────────────────┘
         │
         ▼
   Other Nostr clients can
   read your public bookmarks`}
              </pre>
              <p>
                Your browser extension (nos2x, Alby, etc.) holds your private key and signs
                events on your behalf. Pinstr never sees or stores your nsec.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Public Bookmarks */}
          <Card>
            <CardHeader>
              <CardTitle>Public Bookmarks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Public bookmarks are standard Nostr events of kind <strong className="text-foreground">39701</strong> (defined
                in <a href="https://github.com/nostr-protocol/nips/blob/master/B0.md" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">NIP-B0</a>).
                They contain the URL, a title, tags, and a description — all in plain text.
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
{`Public Bookmark (kind 39701)
┌──────────────────────────────────────┐
│  d: "example.com/article"            │  ← URL (identifier)
│  title: "Great Article"              │  ← Title
│  t: ["nostr", "dev"]                 │  ← Tags
│  content: "Worth reading..."         │  ← Description
│  pubkey: <your public key>           │
│  sig: <signed by your key>           │
└──────────────────────────────────────┘
         │
         ▼
   Published to your relays
   Visible to anyone`}
              </pre>
              <p>
                Because these are addressable events (NIP-33), updating a bookmark for the same URL
                replaces the previous version. Deleting sends a deletion request, though relays
                are not required to honor it.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Private Bookmarks */}
          <Card>
            <CardHeader>
              <CardTitle>Private Bookmarks (Vault)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Private bookmarks are encrypted before leaving your browser. They use a completely
                separate identity so they cannot be linked back to your public Nostr profile.
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
{`Your Passphrase + Your npub
         │
         ▼
┌─────────────────────┐
│     Argon2id         │  ← Memory-hard key derivation
│  (expensive to       │
│   brute-force)       │
└────────┬────────────┘
         │
         ▼  64 bytes
   ┌─────┴──────┐
   │            │
   ▼            ▼
Signing Key  Encryption Key
 (32 bytes)   (32 bytes)
   │            │
   │            ▼
   │     ┌──────────────┐
   │     │  AES-256-GCM  │ ← Encrypts bookmark content
   │     └──────┬───────┘
   │            │
   ▼            ▼
Separate    Encrypted event
npub        (kind 39702)
   │            │
   └─────┬──────┘
         │
         ▼
   Published to relays
   Nobody can read it
   Nobody knows it's yours`}
              </pre>

              <div className="space-y-2">
                <p className="font-medium text-foreground">Key properties:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong className="text-foreground">Unlinkable</strong> — private bookmarks are
                    signed by a separate keypair derived from your passphrase, not your main Nostr key.
                    An observer sees events from an unrelated pubkey.
                  </li>
                  <li>
                    <strong className="text-foreground">Quantum-resistant</strong> — AES-256-GCM and
                    Argon2id are symmetric/hash-based algorithms. Unlike elliptic curve crypto, they
                    are not vulnerable to quantum computers.
                  </li>
                  <li>
                    <strong className="text-foreground">Recoverable</strong> — the encryption salt is
                    derived deterministically from your npub. On any device, entering the same passphrase
                    with the same Nostr account regenerates the same vault keys.
                  </li>
                  <li>
                    <strong className="text-foreground">Zero-knowledge</strong> — your passphrase never
                    leaves your browser. It is not stored anywhere. If you forget it, your private
                    bookmarks are unrecoverable.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Data Flow Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Data Flow Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
{`You add a bookmark
         │
         ├─ Public?
         │    │
         │    ▼
         │  Create kind 39701 event
         │  Sign with your Nostr key (via extension)
         │  Publish plaintext to relays
         │
         └─ Private?
              │
              ▼
           Encrypt content with AES-256-GCM
           Create kind 39702 event
           Sign with vault-derived key
           Publish ciphertext to relays`}
              </pre>
              <p>
                In both cases, the data lives on the Nostr relays you have configured. Public
                bookmarks are interoperable — any NIP-B0-compatible client can display them. Private
                bookmarks can only be decrypted by you, in any client that implements the same vault scheme.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Back to Home */}
          <div className="text-center py-4">
            <Link
              to="/"
              className="text-violet-600 hover:underline font-medium"
            >
              &larr; Back to Pinstr
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorksPage;
