import { useState, useCallback, useEffect } from "react";
import { Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVault } from "@/hooks/useVault";

interface VaultUnlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** If true, shows reset vault option */
  showResetOption?: boolean;
  onResetRequest?: () => void;
}

/**
 * Dialog for unlocking an existing private vault.
 */
export function VaultUnlockDialog({
  isOpen,
  onClose,
  onSuccess,
  showResetOption = false,
  onResetRequest,
}: VaultUnlockDialogProps) {
  const { unlockVault, isLoading } = useVault();

  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPassphrase("");
      setShowPassphrase(false);
      setError(null);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setPassphrase("");
    setError(null);
    onClose();
  }, [onClose]);

  const handleUnlock = useCallback(async () => {
    if (!passphrase.trim()) {
      setError("Please enter your passphrase");
      return;
    }

    setError(null);

    try {
      await unlockVault(passphrase);
      setPassphrase(""); // Clear from memory
      onSuccess?.();
      onClose();
    } catch (e) {
      setAttempts((prev) => prev + 1);
      // We can't actually verify if the passphrase is wrong until decryption fails,
      // but if there's an error during unlock, it's likely the wrong passphrase
      setError("Could not unlock vault. Please check your passphrase.");
      console.error("[Vault] Unlock error:", e);
    }
  }, [passphrase, unlockVault, onSuccess, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && passphrase.trim()) {
        handleUnlock();
      }
    },
    [passphrase, handleUnlock]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Unlock Private Vault
          </DialogTitle>
          <DialogDescription>
            Enter your passphrase to access your private bookmarks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="passphrase">Passphrase</Label>
            <div className="flex gap-2">
              <Input
                id="passphrase"
                type={showPassphrase ? "text" : "password"}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your vault passphrase"
                autoComplete="off"
                autoFocus
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPassphrase(!showPassphrase)}
                type="button"
              >
                {showPassphrase ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {showResetOption && attempts >= 3 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Forgot your passphrase?{" "}
                <button
                  type="button"
                  onClick={onResetRequest}
                  className="text-primary underline hover:no-underline"
                >
                  Reset your vault
                </button>{" "}
                (this will delete all private bookmarks).
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUnlock}
            disabled={isLoading || !passphrase.trim()}
          >
            {isLoading ? "Unlocking..." : "Unlock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
