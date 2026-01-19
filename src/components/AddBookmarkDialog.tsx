import { useState, useEffect } from 'react';
import { Plus, Bookmark, Tag as TagIcon, Lock } from 'lucide-react';
import { useCreateBookmark, type CreateBookmarkData } from '@/hooks/useCreateBookmark';
import { useCreatePrivateBookmark } from '@/hooks/usePrivateBookmarks';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { useAppContext } from '@/hooks/useAppContext';
import { useVault } from '@/hooks/useVault';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export function AddBookmarkDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

  const { user } = useCurrentUser();
  const { config } = useAppContext();
  const { state: vaultState } = useVault();
  const { mutate: createBookmark, isPending: isCreatingPublic } = useCreateBookmark();
  const { mutate: createPrivateBookmark, isPending: isCreatingPrivate } = useCreatePrivateBookmark();
  const { toast } = useToast();

  const isVaultUnlocked = vaultState.status === 'unlocked';
  const isPending = isCreatingPublic || isCreatingPrivate;

  // Default to private when vault is enabled and unlocked
  useEffect(() => {
    if (open && config.vaultEnabled && isVaultUnlocked) {
      setIsPrivate(true);
    }
  }, [open, config.vaultEnabled, isVaultUnlocked]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast({
        title: 'Error',
        description: 'URL is required',
        variant: 'destructive',
      });
      return;
    }

    if (isPrivate && !isVaultUnlocked) {
      toast({
        title: 'Error',
        description: 'Please unlock your vault first to create private bookmarks.',
        variant: 'destructive',
      });
      return;
    }

    const data: CreateBookmarkData = {
      url: url.trim(),
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    const resetForm = () => {
      setUrl('');
      setTitle('');
      setDescription('');
      setTags([]);
      setTagInput('');
      setIsPrivate(false);
      setOpen(false);
    };

    const onSuccess = () => {
      toast({
        title: isPrivate ? 'Private bookmark created' : 'Bookmark created',
        description: isPrivate
          ? 'Your encrypted bookmark has been saved.'
          : 'Your bookmark has been saved to Nostr.',
      });
      resetForm();
    };

    const onError = (error: Error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create bookmark',
        variant: 'destructive',
      });
    };

    if (isPrivate) {
      createPrivateBookmark(data, { onSuccess, onError });
    } else {
      createBookmark(data, { onSuccess, onError });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Bookmark
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Add New Bookmark
          </DialogTitle>
          <DialogDescription>
            Save a web page to your Nostr bookmarks using NIP-B0
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">
              URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              The web address you want to bookmark
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="My Awesome Article"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              A descriptive title for your bookmark
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this bookmark about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Optional notes or summary about the bookmarked page
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="tags"
                  type="text"
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  disabled={isPending}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={isPending || !tagInput.trim()}
              >
                <TagIcon className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Categorize your bookmark with topics (press Enter or click + to add)
            </p>
          </div>

          {/* Private bookmark option - only shown when vault exists */}
          {vaultState.status !== 'no_vault' && (
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50">
              <Checkbox
                id="private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked === true)}
                disabled={isPending || !isVaultUnlocked}
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

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !url.trim()}>
              {isPending ? 'Saving...' : isPrivate ? 'Save Private Bookmark' : 'Save Bookmark'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
