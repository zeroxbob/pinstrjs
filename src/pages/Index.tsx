import { useSeoMeta } from '@unhead/react';
import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, Loader2, AlertCircle, ArrowRight, Settings, Lock, Smartphone, Heart, Globe, Shield, Key } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { BookmarkCard } from '@/components/BookmarkCard';
import { AddBookmarkDialog } from '@/components/AddBookmarkDialog';
import { LoginArea } from '@/components/auth/LoginArea';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const PREVIEW_LIMIT = 9;

const Index = () => {
  const navigate = useNavigate();

  useSeoMeta({
    title: 'Pinstr - Save and Share Your Favorite Links',
    description: 'A decentralized bookmark manager built on Nostr protocol (NIP-B0). Save, organize, and share your favorite web pages.',
  });

  const { user } = useCurrentUser();
  const { data: bookmarks, isLoading, error } = useBookmarks();

  const previewBookmarks = bookmarks?.slice(0, PREVIEW_LIMIT);
  const hasMore = bookmarks && bookmarks.length > PREVIEW_LIMIT;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Pinstr" className="h-10 w-10 rounded-xl" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Pinstr
                </h1>
                <p className="text-xs text-muted-foreground">Bookmarks on Nostr</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {user && <AddBookmarkDialog />}
              <Button
                variant="outline"
                onClick={() => navigate('/bookmarks')}
                className="gap-2"
              >
                My Bookmarks
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <LoginArea className="max-w-60" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Save Your Favorite Links
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A decentralized bookmark manager powered by Nostr. Your bookmarks, your keys, your data.
          </p>
          {!user && (
            <div className="pt-4">
              <Card className="max-w-md mx-auto border-violet-200 dark:border-violet-800">
                <CardContent className="py-6 px-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Sign in with your Nostr account to create and manage bookmarks
                  </p>
                  <LoginArea className="flex w-full justify-center" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white text-center mb-8">
            Why Pinstr?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Public & Private Bookmarks */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Lock className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Public & Private Bookmarks</h4>
                    <p className="text-sm text-muted-foreground">
                      Save bookmarks publicly or encrypt them in your private vault. Your choice.
                    </p>
                    <Link
                      to="/how-it-works"
                      className="text-sm text-violet-600 hover:underline mt-2 inline-block"
                    >
                      Learn how it works &rarr;
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Android App */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Smartphone className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Android App</h4>
                    <p className="text-sm text-muted-foreground">
                      Use Pinstr on your phone with the new Android app. Bookmark on the go.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Free & Value4Value */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Heart className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Free & Value4Value</h4>
                    <p className="text-sm text-muted-foreground">
                      No subscriptions, no ads. Pinstr is free to use. Support development if you want to.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decentralized */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Globe className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Decentralized</h4>
                    <p className="text-sm text-muted-foreground">
                      No single point of failure. Your bookmarks live on relays you choose.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Censorship Resistant */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Shield className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Censorship Resistant</h4>
                    <p className="text-sm text-muted-foreground">
                      No one can delete your data or lock you out of your own bookmarks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* You Own Your Data */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Key className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">You Own Your Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Your keys, your bookmarks. Take them to any Nostr client, anytime.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bookmarks Section */}
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="py-12 px-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Bookmarks</h3>
                <p className="text-muted-foreground">
                  {error instanceof Error ? error.message : 'Failed to load bookmarks. Please try again later.'}
                </p>
              </CardContent>
            </Card>
          ) : previewBookmarks && previewBookmarks.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Latest Bookmarks
                </h3>
                {hasMore && (
                  <p className="text-sm text-muted-foreground">
                    Showing {PREVIEW_LIMIT} of {bookmarks.length}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {previewBookmarks.map((bookmark) => (
                  <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/bookmarks')}
                    className="gap-2"
                  >
                    View All Bookmarks
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Bookmarks Yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {user
                    ? "Start saving your favorite web pages by clicking the 'Add Bookmark' button above."
                    : "Sign in to see bookmarks from the Nostr network or create your own."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Loading indicator for initial load */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            Built with ❤️ on{' '}
            <a
              href="https://nostr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:underline"
            >
              Nostr
            </a>
            {' • '}
            Vibed with{' '}
            <a
              href="https://soapbox.pub/mkstack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:underline font-medium"
            >
              MKStack
            </a>
            {' • '}
            <a href="/privacy-policy" className="hover:underline">
              Privacy
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
