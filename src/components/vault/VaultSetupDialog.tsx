import { useState, useCallback } from "react";
import { Lock, Copy, Check, AlertTriangle, Eye, EyeOff } from "lucide-react";
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

interface VaultSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MIN_PASSPHRASE_LENGTH = 12;

/**
 * Dialog for setting up a new private vault.
 * Guides user through creating a strong passphrase.
 */
export function VaultSetupDialog({
  isOpen,
  onClose,
  onSuccess,
}: VaultSetupDialogProps) {
  const { createVault, isLoading } = useVault();

  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedSalt, setGeneratedSalt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resetState = useCallback(() => {
    setPassphrase("");
    setConfirmPassphrase("");
    setShowPassphrase(false);
    setError(null);
    setGeneratedSalt(null);
    setCopied(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleCreate = useCallback(async () => {
    setError(null);

    // Validation
    if (passphrase.length < MIN_PASSPHRASE_LENGTH) {
      setError(`Passphrase must be at least ${MIN_PASSPHRASE_LENGTH} characters`);
      return;
    }

    if (passphrase !== confirmPassphrase) {
      setError("Passphrases do not match");
      return;
    }

    try {
      const saltHex = await createVault(passphrase);
      setGeneratedSalt(saltHex);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create vault");
    }
  }, [passphrase, confirmPassphrase, createVault]);

  const handleCopyPassphrase = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(passphrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API might not be available
      setError("Could not copy to clipboard");
    }
  }, [passphrase]);

  const handleDone = useCallback(() => {
    handleClose();
    onSuccess?.();
  }, [handleClose, onSuccess]);

  const passphraseStrength = getPassphraseStrength(passphrase);

  // Success state - vault created
  if (generatedSalt) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-500" />
              Vault Created
            </DialogTitle>
            <DialogDescription>
              Your private vault is now set up and unlocked.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Save your passphrase now!</strong> If you lose it, your
                private bookmarks cannot be recovered.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Your Passphrase</Label>
              <div className="flex gap-2">
                <Input
                  value={passphrase}
                  readOnly
                  type={showPassphrase ? "text" : "password"}
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                >
                  {showPassphrase ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="icon" onClick={handleCopyPassphrase}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy this to your password manager
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleDone} className="w-full">
              I've Saved My Passphrase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Setup state - creating vault
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Create Private Vault
          </DialogTitle>
          <DialogDescription>
            Your private bookmarks will be encrypted with a separate passphrase.
            This is <strong>not</strong> your Nostr key.
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
                placeholder="Enter a strong passphrase"
                autoComplete="off"
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
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${passphraseStrength.color}`}
                  style={{ width: `${passphraseStrength.percent}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {passphraseStrength.label}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Passphrase</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              placeholder="Confirm your passphrase"
              autoComplete="off"
            />
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Write this down or save it in a password manager. If you forget your
              passphrase, your private bookmarks cannot be recovered.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              isLoading ||
              passphrase.length < MIN_PASSPHRASE_LENGTH ||
              passphrase !== confirmPassphrase
            }
          >
            {isLoading ? "Creating..." : "Create Vault"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getPassphraseStrength(passphrase: string): {
  percent: number;
  label: string;
  color: string;
} {
  const length = passphrase.length;

  if (length === 0) {
    return { percent: 0, label: "", color: "bg-muted" };
  }

  if (length < 8) {
    return { percent: 20, label: "Too short", color: "bg-red-500" };
  }

  if (length < 12) {
    return { percent: 40, label: "Weak", color: "bg-orange-500" };
  }

  // Check for variety
  const hasLower = /[a-z]/.test(passphrase);
  const hasUpper = /[A-Z]/.test(passphrase);
  const hasNumber = /[0-9]/.test(passphrase);
  const hasSpecial = /[^a-zA-Z0-9]/.test(passphrase);
  const variety = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (length >= 16 && variety >= 3) {
    return { percent: 100, label: "Strong", color: "bg-green-500" };
  }

  if (length >= 12 && variety >= 2) {
    return { percent: 75, label: "Good", color: "bg-blue-500" };
  }

  return { percent: 60, label: "Fair", color: "bg-yellow-500" };
}
