import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function FAQPage() {
  useSeoMeta({
    title: 'FAQ - Pinstr',
    description: 'Frequently asked questions about Pinstr, the decentralized bookmark manager on Nostr.',
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

          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Is Pinstr free?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Yes, completely free. No subscriptions, no ads, no premium tiers. All features
                are available to everyone.
              </p>
              <p>
                If you find Pinstr useful and want to support development, you can always send
                a zap. But there is zero obligation.
              </p>
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Is Pinstr open source?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Yes. The full source code is available on{' '}
                <a
                  href="https://github.com/zeroxbob/pinstrjs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline font-medium"
                >
                  GitHub
                </a>.
                Contributions, issues, and feedback are welcome.
              </p>
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>What is Nostr?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Nostr (Notes and Other Stuff Transmitted by Relays) is an open protocol for
                decentralized communication. Your identity is a cryptographic keypair. You publish
                signed events to relays — independent servers that store and forward your data.
              </p>
              <p>
                No company controls Nostr. No one can ban you or delete your data. You can use
                any client that speaks the protocol, and take your identity with you.
                Learn more at{' '}
                <a
                  href="https://nostr.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline font-medium"
                >
                  nostr.com
                </a>.
              </p>
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Are my private bookmarks safe?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Private bookmarks are encrypted with AES-256-GCM in your browser before they
                are published to relays. They are also signed by a separate keypair derived from
                your passphrase, so they cannot be linked to your public Nostr identity.
              </p>
              <p>
                Only you can decrypt them — with the correct passphrase. The encryption is
                quantum-resistant. Read more on the{' '}
                <Link to="/how-it-works" className="text-violet-600 hover:underline font-medium">
                  How It Works
                </Link>{' '}
                page.
              </p>
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>What happens if I lose my vault passphrase?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Your private bookmarks become permanently unrecoverable. The passphrase is never
                stored anywhere — not in your browser, not on any server, not on any relay.
              </p>
              <p>
                This is by design. It means no one else can access your private bookmarks either.
                Choose a strong passphrase you can remember, and store a backup somewhere safe.
              </p>
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Can I use Pinstr on my phone?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Yes! An Android app is currently in development. The web app at{' '}
                <a
                  href="https://pinstr.co"
                  className="text-violet-600 hover:underline font-medium"
                >
                  pinstr.co
                </a>{' '}
                also works in mobile browsers.
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

export default FAQPage;
