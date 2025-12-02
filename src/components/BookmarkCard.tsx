import { ExternalLink, Tag, Calendar, User, Trash2, Code } from 'lucide-react';
import type { Bookmark } from '@/hooks/useBookmarks';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDeleteBookmark } from '@/hooks/useCreateBookmark';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { genUserName } from '@/lib/genUserName';
import { useToast } from '@/hooks/useToast';
import { ReadToRelayBadge } from '@/components/ReadToRelayBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BookmarkCardProps {
  bookmark: Bookmark;
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const author = useAuthor(bookmark.author);
  const { user } = useCurrentUser();
  const { mutate: deleteBookmark, isPending: isDeleting } = useDeleteBookmark();
  const { toast } = useToast();

  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(bookmark.author);
  const profileImage = metadata?.picture;

  const isOwnBookmark = user?.pubkey === bookmark.author;

  const handleDelete = () => {
    const identifier = bookmark.event.tags.find(([name]) => name === 'd')?.[1];
    if (!identifier) return;

    deleteBookmark(identifier, {
      onSuccess: () => {
        toast({
          title: 'Bookmark deleted',
          description: 'Your bookmark has been removed.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete bookmark',
          variant: 'destructive',
        });
      },
    });
  };

  const formatDate = (timestamp: number) => {
    // If timestamp is in seconds (Unix timestamp), convert to milliseconds
    // If already in milliseconds, use as-is
    // Unix timestamps in seconds are ~10 digits, in milliseconds are ~13 digits
    const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;

    return new Date(timestampMs).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const handleViewJSON = () => {
    // Create a blob with formatted JSON
    const json = JSON.stringify(bookmark.event, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Open in new tab
    window.open(url, '_blank');

    // Clean up the URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {getDomain(bookmark.url)}
              </p>
            </div>
          </div>
          {isOwnBookmark && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isDeleting}
                    title="Delete bookmark"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete bookmark</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this bookmark? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <div>
          <CardTitle className="text-xl mb-2 line-clamp-2">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-primary transition-colors flex items-start gap-2"
            >
              <span className="flex-1">{bookmark.title || bookmark.url}</span>
              <ExternalLink className="h-4 w-4 flex-shrink-0 mt-1 text-muted-foreground" />
            </a>
          </CardTitle>
          {bookmark.description && (
            <CardDescription className="line-clamp-3">
              {bookmark.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {bookmark.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(bookmark.publishedAt || bookmark.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <ReadToRelayBadge url={bookmark.url} />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleViewJSON}
              title="View JSON"
            >
              <Code className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
