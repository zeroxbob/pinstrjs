import { useState, useEffect } from "react";
import { useNostr } from "@nostrify/react";
import { NUser, useNostrLogin } from "@nostrify/react/login";
import { finalizeEvent, type EventTemplate } from "nostr-tools/pure";
import {
  Bookmark,
  Tag as TagIcon,
  Lock,
  CheckCircle,
  Loader2,
  LogOut,
} from "lucide-react";
import { useExtensionVault } from "@ext/providers/ExtensionVaultProvider";
import { ExtensionLoginForm } from "@ext/components/ExtensionLoginForm";
import { VaultUnlockPrompt } from "@ext/components/VaultUnlockPrompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageMetadata {
  url: string;
  title: string;
  description: string;
}

type Status = "idle" | "loading" | "success" | "error";

export function Popup() {
  const { nostr } = useNostr();
  const { logins, removeLogin } = useNostrLogin();
  const { state: vaultState, encrypt } = useExtensionVault();

  // Get current user from logins
  const login = logins[0];
  const user = login ? getUserFromLogin(login) : null;

  // Form state
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);

  // UI state
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isVaultUnlocked = vaultState.status === "unlocked";

  // Load page metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          const response = (await chrome.tabs.sendMessage(tab.id, {
            type: "GET_PAGE_METADATA",
          })) as PageMetadata;
          setUrl(response.url);
          setTitle(response.title);
          setDescription(response.description);
        }
      } catch (error) {
        console.error("Failed to get page metadata:", error);
        // Fallback: try to get basic info from tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          setUrl(tab.url || "");
          setTitle(tab.title || "");
        }
      }
    };
    loadMetadata();
  }, []);

  // Default to private when vault is unlocked
  useEffect(() => {
    if (isVaultUnlocked) {
      setIsPrivate(true);
    }
  }, [isVaultUnlocked]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleLogout = () => {
    if (login) {
      removeLogin(login.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      if (!url.trim()) {
        throw new Error("URL is required");
      }

      if (!user) {
        throw new Error("Not logged in");
      }

      // Ensure URL has protocol
      let fullUrl = url.trim();
      if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
        fullUrl = `https://${fullUrl}`;
      }

      if (isPrivate && isVaultUnlocked && vaultState.keys) {
        // Create private bookmark
        const identifier = crypto.randomUUID();
        const contentToEncrypt = JSON.stringify({
          url: fullUrl,
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
        });
        const encryptedContent = encrypt(contentToEncrypt);

        const eventTemplate: EventTemplate = {
          kind: 39701,
          content: encryptedContent,
          tags: [["d", identifier]],
          created_at: Math.floor(Date.now() / 1000),
        };

        const signedEvent = finalizeEvent(eventTemplate, vaultState.keys.signingKey);
        await nostr.event(signedEvent, { signal: AbortSignal.timeout(5000) });
      } else {
        // Create public bookmark
        const identifier = extractIdentifier(fullUrl);
        const eventTags: string[][] = [["d", identifier]];

        if (title.trim()) {
          eventTags.push(["title", title.trim()]);
        }

        tags.forEach((tag) => {
          eventTags.push(["t", tag]);
        });

        const event = await user.signer.signEvent({
          kind: 39701,
          content: description.trim(),
          tags: eventTags,
          created_at: Math.floor(Date.now() / 1000),
        });

        await nostr.event(event, { signal: AbortSignal.timeout(5000) });
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to create bookmark");
    }
  };

  // Not logged in - show login form
  if (!user) {
    return (
      <div className="w-[400px] p-4 bg-background text-foreground">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bookmark className="h-5 w-5 text-violet-600" />
              Pinstr
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExtensionLoginForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in but vault not unlocked - show vault unlock prompt
  if (!isVaultUnlocked) {
    return (
      <div className="w-[400px] p-4 bg-background text-foreground">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bookmark className="h-5 w-5 text-violet-600" />
                Pinstr
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <VaultUnlockPrompt />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="w-[400px] p-4 bg-background text-foreground">
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Bookmark Saved!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {isPrivate
                ? "Your private bookmark has been encrypted and saved."
                : "Your bookmark has been saved to Nostr."}
            </p>
            <Button onClick={() => window.close()}>Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-[400px] p-4 bg-background text-foreground">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bookmark className="h-5 w-5 text-violet-600" />
              Pinstr
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this page about?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add tag..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  <TagIcon className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
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
            </div>

            {/* Private bookmark checkbox */}
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50">
              <Checkbox
                id="private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked === true)}
              />
              <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                <Lock className="h-4 w-4" />
                Private bookmark (encrypted)
              </Label>
            </div>

            {status === "error" && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm">
                {errorMessage}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isPrivate ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Save Private Bookmark
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save Bookmark
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function extractIdentifier(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.host + urlObj.pathname + urlObj.search + urlObj.hash;
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

function getUserFromLogin(login: { type: string; id: string; pubkey?: string; signer?: unknown }) {
  try {
    switch (login.type) {
      case "nsec":
        return NUser.fromNsecLogin(login as Parameters<typeof NUser.fromNsecLogin>[0]);
      case "bunker":
        // Bunker needs nostr instance, but we can still return a partial user
        return NUser.fromNsecLogin(login as Parameters<typeof NUser.fromNsecLogin>[0]);
      case "nip07":
        // NIP-07 login has signer attached directly
        if (login.pubkey && login.signer) {
          return {
            pubkey: login.pubkey,
            signer: login.signer as {
              signEvent: (event: {
                kind: number;
                content: string;
                tags: string[][];
                created_at: number;
              }) => Promise<{
                id: string;
                pubkey: string;
                created_at: number;
                kind: number;
                tags: string[][];
                content: string;
                sig: string;
              }>;
            },
          };
        }
        return null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}
