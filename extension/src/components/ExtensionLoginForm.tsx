import { useState, useEffect } from "react";
import { KeyRound, Cloud, Loader2, AlertTriangle, Puzzle } from "lucide-react";
import { useNostr } from "@nostrify/react";
import { NLogin, useNostrLogin } from "@nostrify/react/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkNip07Available, nip07GetPublicKey, Nip07ProxySigner } from "@ext/lib/nip07Proxy";

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
  const [nip07Available, setNip07Available] = useState<boolean | null>(null);

  // Check if NIP-07 is available on the current tab
  useEffect(() => {
    checkNip07Available().then(setNip07Available);
  }, []);

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

  const handleNip07Login = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const pubkey = await nip07GetPublicKey();
      const signer = new Nip07ProxySigner(pubkey);

      // Create a custom login object that uses our proxy signer
      const login = {
        id: `nip07-${pubkey}`,
        type: "nip07" as const,
        pubkey,
        signer,
      };

      addLogin(login);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect to extension");
    } finally {
      setIsLoading(false);
    }
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
            {nip07Available === false && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No NIP-07 extension detected on this page. Make sure you have a Nostr
                  extension installed and that it's enabled for this site.
                </AlertDescription>
              </Alert>
            )}
            {nip07Available === null && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <Button
            className="w-full"
            onClick={handleNip07Login}
            disabled={isLoading || nip07Available !== true}
          >
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
        Extension login requires the current page to have your NIP-07 signer available.
      </p>
    </div>
  );
}
