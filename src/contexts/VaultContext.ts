import { createContext } from "react";
import type { VaultKeys } from "../lib/vaultCrypto";

/**
 * Vault state represents the current status of the private vault.
 */
export type VaultState =
  | { status: "no_vault" } // User has not set up a vault
  | { status: "locked" } // Vault exists but needs passphrase
  | { status: "unlocked"; keys: VaultKeys; vaultPubkey: string }; // Ready to use

/**
 * Context type for the private vault.
 *
 * The vault provides quantum-resistant encryption for private bookmarks
 * using a passphrase-derived key that is separate from the user's nsec.
 */
export interface VaultContextType {
  /** Current vault state */
  state: VaultState;

  /** Whether the vault is currently being initialized or unlocked */
  isLoading: boolean;

  /**
   * Create a new vault with the given passphrase.
   * Generates a random salt and derives keys from passphrase + salt.
   *
   * @param passphrase - User's chosen passphrase (should be strong)
   * @returns The generated salt as hex (for backup purposes)
   * @throws If vault already exists or passphrase is too weak
   */
  createVault: (passphrase: string) => Promise<string>;

  /**
   * Unlock an existing vault with the passphrase.
   * Retrieves salt from IndexedDB and derives keys.
   *
   * @param passphrase - User's passphrase
   * @throws If passphrase is incorrect or vault doesn't exist
   */
  unlockVault: (passphrase: string) => Promise<void>;

  /**
   * Lock the vault, clearing keys from memory.
   * Called on logout or manual lock.
   */
  lockVault: () => void;

  /**
   * Delete the vault entirely.
   * WARNING: This makes all private bookmarks permanently inaccessible.
   *
   * @param confirmPhrase - Must be "DELETE" to confirm
   */
  deleteVault: (confirmPhrase: string) => Promise<void>;

  /**
   * Encrypt content using the vault's encryption key.
   * Only available when vault is unlocked.
   *
   * @param plaintext - Content to encrypt
   * @returns Serialized encrypted data (nonce:ciphertext in hex)
   * @throws If vault is not unlocked
   */
  encrypt: (plaintext: string) => string;

  /**
   * Decrypt content using the vault's encryption key.
   * Only available when vault is unlocked.
   *
   * @param serialized - Encrypted data from encrypt()
   * @returns Decrypted plaintext
   * @throws If vault is not unlocked or decryption fails
   */
  decrypt: (serialized: string) => string;
}

export const VaultContext = createContext<VaultContextType | undefined>(
  undefined
);
