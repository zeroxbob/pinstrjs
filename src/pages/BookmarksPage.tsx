import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark as BookmarkIcon, Filter, Settings } from 'lucide-react';
import { useUserBookmarks } from '@/hooks/useBookmarks';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { BookmarkCard } from '@/components/BookmarkCard';
import { AddBookmarkDialog } from '@/components/AddBookmarkDialog';
import { LoginArea } from '@/components/auth/LoginArea';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { data: bookmarks, isLoading } = useUserBookmarks(user?.pubkey);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Extract all unique tags from bookmarks
  const allTags = Array.from(
    new Set(bookmarks?.flatMap(bookmark => bookmark.tags) ?? [])
  ).sort();

  // Filter bookmarks based on search query and selected tag
  const filteredBookmarks = bookmarks?.filter(bookmark => {
    const matchesSearch = !searchQuery ||
      bookmark.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'all' || bookmark.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-lg">
                <BookmarkIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Pinstr
                </h1>
                <p className="text-sm text-muted-foreground">
                  Bookmarks on Nostr
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="outline"
                className="hidden sm:flex"
              >
                <Link to="/install-bookmarklet">Install Bookmarklet</Link>
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
        {!user ? (
          <Card className="border-dashed max-w-2xl mx-auto">
            <CardContent className="py-16 px-8 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="p-4 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950 dark:to-indigo-950 rounded-full inline-block">
                  <BookmarkIcon className="h-12 w-12 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to Pinstr</h2>
                  <p className="text-muted-foreground">
                    Sign in with your Nostr browser extension to save and manage your bookmarks across the decentralized web.
                  </p>
                </div>
                <div className="pt-4">
                  <LoginArea className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input
                    type="search"
                    placeholder="Search bookmarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-3 w-full"
                  />
                </div>
                {allTags.length > 0 && (
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <AddBookmarkDialog />
            </div>

            {/* Bookmarks Grid */}
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredBookmarks && filteredBookmarks.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBookmarks.map((bookmark) => (
                  <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            ) : bookmarks && bookmarks.length > 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 px-8 text-center">
                  <div className="max-w-sm mx-auto space-y-4">
                    <p className="text-muted-foreground">
                      No bookmarks match your search criteria.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTag('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-16 px-8 text-center">
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="p-4 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950 dark:to-indigo-950 rounded-full inline-block">
                      <BookmarkIcon className="h-12 w-12 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
                      <p className="text-muted-foreground mb-6">
                        Start building your collection by adding your first bookmark.
                      </p>
                      <AddBookmarkDialog />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Powered by{' '}
              <a
                href="https://github.com/nostr-protocol/nips/blob/master/B0.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:underline font-medium"
              >
                NIP-B0
              </a>
              {' '}• Vibed with{' '}
              <a
                href="https://soapbox.pub/mkstack"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:underline font-medium"
              >
                MKStack
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
