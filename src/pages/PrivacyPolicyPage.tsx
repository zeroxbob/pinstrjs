import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function PrivacyPolicyPage() {
  useSeoMeta({
    title: 'Privacy Policy - Pinstr',
    description: 'Privacy policy for Pinstr, a decentralized bookmark manager built on Nostr.',
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

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Privacy Policy</h2>
          <p className="text-muted-foreground mt-1">
            Last updated: February 2025
          </p>
        </div>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Pinstr is a client-side web application that interacts with the{' '}
                <a href="https://nostr.com" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline font-medium">Nostr</a>{' '}
                protocol. It runs entirely in your browser. Pinstr does not operate a backend server, does not
                maintain user accounts, and does not collect, store, or process your personal data on any
                server we control.
              </p>
              <p>
                Because Nostr is a decentralized, open protocol, it is important that you understand
                how your data flows and what responsibilities fall on you as a user.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Architecture */}
          <Card>
            <CardHeader>
              <CardTitle>How Pinstr Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Pinstr is a static, client-side application. All bookmark management, event signing,
                and relay communication happen directly in your browser. There is no Pinstr server
                sitting between you and the Nostr network.
              </p>
              <p>
                When you create, edit, or delete a bookmark, Pinstr constructs a Nostr event, signs it
                with your key, and publishes it to the relays you have configured. Reading bookmarks
                works the same way in reverse: Pinstr queries your relays and displays the results locally.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Data & Relays */}
          <Card>
            <CardHeader>
              <CardTitle>Data, Relays, and the Nostr Network</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                All data you publish through Pinstr is submitted to Nostr relays. Relays are
                independent servers operated by third parties. Once an event is published to a relay,
                it may be stored, replicated, cached, or indexed by that relay and potentially by
                other relays and services on the Nostr network.
              </p>
              <p>
                <strong className="text-foreground">Public data is public.</strong>{' '}
                Public bookmarks are visible to anyone who queries the relays they are stored on.
                This includes the bookmark URL, title, any tags you add, and your public key.
              </p>
              <p>
                <strong className="text-foreground">Deletion is not guaranteed.</strong>{' '}
                The Nostr protocol supports deletion requests (NIP-09), but relays are not obligated
                to honor them. You should assume that any data published to the Nostr network may
                persist indefinitely and cannot be reliably removed.
              </p>
              <p>
                <strong className="text-foreground">Private bookmarks use encryption.</strong>{' '}
                Pinstr's private vault feature encrypts bookmark content client-side before publishing.
                The encrypted events are still stored on relays, but their contents are only readable
                with the correct passphrase. The encryption key is derived locally and never transmitted.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Key Management */}
          <Card>
            <CardHeader>
              <CardTitle>Your Keys, Your Responsibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Nostr uses public-key cryptography. Your identity on Nostr is your keypair: a public
                key (npub) and a private key (nsec). Pinstr does not generate, store, or have access
                to your private key. Authentication is handled through your Nostr browser extension
                (e.g., nos2x, Alby, or similar NIP-07 signers).
              </p>
              <p>
                <strong className="text-foreground">It is your responsibility to:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Securely store and back up your private key (nsec)</li>
                <li>Never share your nsec with untrusted applications or individuals</li>
                <li>Understand that your nsec cannot be reset or recovered by anyone if lost</li>
                <li>Choose how you link your Nostr identity to your real-world identity, as this directly impacts your privacy</li>
              </ul>
              <p>
                The degree to which your Nostr activity is anonymous or pseudonymous depends entirely
                on how you manage your keys and what information you associate with your profile.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Third Parties */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Pinstr may interact with third-party services in the following ways:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong className="text-foreground">Nostr relays</strong> — operated by independent
                  third parties, each with their own policies regarding data retention and privacy
                </li>
                <li>
                  <strong className="text-foreground">Browser extensions</strong> — your NIP-07 signer
                  extension handles key management and event signing
                </li>
                <li>
                  <strong className="text-foreground">Hosting provider</strong> — the static site is served
                  via standard web hosting; the hosting provider may log IP addresses and request metadata
                  per their own privacy policy
                </li>
              </ul>
              <p>
                Pinstr itself does not use analytics, tracking scripts, or advertising services.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Local Storage */}
          <Card>
            <CardHeader>
              <CardTitle>Local Storage and Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Pinstr may use your browser's local storage to save preferences such as relay
                configuration, theme settings, and vault state. This data stays in your browser and
                is not transmitted to any server. Pinstr does not use cookies for tracking. You can
                clear this data at any time through your browser settings.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Changes */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                This privacy policy may be updated from time to time. Changes will be reflected on this
                page with an updated date. Continued use of Pinstr after changes constitutes acceptance
                of the revised policy.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                If you have questions about this privacy policy, you can reach the developer via Nostr
                or through the project's{' '}
                <a
                  href="https://github.com/zeroxbob/pinstrjs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline font-medium"
                >
                  GitHub repository
                </a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
