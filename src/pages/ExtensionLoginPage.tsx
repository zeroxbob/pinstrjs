import { useState, useEffect } from "react";
import { Puzzle, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Nip07Nostr {
  getPublicKey(): Promise<string>;
}

declare const window: Window & { nostr?: Nip07Nostr };
declare const chrome: {
  runtime?: {
    sendMessage(extensionId: string, message: unknown): Promise<unknown>;
  };
};

export default function ExtensionLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasNostr, setHasNostr] = useState<boolean | null>(null);
  const [extensionId, setExtensionId] = useState<string | null>(null);

  useEffect(() => {
    // Get extension ID from URL params
    const params = new URLSearchParams(window.location.search);
    const id = params.get("extensionId");
    setExtensionId(id);

    if (!id) {
      setError("Missing extension ID. This page must be opened by the Pinstr extension.");
      return;
    }

    // Check if window.nostr is available
    const checkNostr = () => {
      setHasNostr(typeof window.nostr !== "undefined");
    };

    checkNostr();

    // Some extensions inject async, so check again after a delay
    const timeout = setTimeout(checkNostr, 500);

    return () => clearTimeout(timeout);
  }, []);

  const handleConnect = async () => {
    if (!extensionId) {
      setError("Missing extension ID");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (!window.nostr) {
        throw new Error("NIP-07 extension not found");
      }

      const pubkey = await window.nostr.getPublicKey();

      // Check if chrome.runtime is available
      if (!chrome?.runtime?.sendMessage) {
        throw new Error("Chrome extension API not available");
      }

      // Send the pubkey back to the extension
      await chrome.runtime.sendMessage(extensionId, {
        type: "NIP07_LOGIN_SUCCESS",
        pubkey,
      });

      setSuccess(true);

      // Close the tab after a brief delay
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect extension");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Puzzle className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Connect NIP-07 Extension</h1>
          <p className="text-muted-foreground">
            Connect your Nostr browser extension to Pinstr
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          {!extensionId && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This page must be opened by the Pinstr browser extension.
              </AlertDescription>
            </Alert>
          )}

          {extensionId && hasNostr === null && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {extensionId && hasNostr === false && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No NIP-07 extension detected. Please install a Nostr browser extension like
                nos2x or Alby to continue.
              </AlertDescription>
            </Alert>
          )}

          {extensionId && hasNostr === true && !success && (
            <>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your browser extension will ask you to approve this connection. The
                  approval will show <strong>pinstr.app</strong> (or <strong>localhost</strong>{" "}
                  in development), confirming it's Pinstr requesting access.
                </p>
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>

              <Button className="w-full" onClick={handleConnect} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Puzzle className="h-4 w-4 mr-2" />
                    Connect Extension
                  </>
                )}
              </Button>
            </>
          )}

          {success && (
            <div className="space-y-4 text-center py-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Successfully connected!</p>
                <p className="text-sm text-muted-foreground">
                  This window will close automatically...
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          This page is part of the Pinstr web app and runs in a secure context where your
          NIP-07 extension can be accessed.
        </p>
      </div>
    </div>
  );
}
