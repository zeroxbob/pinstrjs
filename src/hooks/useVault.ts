import { useContext } from "react";
import { VaultContext, type VaultContextType } from "@/contexts/VaultContext";

/**
 * Hook to access the private vault for encrypted bookmarks.
 *
 * @returns Vault context with state and methods
 * @throws Error if used outside VaultProvider
 *
 * @example
 * ```tsx
 * function PrivateBookmarkButton() {
 *   const { state, encrypt, createVault, unlockVault } = useVault();
 *
 *   if (state.status === "no_vault") {
 *     return <button onClick={() => createVault(passphrase)}>Create Vault</button>;
 *   }
 *
 *   if (state.status === "locked") {
 *     return <button onClick={() => unlockVault(passphrase)}>Unlock</button>;
 *   }
 *
 *   // Vault is unlocked, can encrypt
 *   const encrypted = encrypt("secret bookmark data");
 * }
 * ```
 */
export function useVault(): VaultContextType {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}

/**
 * Hook to check if the vault is ready for use (unlocked).
 *
 * @returns True if vault is unlocked and ready for encryption/decryption
 */
export function useIsVaultUnlocked(): boolean {
  const { state } = useVault();
  return state.status === "unlocked";
}

/**
 * Hook to get the vault's public key (for querying private bookmarks).
 * Returns undefined if vault is not unlocked.
 *
 * @returns Vault pubkey as hex string, or undefined
 */
export function useVaultPubkey(): string | undefined {
  const { state } = useVault();
  if (state.status === "unlocked") {
    return state.vaultPubkey;
  }
  return undefined;
}
