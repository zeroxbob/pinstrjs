import { useSeoMeta } from '@unhead/react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { BookmarkCard } from '@/components/BookmarkCard';
import { BookmarkDialog } from '@/components/BookmarkDialog';
import { LoginArea } from '@/components/auth/LoginArea';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const navigate = useNavigate();

  useSeoMeta({
    title: 'Pinstr - Save and Share Your Favorite Links',
    description: 'A decentralized bookmark manager built on Nostr protocol (NIP-B0). Save, organize, and share your favorite web pages.',
  });

  const { user } = useCurrentUser();
  const { data: bookmarks, isLoading, error } = useBookmarks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bookmark className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Pinstr
                </h1>
                <p className="text-xs text-muted-foreground">Bookmarks on Nostr</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user && <BookmarkDialog />}
              <Button
                variant="outline"
                onClick={() => navigate('/bookmarks')}
                className="gap-2"
              >
                My Bookmarks
                <ArrowRight className="h-4 w-4" />
              </Button>
              <LoginArea className="max-w-60" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Save Your Favorite Links
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A decentralized bookmark manager powered by Nostr (NIP-B0). Your bookmarks, your keys, your data.
          </p>
          {!user && (
            <div className="pt-4">
              <Card className="max-w-md mx-auto border-blue-200 dark:border-blue-800">
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

        {/* Bookmarks Grid */}
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
          ) : bookmarks && bookmarks.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Latest Bookmarks
                </h3>
                <p className="text-sm text-muted-foreground">
                  {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((bookmark) => (
                  <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
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
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            Built with NIP-B0 • Powered by{' '}
            <a
              href="https://nostr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Nostr
            </a>
            {' • '}
            <span>
              Vibed with{' '}
              <a
                href="https://soapbox.pub/mkstack"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline font-medium"
              >
                MKStack
              </a>
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
