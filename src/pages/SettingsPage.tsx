import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RelayListManager } from '@/components/RelayListManager';
import { LoginArea } from '@/components/auth/LoginArea';
import { Separator } from '@/components/ui/separator';

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
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

          <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your relays and account preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Section */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Sign in with your Nostr browser extension to manage bookmarks across devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginArea className="max-w-60" />
            </CardContent>
          </Card>

          <Separator />

          {/* Relay Management Section */}
          <Card>
            <CardHeader>
              <CardTitle>Relay Configuration</CardTitle>
              <CardDescription>
                Manage which Nostr relays you read from and publish to. Changes are automatically synced to your Nostr profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RelayListManager />
            </CardContent>
          </Card>

          <Separator />

          {/* Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>About Relays</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">What are Nostr relays?</p>
                <p>
                  Relays are servers that store and distribute your Nostr events (bookmarks, posts, etc.).
                  Your data is replicated across multiple relays for redundancy and censorship resistance.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Read vs Write permissions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><span className="font-medium text-green-600">Read</span> - Fetch bookmarks and events from this relay</li>
                  <li><span className="font-medium text-blue-600">Write</span> - Publish your bookmarks to this relay</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Popular relays:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>wss://relay.primal.net - Primal's fast caching relay</li>
                  <li>wss://relay.damus.io - Damus relay (high volume)</li>
                  <li>wss://relay.nostr.band - Aggregator relay</li>
                  <li>wss://relay.ditto.pub - Ditto relay with advanced features</li>
                  <li>wss://nos.lol - Community relay</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
