import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark as BookmarkIcon, Filter, Settings, ArrowRight } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { BookmarkCard } from '@/components/BookmarkCard';
import { AddBookmarkDialog } from '@/components/AddBookmarkDialog';
import { LoginArea } from '@/components/auth/LoginArea';
import { Footer } from '@/components/Footer';
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

export default function AllBookmarksPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { data: bookmarks, isLoading } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Extract all unique tags from bookmarks
  const allTags = useMemo(() =>
    Array.from(
      new Set(bookmarks?.flatMap(bookmark => bookmark.tags) ?? [])
    ).sort(),
    [bookmarks]
  );

  // Filter bookmarks based on search query and selected tag
  const filteredBookmarks = useMemo(() =>
    bookmarks?.filter(bookmark => {
      const matchesSearch = !searchQuery ||
        bookmark.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag = selectedTag === 'all' || bookmark.tags.includes(selectedTag);

      return matchesSearch && matchesTag;
    }),
    [bookmarks, searchQuery, selectedTag]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Pinstr" className="h-10 w-10 rounded-xl shadow-lg" />
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
              {user && <AddBookmarkDialog />}
              {user && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/my-bookmarks')}
                  className="gap-2"
                >
                  My Bookmarks
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
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
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
              All Bookmarks
            </h2>
            <p className="text-muted-foreground text-sm">
              Public bookmarks from across the Nostr network
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 w-full sm:w-auto">
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

          {/* Bookmarks Grid */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
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
                    <h2 className="text-xl font-semibold mb-2">No bookmarks found</h2>
                    <p className="text-muted-foreground">
                      No public bookmarks have been published to the network yet.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
