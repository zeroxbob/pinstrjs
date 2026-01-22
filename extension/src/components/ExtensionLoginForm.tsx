import { useState } from "react";
import { KeyRound, Cloud, Loader2, AlertTriangle, Puzzle } from "lucide-react";
import { useNostr } from "@nostrify/react";
import { NLogin, useNostrLogin } from "@nostrify/react/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getExtensionLoginUrl } from "@ext/config";

const validateNsec = (nsec: string) => {
  return /^nsec1[a-zA-Z0-9]{58}$/.test(nsec);
};

const validateBunkerUri = (uri: string) => {
  return uri.startsWith("bunker://");
};

export function ExtensionLoginForm() {
  const { nostr } = useNostr();
  const { addLogin } = useNostrLogin();

  const [nsec, setNsec] = useState("");
  const [bunkerUri, setBunkerUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNsecLogin = () => {
    setError(null);

    if (!nsec.trim()) {
      setError("Please enter your secret key");
      return;
    }

    if (!validateNsec(nsec)) {
      setError("Invalid secret key format. Must start with nsec1.");
      return;
    }

    setIsLoading(true);
    try {
      const login = NLogin.fromNsec(nsec);
      addLogin(login);
      setNsec(""); // Clear from memory
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBunkerLogin = async () => {
    setError(null);

    if (!bunkerUri.trim()) {
      setError("Please enter a bunker URI");
      return;
    }

    if (!validateBunkerUri(bunkerUri)) {
      setError("Invalid bunker URI. Must start with bunker://");
      return;
    }

    setIsLoading(true);
    try {
      const login = await NLogin.fromBunker(bunkerUri, nostr);
      addLogin(login);
      setBunkerUri(""); // Clear from memory
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect to bunker");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNip07Login = () => {
    // Get the extension ID
    const extensionId = chrome.runtime.id;

    // Open the web app login page with the extension ID
    const loginUrl = `${getExtensionLoginUrl()}?extensionId=${extensionId}`;

    chrome.tabs.create({
      url: loginUrl,
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold">Sign in to Pinstr</h2>
        <p className="text-sm text-muted-foreground">
          Use your Nostr key or bunker to save bookmarks
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="extension" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="extension" className="flex items-center gap-2">
            <Puzzle className="w-4 h-4" />
            Extension
          </TabsTrigger>
          <TabsTrigger value="key" className="flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Key
          </TabsTrigger>
          <TabsTrigger value="bunker" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Bunker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="extension" className="space-y-4 mt-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sign in using your NIP-07 browser extension (nos2x, Alby, etc.)
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will open the Pinstr web app where you can connect your NIP-07 extension.
                The approval dialog will show <strong>pinstr.co, confirming the request is from
                Pinstr.
              </AlertDescription>
            </Alert>
          </div>
          <Button className="w-full" onClick={handleNip07Login}>
            <Puzzle className="h-4 w-4 mr-2" />
            Connect Extension
          </Button>
        </TabsContent>

        <TabsContent value="key" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nsec">Secret Key (nsec)</Label>
            <Input
              id="nsec"
              type="password"
              value={nsec}
              onChange={(e) => setNsec(e.target.value)}
              placeholder="nsec1..."
              autoComplete="off"
              onKeyDown={(e) => e.key === "Enter" && handleNsecLogin()}
            />
            <p className="text-xs text-muted-foreground">
              Your key is stored locally and never sent to any server.
            </p>
          </div>
          <Button
            className="w-full"
            onClick={handleNsecLogin}
            disabled={isLoading || !nsec.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </TabsContent>

        <TabsContent value="bunker" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="bunker">Bunker URI</Label>
            <Input
              id="bunker"
              type="text"
              value={bunkerUri}
              onChange={(e) => setBunkerUri(e.target.value)}
              placeholder="bunker://..."
              autoComplete="off"
              onKeyDown={(e) => e.key === "Enter" && handleBunkerLogin()}
            />
            <p className="text-xs text-muted-foreground">
              Connect to a remote signer like nsecBunker.
            </p>
          </div>
          <Button
            className="w-full"
            onClick={handleBunkerLogin}
            disabled={isLoading || !bunkerUri.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-center text-muted-foreground pt-2">
        Your credentials are stored securely and only in your browser.
      </p>
    </div>
  );
}
