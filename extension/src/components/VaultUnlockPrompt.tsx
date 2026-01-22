import { useState } from "react";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useExtensionVault } from "@ext/providers/ExtensionVaultProvider";

const MIN_PASSPHRASE_LENGTH = 12;

export function VaultUnlockPrompt() {
  const { state, createVault, unlockVault } = useExtensionVault();
  const [passphrase, setPassphrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasVault = state.status !== "no_vault";
  const isCreating = !hasVault;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passphrase) {
      setError("Please enter a passphrase");
      return;
    }

    if (isCreating && passphrase.length < MIN_PASSPHRASE_LENGTH) {
      setError(`Passphrase must be at least ${MIN_PASSPHRASE_LENGTH} characters`);
      return;
    }

    setIsLoading(true);
    try {
      if (isCreating) {
        await createVault(passphrase);
      } else {
        await unlockVault(passphrase);
      }
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
        <h2 className="text-lg font-semibold">
          {isCreating ? "Set Up Your Vault" : "Unlock Your Vault"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isCreating
            ? "Create a passphrase to enable private, encrypted bookmarks"
            : "Enter your vault passphrase to access private bookmarks"}
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          {isCreating ? (
            <>
              <strong>Important:</strong> Use the same passphrase you use on{" "}
              <strong>pinstr.app</strong>. This ensures your private bookmarks
              are accessible across both the extension and web app.
            </>
          ) : (
            <>
              Enter the same passphrase you use on <strong>pinstr.app</strong> to access your
              private bookmarks.
            </>
          )}
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
            placeholder={
              isCreating
                ? `At least ${MIN_PASSPHRASE_LENGTH} characters`
                : "Enter your passphrase"
            }
            autoFocus
            autoComplete="off"
          />
          {isCreating && (
            <p className="text-xs text-muted-foreground">
              Your passphrase is used to encrypt your private bookmarks. It never leaves your
              device.
            </p>
          )}
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
              {isCreating ? "Creating..." : "Unlocking..."}
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              {isCreating ? "Create Vault" : "Unlock Vault"}
            </>
          )}
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        Your vault passphrase is stored in your browser session and cleared when you close the
        browser.
      </p>
    </div>
  );
}
