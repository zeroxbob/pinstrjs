import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCreateBookmark } from '@/hooks/useCreateBookmark';
import { useCreatePrivateBookmark } from '@/hooks/usePrivateBookmarks';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAppContext } from '@/hooks/useAppContext';
import { useVault } from '@/hooks/useVault';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LoginArea } from '@/components/auth/LoginArea';
import { Bookmark, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';

export function BookmarkletPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { config } = useAppContext();
  const { state: vaultState } = useVault();
  const createBookmark = useCreateBookmark();
  const createPrivateBookmark = useCreatePrivateBookmark();

  const isVaultUnlocked = vaultState.status === 'unlocked';

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
  const [isPrivate, setIsPrivate] = useState(false);
  const [success, setSuccess] = useState(false);
  const [wasPrivate, setWasPrivate] = useState(false);

  // Default to private when vault is enabled and unlocked
  useEffect(() => {
    if (user && config.vaultEnabled && isVaultUnlocked) {
      setIsPrivate(true);
    }
  }, [user, config.vaultEnabled, isVaultUnlocked]);

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

    const bookmarkData = {
      url,
      title,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      if (isPrivate && isVaultUnlocked) {
        await createPrivateBookmark.mutateAsync(bookmarkData);
        setWasPrivate(true);
      } else {
        await createBookmark.mutateAsync(bookmarkData);
        setWasPrivate(false);
      }

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

  // Removed auto-submit - users should review and manually submit the form

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
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url-preview">URL *</Label>
                  <Input
                    id="url-preview"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title-preview">Title *</Label>
                  <Input
                    id="title-preview"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Page title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description-preview">Description</Label>
                  <Textarea
                    id="description-preview"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add your notes about this bookmark..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags-preview">Tags</Label>
                  <Input
                    id="tags-preview"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tech, article, tutorial (comma-separated)"
                  />
                </div>
              </form>

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
                {wasPrivate ? 'Private Bookmark Saved!' : 'Bookmark Saved!'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {wasPrivate
                  ? 'Your encrypted bookmark has been saved.'
                  : 'Your bookmark has been successfully published to Nostr.'}
              </p>
              {isPopup ? (
                <p className="text-sm text-gray-500">This window will close automatically...</p>
              ) : (
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate('/my-bookmarks')}>
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
  if (createBookmark.isError || createPrivateBookmark.isError) {
    const errorMessage = createBookmark.error?.message || createPrivateBookmark.error?.message || 'An error occurred while saving your bookmark.';
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
                {errorMessage}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => {
                  setSuccess(false);
                  createBookmark.reset();
                  createPrivateBookmark.reset();
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
  if (createBookmark.isPending || createPrivateBookmark.isPending) {
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

              {/* Private bookmark option */}
              {vaultState.status !== 'no_vault' && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50">
                  <Checkbox
                    id="private"
                    checked={isPrivate}
                    onCheckedChange={(checked) => setIsPrivate(checked === true)}
                    disabled={!isVaultUnlocked}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="private"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Lock className="h-4 w-4" />
                      Private bookmark
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isVaultUnlocked
                        ? 'Encrypted and not linked to your public identity'
                        : 'Unlock your vault to create private bookmarks'}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={!url || !title}>
                  {isPrivate ? 'Save Private Bookmark' : 'Save Bookmark'}
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
