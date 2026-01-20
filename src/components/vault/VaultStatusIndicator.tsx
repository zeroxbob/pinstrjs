import { useState } from "react";
import { Lock, LockOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useVault } from "@/hooks/useVault";
import { VaultSetupDialog } from "./VaultSetupDialog";
import { VaultUnlockDialog } from "./VaultUnlockDialog";

interface VaultStatusIndicatorProps {
  /** Size variant */
  size?: "sm" | "default";
  /** Show text label */
  showLabel?: boolean;
}

/**
 * Shows the current vault status with buttons to setup/unlock/lock.
 */
export function VaultStatusIndicator({
  size = "default",
  showLabel = false,
}: VaultStatusIndicatorProps) {
  const { state, lockVault, deleteVault, isLoading } = useVault();

  const [setupOpen, setSetupOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      await deleteVault(deleteConfirm);
      setDeleteOpen(false);
      setDeleteConfirm("");
      setDeleteError(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Failed to delete vault");
    }
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonSize = size === "sm" ? "sm" : "default";

  if (isLoading) {
    return (
      <Button variant="ghost" size={buttonSize} disabled>
        <Lock className={`${iconSize} animate-pulse`} />
        {showLabel && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  // No vault - show setup button
  if (state.status === "no_vault") {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={buttonSize}
              onClick={() => setSetupOpen(true)}
            >
              <Plus className={iconSize} />
              {showLabel && <span className="ml-2">Create Private Vault</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create a private vault for encrypted bookmarks</p>
          </TooltipContent>
        </Tooltip>

        <VaultSetupDialog
          isOpen={setupOpen}
          onClose={() => setSetupOpen(false)}
        />
      </>
    );
  }

  // Locked - show unlock button
  if (state.status === "locked") {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={buttonSize}
              onClick={() => setUnlockOpen(true)}
            >
              <Lock className={iconSize} />
              {showLabel && <span className="ml-2">Unlock Vault</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Unlock your private vault</p>
          </TooltipContent>
        </Tooltip>

        <VaultUnlockDialog
          isOpen={unlockOpen}
          onClose={() => setUnlockOpen(false)}
          showResetOption
          onResetRequest={() => {
            setUnlockOpen(false);
            setDeleteOpen(true);
          }}
        />

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Private Vault?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  This will permanently delete your vault. All private bookmarks
                  will become inaccessible.
                </p>
                <p className="font-medium text-destructive">
                  This action cannot be undone.
                </p>
                <div className="pt-2">
                  <p className="text-sm mb-2">
                    Type <strong>DELETE</strong> to confirm:
                  </p>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => {
                      setDeleteConfirm(e.target.value);
                      setDeleteError(null);
                    }}
                    placeholder="DELETE"
                    className="font-mono"
                  />
                  {deleteError && (
                    <p className="text-sm text-destructive mt-1">{deleteError}</p>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirm("")}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteConfirm !== "DELETE"}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Vault
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Unlocked - show lock button
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size={buttonSize} onClick={lockVault}>
          <LockOpen className={`${iconSize} text-green-500`} />
          {showLabel && <span className="ml-2">Vault Unlocked</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Vault is unlocked. Click to lock.</p>
      </TooltipContent>
    </Tooltip>
  );
}
