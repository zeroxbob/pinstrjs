import { useParams, Navigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { blogPosts } from './BlogPage';

// Blog post content - add content for each slug here
const blogContent: Record<string, React.ReactNode> = {
  'getting-started-with-pinstr': (
    <>
      <p>
        Pinstr is a bookmark manager that stores your bookmarks on the Nostr network. This guide
        walks you through adding your first bookmark — whether from the web app, the Chrome
        extension, or the bookmarklet.
      </p>

      <h3>What You Need</h3>
      <p>
        To use Pinstr, you need a Nostr identity. If you're new to Nostr, you'll need a browser
        extension that manages your keys — like{' '}
        <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Alby</a>,{' '}
        <a href="https://github.com/nicnocquee/flamingo" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Flamingo</a>, or{' '}
        <a href="https://github.com/nicnocquee/nos2x" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">nos2x</a>.
        These extensions store your private key securely and let websites like Pinstr request
        signatures without ever seeing your key.
      </p>

      <h3>Adding a Bookmark from the Web App</h3>
      <p>
        The simplest way to add a bookmark:
      </p>
      <ol>
        <li>Go to <a href="https://pinstr.co" className="text-violet-600 hover:underline">pinstr.co</a></li>
        <li>Click <strong>Sign In</strong> and approve the connection in your Nostr extension</li>
        <li>Click the <strong>Add Bookmark</strong> button in the header</li>
        <li>Paste the URL you want to save</li>
        <li>Add a title, description, and tags (all optional but helpful)</li>
        <li>Choose whether to save it as public or private</li>
        <li>Click <strong>Save</strong></li>
      </ol>
      <p>
        That's it. Your bookmark is now saved to the Nostr network.
      </p>

      <h3>Adding a Bookmark with the Chrome Extension</h3>
      <p>
        The Chrome extension lets you save the current page with one click, without leaving the site
        you're on.
      </p>
      <ol>
        <li>
          Install the extension from the{' '}
          <a href="/extension" className="text-violet-600 hover:underline">extension page</a> (it's
          not on the Chrome Web Store yet, so you'll load it in developer mode)
        </li>
        <li>Click the Pinstr icon in your browser toolbar</li>
        <li>Sign in with your Nostr extension, nsec, or bunker</li>
        <li>Navigate to any webpage you want to save</li>
        <li>Click the Pinstr icon — the URL and title are pre-filled automatically</li>
        <li>Add tags or a description if you like</li>
        <li>Click <strong>Save Bookmark</strong></li>
      </ol>
      <p>
        The extension captures the page's URL, title, and meta description automatically. You can
        also select text on the page before clicking the extension — the selected text becomes the
        description.
      </p>

      <h3>Adding a Bookmark with the Bookmarklet</h3>
      <p>
        Don't want to install an extension? The bookmarklet is a tiny piece of JavaScript you save
        as a regular browser bookmark. It works in any browser.
      </p>
      <ol>
        <li>
          Go to the{' '}
          <a href="/install-bookmarklet" className="text-violet-600 hover:underline">bookmarklet install page</a>
        </li>
        <li>Drag the "Save to Pinstr" button to your bookmarks bar</li>
        <li>Navigate to any page you want to save</li>
        <li>Click the bookmarklet in your bookmarks bar</li>
        <li>A popup opens with the page details pre-filled</li>
        <li>Sign in (if not already) and save</li>
      </ol>
      <p>
        The bookmarklet opens a small Pinstr popup window. Once you save, the popup closes
        automatically.
      </p>

      <h3>What Happens When You Save</h3>
      <p>
        When you save a public bookmark, Pinstr creates a Nostr event and publishes it to your
        configured relays. The event looks something like this:
      </p>
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed whitespace-pre text-foreground">
{`{
  "kind": 39701,
  "pubkey": "your-public-key",
  "content": "Your description here",
  "tags": [
    ["d", "example.com/page"],
    ["title", "Page Title"],
    ["t", "tag1"],
    ["t", "tag2"]
  ],
  "created_at": 1738857600,
  "sig": "..."
}`}
      </pre>
      <p>
        The event is signed by your Nostr key and stored on relays. Anyone can query for your
        public bookmarks by your pubkey. Other Nostr clients that support NIP-B0 can display them
        too — you're not locked into Pinstr.
      </p>

      <h3>Public vs Private Bookmarks</h3>
      <p>
        By default, bookmarks are <strong>public</strong>. They're visible to anyone on the Nostr
        network, associated with your public identity, and can be shared or discovered by others.
      </p>
      <p>
        If you want to save something privately — a link you don't want others to see or associate
        with your identity — toggle the <strong>Private</strong> option when saving.
      </p>
      <p>
        Private bookmarks work differently:
      </p>
      <ul>
        <li>They're encrypted with AES-256-GCM before leaving your browser</li>
        <li>They're signed by a separate "vault" keypair derived from a passphrase you choose</li>
        <li>They can't be linked to your public Nostr identity</li>
        <li>Only you can decrypt them — with the correct passphrase</li>
      </ul>
      <p>
        The first time you save a private bookmark, Pinstr asks you to set a vault passphrase.
        Choose something strong and memorable — if you forget it, your private bookmarks are
        unrecoverable. That's the tradeoff for true privacy.
      </p>
      <p>
        For a deep dive into how the encryption works, see{' '}
        <a href="/blog/how-pinstr-encrypts-private-bookmarks" className="text-violet-600 hover:underline">
          How Pinstr Encrypts Private Bookmarks
        </a>.
      </p>

      <h3>Syncing Across Devices</h3>
      <p>
        Because your bookmarks live on Nostr relays (not on Pinstr's servers), they sync
        automatically across all your devices. Open Pinstr on your phone, laptop, or any other
        device, sign in with the same Nostr identity, and your bookmarks are there.
      </p>
      <p>
        For private bookmarks, you'll need to enter your vault passphrase on each device to unlock
        and decrypt them.
      </p>

      <h3>Get Started</h3>
      <p>
        Ready to save your first bookmark? Head to{' '}
        <a href="https://pinstr.co" className="text-violet-600 hover:underline">pinstr.co</a>, sign
        in, and give it a try. If you have questions or feedback, find us on Nostr or open an issue
        on{' '}
        <a href="https://github.com/zeroxbob/pinstrjs" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
          GitHub
        </a>.
      </p>
    </>
  ),

  'how-pinstr-encrypts-private-bookmarks': (
    <>
      <p>
        Nostr is great for public data. But what about bookmarks you don't want anyone else to see?
        Links to medical resources, financial tools, private research — things that are nobody's
        business but yours.
      </p>

      <p>
        The challenge is that Nostr is a public protocol. Every event you publish is signed by your
        keypair and broadcast to relays. Anyone can query for events by your pubkey and see what
        you've been bookmarking.
      </p>

      <p>
        Pinstr solves this with a <strong>private vault</strong> — a way to encrypt bookmarks so
        that only you can read them, and so that they can't be linked back to your public Nostr
        identity.
      </p>

      <h3>The Problem with Naive Encryption</h3>
      <p>
        You might think: just encrypt the bookmark content and publish it. But that doesn't solve
        the identity problem. If you sign an encrypted event with your main Nostr key, anyone can
        still see that <em>you</em> published <em>something</em> — they just can't read what.
      </p>
      <p>
        For true privacy, we need both encrypted content <em>and</em> an unlinkable identity.
      </p>

      <h3>How Pinstr's Vault Works</h3>
      <p>
        When you create a private bookmark, Pinstr derives a completely separate keypair from a
        passphrase you choose. This vault keypair has no cryptographic relationship to your main
        Nostr identity.
      </p>

      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed whitespace-pre text-foreground">
{`Your Passphrase + Your npub
         │
         ▼
┌─────────────────────┐
│     Argon2id        │  ← Memory-hard key derivation
│  (expensive to      │
│   brute-force)      │
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
   │     │  AES-256-GCM │ ← Encrypts bookmark content
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

      <p>
        The key derivation uses <strong>Argon2id</strong>, the winner of the Password Hashing
        Competition. It's designed to be computationally expensive, making brute-force attacks
        impractical even with specialized hardware.
      </p>

      <p>
        From the 64 bytes of derived key material, we split out a signing key and an encryption key.
        The signing key generates a vault pubkey that's used to sign private bookmark events. The
        encryption key is used with <strong>AES-256-GCM</strong> to encrypt the bookmark data.
      </p>

      <h3>What Gets Published</h3>
      <p>
        A private bookmark event looks like this:
      </p>

      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed whitespace-pre text-foreground">
{`┌─────────────────────────────────────────────────────────┐
│ Private Bookmark (kind 39702)                           │
│ - Signed by: vault keypair                              │
│ - d-tag: random UUID                                    │
│ - content: AES-256-GCM encrypted JSON                   │
│            (contains url, title, description, tags)     │
└─────────────────────────────────────────────────────────┘`}
      </pre>

      <p>
        The event is signed by your vault keypair — not your main Nostr key. The <code>d</code> tag
        is a random UUID, so there's no way to correlate events by URL. The content is encrypted
        JSON containing all the bookmark data.
      </p>

      <p>
        To an outside observer, these events are just opaque blobs signed by an unknown pubkey.
        There's no way to link them to your public Nostr profile.
      </p>

      <h3>Why Not Use NIP-44 Gift Wrap?</h3>
      <p>
        Nostr has an existing standard for encrypted messages: NIP-59 Gift Wrap, which uses NIP-44
        encryption. It's designed for private DMs and has been audited by Cure53. So why doesn't
        Pinstr use it?
      </p>

      <p>
        Gift Wrap uses a three-layer structure:
      </p>

      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed whitespace-pre text-foreground">
{`┌─────────────────────────────────────────────────────────┐
│ Gift Wrap (kind 1059)                                   │
│ - Signed by: ephemeral one-time key                     │
│ - p-tag: recipient's pubkey                             │
│ - content: NIP-44 encrypted seal                        │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ Seal (kind 13)                                  │   │
│   │ - Signed by: real author                        │   │
│   │ - content: NIP-44 encrypted rumor               │   │
│   │                                                 │   │
│   │   ┌─────────────────────────────────────────┐   │   │
│   │   │ Rumor (kind 39701 - UNSIGNED)           │   │   │
│   │   │ - The actual bookmark event             │   │   │
│   │   │ - d-tag, title, content, etc.           │   │   │
│   │   └─────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘`}
      </pre>

      <p>
        There are several reasons Gift Wrap isn't ideal for private bookmarks:
      </p>

      <ul>
        <li>
          <strong>Author leakage:</strong> The seal (kind 13) is signed by the real author's key.
          Even though the content is encrypted, the seal's pubkey reveals who created it. Our vault
          approach uses a derived keypair that's completely unlinkable.
        </li>
        <li>
          <strong>Query complexity:</strong> With Gift Wrap, you query for kind 1059 events tagged
          with your pubkey, then unwrap each one to check if it's a bookmark. With our approach,
          you just query for kind 39702 events by your vault pubkey — direct and simple.
        </li>
        <li>
          <strong>Relay storage:</strong> NIP-59 notes that relays may choose not to store gift
          wrapped events. They see kind 1059 as an "encrypted blob" with no semantic meaning. A
          dedicated kind for private bookmarks can be handled better.
        </li>
        <li>
          <strong>Passphrase-based recovery:</strong> Our vault derives keys from passphrase +
          pubkey. You can recover on any device with just the passphrase. Gift Wrap requires access
          to your private key (nsec).
        </li>
      </ul>

      <h3>Quantum Resistance</h3>
      <p>
        Here's an interesting property of our approach: it's more quantum-resistant than NIP-44.
      </p>
      <p>
        NIP-44 uses ECDH (Elliptic Curve Diffie-Hellman) for key exchange, which relies on
        secp256k1. This is vulnerable to Shor's algorithm on a quantum computer.
      </p>
      <p>
        Our vault derives keys using Argon2id from a passphrase — a purely symmetric operation.
        The encryption uses AES-256-GCM, also symmetric. Neither of these are vulnerable to known
        quantum attacks.
      </p>
      <p>
        Of course, both approaches still use secp256k1 for Nostr event signing, which is the weak
        point for both. But for the encryption of your private data, our passphrase-based approach
        avoids the elliptic curve vulnerability entirely.
      </p>

      <h3>Summary</h3>
      <p>
        Pinstr's vault gives you private bookmarks that are:
      </p>
      <ul>
        <li><strong>Encrypted</strong> — AES-256-GCM, a battle-tested NIST standard</li>
        <li><strong>Unlinkable</strong> — signed by a separate vault keypair with no connection to your public identity</li>
        <li><strong>Recoverable</strong> — derived deterministically from your passphrase, so you can access them on any device</li>
        <li><strong>Quantum-resistant</strong> — no elliptic curve cryptography in the key derivation or encryption</li>
      </ul>
      <p>
        Your private bookmarks are truly private. Not even we can read them — because we never see
        your passphrase.
      </p>
    </>
  ),

  'welcome-to-pinstr': (
    <>
      <p>
        We're excited to introduce Pinstr, a decentralized bookmark manager built on the Nostr
        protocol. Pinstr lets you save, organize, and share your favorite web pages — all without
        relying on a centralized service.
      </p>

      <h3>Why Pinstr?</h3>
      <p>
        Traditional bookmark managers store your data on company servers. If the company shuts down,
        changes their terms, or gets acquired, your bookmarks could disappear or become locked behind
        a paywall.
      </p>
      <p>
        Pinstr is different. Your bookmarks are stored on Nostr relays — independent servers that
        you choose. You own your data. You can switch clients anytime. Nobody can lock you out.
      </p>

      <h3>Features</h3>
      <ul>
        <li><strong>Public bookmarks</strong> — Share your favorite links with the world</li>
        <li><strong>Private vault</strong> — Encrypt sensitive bookmarks with a passphrase</li>
        <li><strong>Cross-platform</strong> — Web app, Chrome extension, and Android app</li>
        <li><strong>Decentralized</strong> — No single point of failure</li>
        <li><strong>Free forever</strong> — No subscriptions, no ads</li>
      </ul>

      <h3>Get Started</h3>
      <p>
        Head to <a href="https://pinstr.co" className="text-violet-600 hover:underline">pinstr.co</a> and
        sign in with your Nostr browser extension. You can also install
        the <a href="/extension" className="text-violet-600 hover:underline">Chrome extension</a> for
        one-click bookmarking, or grab the <a href="https://github.com/zeroxbob/pinstr-kotlin" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">Android app</a> from
        GitHub.
      </p>

      <p>
        We'd love to hear your feedback. Find us on Nostr or open an issue on GitHub.
      </p>
    </>
  ),
};

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const post = blogPosts.find((p) => p.slug === slug);
  const content = slug ? blogContent[slug] : null;

  useSeoMeta({
    title: post ? `${post.title} - Pinstr Blog` : 'Blog - Pinstr',
    description: post?.excerpt ?? 'Pinstr blog',
  });

  if (!post || !content) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <a href="/blog" className="text-sm text-violet-600 hover:underline mb-4 inline-block">
            &larr; Back to Blog
          </a>
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{post.title}</h2>
          <p className="text-muted-foreground mt-1">{post.date}</p>
        </div>

        <Card>
          <CardContent className="py-8 prose prose-violet dark:prose-invert max-w-none">
            <div className="text-sm text-muted-foreground space-y-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-foreground [&>h3]:mt-6 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:list-inside [&>ul]:space-y-1 [&>ul]:ml-2">
              {content}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

export default BlogPostPage;
