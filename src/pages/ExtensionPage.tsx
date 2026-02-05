import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function ExtensionPage() {
  useSeoMeta({
    title: 'Chrome Extension - Pinstr',
    description: 'Save bookmarks to Nostr with one click using the Pinstr Chrome extension.',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Chrome Extension</h2>
          <p className="text-muted-foreground mt-1">
            Save bookmarks to Nostr with one click from any webpage.
          </p>
        </div>

        <div className="space-y-6">
          {/* What It Does */}
          <Card>
            <CardHeader>
              <CardTitle>What It Does</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                The Pinstr Chrome extension adds a popup to your browser that lets you save the
                current page as a Nostr bookmark with one click. It automatically captures the
                page URL, title, and description.
              </p>
              <p>
                You can save bookmarks as public (visible on the Nostr network) or private
                (encrypted in your vault). Tags and descriptions are optional.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Works With Everything */}
          <Card>
            <CardHeader>
              <CardTitle>Works in Unison</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                The extension, the web app at{' '}
                <a
                  href="https://pinstr.co"
                  className="text-violet-600 hover:underline font-medium"
                >
                  pinstr.co
                </a>, and the Android app all share the same Nostr protocol and relay
                infrastructure. A bookmark saved from the extension shows up immediately in the
                web app and on your phone — and vice versa.
              </p>
              <p>
                There is no sync service. All three clients read from and write to the same Nostr
                relays using your keypair. They are fully interoperable because they all speak
                the same protocol (NIP-B0).
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* How to Sign In */}
          <Card>
            <CardHeader>
              <CardTitle>How to Sign In</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                The extension supports three ways to sign in:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong className="text-foreground">NIP-07 extension</strong> — connect via a
                  browser extension like Alby, nos2x, or Flamingo. The extension opens the Pinstr
                  web app briefly to get your approval, then stores the connection.
                </li>
                <li>
                  <strong className="text-foreground">nsec</strong> — paste your secret key directly.
                  It is stored locally in your browser and never sent anywhere.
                </li>
                <li>
                  <strong className="text-foreground">Bunker</strong> — connect to a remote signer
                  via a bunker URI (NIP-46).
                </li>
              </ul>
            </CardContent>
          </Card>

          <Separator />

          {/* Installation */}
          <Card>
            <CardHeader>
              <CardTitle>How to Install</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                The extension is not on the Chrome Web Store yet. You can install it manually
                from the{' '}
                <a
                  href="https://github.com/zeroxbob/pinstrjs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:underline font-medium"
                >
                  GitHub repository
                </a>{' '}
                in developer mode. The repository includes a pre-built{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">extension/dist</code>{' '}
                folder, so no building is required.
              </p>

              <ol className="list-decimal list-inside space-y-3 ml-2">
                <li>
                  Clone or download the repository from{' '}
                  <a
                    href="https://github.com/zeroxbob/pinstrjs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-600 hover:underline font-medium"
                  >
                    github.com/zeroxbob/pinstrjs
                  </a>
                </li>
                <li>
                  Open Chrome and go to{' '}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs">chrome://extensions</code>
                </li>
                <li>
                  Enable <strong className="text-foreground">Developer mode</strong> using the
                  toggle in the top-right corner
                </li>
                <li>
                  Click <strong className="text-foreground">Load unpacked</strong> and select
                  the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">extension/dist</code> folder
                  from the downloaded repository
                </li>
                <li>
                  The Pinstr icon appears in your browser toolbar — click it to open the popup
                  and sign in
                </li>
              </ol>

              <p>
                To update the extension later, pull the latest changes from GitHub and
                click the reload button on the extension card in{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">chrome://extensions</code>.
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Bookmarklet Alternative */}
          <Card>
            <CardHeader>
              <CardTitle>Want Something Simpler?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                If you don't want to install an extension, the{' '}
                <Link to="/install-bookmarklet" className="text-violet-600 hover:underline font-medium">
                  Pinstr Bookmarklet
                </Link>{' '}
                is an even simpler alternative. It's a small piece of JavaScript you save as a
                regular browser bookmark — no developer mode, no building from source.
              </p>
              <p>
                Click it on any page and a popup opens with the page details pre-filled, ready to
                save to Nostr. It works in every browser that supports bookmarklets, including
                Chrome, Firefox, Safari, and Edge.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ExtensionPage;
