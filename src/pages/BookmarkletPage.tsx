import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCreateBookmark } from '@/hooks/useCreateBookmark';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoginArea } from '@/components/auth/LoginArea';
import { Bookmark, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function BookmarkletPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const createBookmark = useCreateBookmark();

  // Extension detection state
  const [isCheckingExtension, setIsCheckingExtension] = useState(true);
  const [extensionAvailable, setExtensionAvailable] = useState(false);

  // Get URL parameters from bookmarklet
  const urlParam = searchParams.get('url');
  const titleParam = searchParams.get('title');
  const descriptionParam = searchParams.get('description');
  const isPopup = searchParams.get('popup') === 'true';

  // Form state
  const [url, setUrl] = useState(decodeURIComponent(urlParam || ''));
  const [title, setTitle] = useState(decodeURIComponent(titleParam || ''));
  const [description, setDescription] = useState(decodeURIComponent(descriptionParam || ''));
  const [tags, setTags] = useState('');
  const [success, setSuccess] = useState(false);

  // Check for Nostr browser extension with polling
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10; // Try for 5 seconds (10 attempts × 500ms)
    const interval = 500; // Check every 500ms

    const checkExtension = () => {
      attempts++;

      // Check if window.nostr exists (NIP-07 extension)
      if (window.nostr) {
        setExtensionAvailable(true);
        setIsCheckingExtension(false);
        return;
      }

      // Stop checking after max attempts
      if (attempts >= maxAttempts) {
        setExtensionAvailable(false);
        setIsCheckingExtension(false);
        return;
      }

      // Try again
      setTimeout(checkExtension, interval);
    };

    // Start checking immediately
    checkExtension();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!url || !title) {
      return;
    }

    try {
      await createBookmark.mutateAsync({
        url,
        title,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });

      setSuccess(true);

      // Close popup after 2 seconds if in popup mode
      if (isPopup) {
        setTimeout(() => {
          window.close();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to create bookmark:', error);
    }
  };

  // Auto-submit if user is logged in, extension is available, and all required fields are present
  useEffect(() => {
    if (user && extensionAvailable && urlParam && titleParam && !success && !createBookmark.isPending) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, extensionAvailable, urlParam, titleParam]);

  // Loading state while checking for browser extension
  if (isCheckingExtension) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="container max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Loader2 className="w-16 h-16 text-violet-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Detecting Nostr Extension...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Checking for your Nostr browser extension. Please wait a moment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state if extension is not available
  if (!extensionAvailable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="container max-w-2xl mx-auto">
          {/* Header */}
          <Link
            to="/"
            className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pinstr</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bookmarks on Nostr</p>
            </div>
          </Link>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Browser Extension Not Available
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We couldn't detect a Nostr browser extension. To use the bookmarklet, you need to install a Nostr extension.
                </p>
              </div>

              <div className="max-w-md mx-auto text-left space-y-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white">Popular Nostr Extensions:</p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• <strong>Alby</strong> - Bitcoin wallet + Nostr extension</li>
                  <li>• <strong>nos2x</strong> - Lightweight Nostr extension</li>
                  <li>• <strong>Flamingo</strong> - Feature-rich Nostr extension</li>
                </ul>
                <p className="text-xs text-gray-500 pt-2">
                  After installing an extension, please reload this page or try the bookmarklet again.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.reload()}>
                  Retry Detection
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Login prompt if no user but extension is available
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="container max-w-2xl mx-auto">
          {/* Header */}
          <Link
            to="/"
            className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pinstr</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bookmarks on Nostr</p>
            </div>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Sign in to Save Bookmark</CardTitle>
              <CardDescription>
                You need to be logged in with your Nostr account to save bookmarks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>URL</Label>
                <Input value={url} readOnly className="bg-gray-50 dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} readOnly className="bg-gray-50 dark:bg-gray-800" />
              </div>
              {description && (
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} readOnly className="bg-gray-50 dark:bg-gray-800" rows={3} />
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Sign in with your Nostr browser extension to save this bookmark:
                </p>
                <LoginArea className="w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="container max-w-2xl mx-auto">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Bookmark Saved!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your bookmark has been successfully published to Nostr.
              </p>
              {isPopup ? (
                <p className="text-sm text-gray-500">This window will close automatically...</p>
              ) : (
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate('/bookmarks')}>
                    View My Bookmarks
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Go Home
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (createBookmark.isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="container max-w-2xl mx-auto">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Failed to Save Bookmark
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {createBookmark.error?.message || 'An error occurred while saving your bookmark.'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => {
                  setSuccess(false);
                  createBookmark.reset();
                }}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Submitting state (manual or auto)
  if (createBookmark.isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="container max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Loader2 className="w-16 h-16 text-violet-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Saving Bookmark...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Publishing to Nostr relays. This will only take a moment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Manual form (if auto-submit didn't happen or user wants to edit)
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        {/* Header */}
        <Link
          to="/"
          className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pinstr</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Bookmarks on Nostr</p>
          </div>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Save Bookmark</CardTitle>
            <CardDescription>
              Review and save this page to your Nostr bookmarks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Page title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add your notes about this bookmark..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tech, article, tutorial (comma-separated)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={!url || !title}>
                  Save Bookmark
                </Button>
                {!isPopup && (
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BookmarkletPage;
