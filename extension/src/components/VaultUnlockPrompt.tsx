import { useState } from "react";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useExtensionVault } from "@ext/hooks/useExtensionVault";

export function VaultUnlockPrompt() {
  const { unlockVault } = useExtensionVault();
  const [passphrase, setPassphrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passphrase) {
      setError("Please enter a passphrase");
      return;
    }

    setIsLoading(true);
    try {
      await unlockVault(passphrase);
      setPassphrase(""); // Clear from memory
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to unlock vault");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
        </div>
        <h2 className="text-lg font-semibold">Unlock Your Vault</h2>
        <p className="text-sm text-muted-foreground">
          Enter your vault passphrase to save private bookmarks
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Enter the same passphrase you use on <strong>pinstr.co</strong> to access your
          private bookmarks across both the extension and web app.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="passphrase">Vault Passphrase</Label>
          <Input
            id="passphrase"
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter your passphrase"
            autoFocus
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Your passphrase unlocks your private bookmarks. It's never sent to any server.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || !passphrase}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Unlocking...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Unlock Vault
            </>
          )}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        Your vault remains unlocked for this browser session only.
      </p>
    </div>
  );
}
