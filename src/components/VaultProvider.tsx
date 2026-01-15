import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { getPublicKey } from "nostr-tools/pure";
import {
  VaultContext,
  type VaultContextType,
  type VaultState,
} from "@/contexts/VaultContext";
import {
  generateSalt,
  deriveVaultKeys,
  encryptContent,
  decryptContent,
  serializeEncryptedData,
  deserializeEncryptedData,
  saltToHex,
  hexToSalt,
  clearKeys,
  type VaultKeys,
} from "@/lib/vaultCrypto";
import {
  hasVault,
  readVaultMetadata,
  writeVaultMetadata,
  updateLastUnlocked,
  deleteVaultMetadata,
} from "@/lib/vaultStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/** Minimum passphrase length for security */
const MIN_PASSPHRASE_LENGTH = 12;

/** Session storage key for vault keys (cleared on browser close) */
const SESSION_KEYS_PREFIX = "vault-keys-";

interface VaultProviderProps {
  children: ReactNode;
}

/**
 * Provides vault context for private bookmarks encryption.
 *
 * The vault uses a passphrase-derived key separate from the user's nsec,
 * providing quantum-resistant encryption via AES-256-GCM.
 *
 * Keys are stored in:
 * - Memory (React state) for immediate access
 * - sessionStorage for persistence across page refreshes (cleared on browser close)
 *
 * The salt is stored permanently in IndexedDB.
 */
export function VaultProvider({ children }: VaultProviderProps) {
  const { user } = useCurrentUser();
  const userPubkey = user?.pubkey;

  const [state, setState] = useState<VaultState>({ status: "no_vault" });
  const [isLoading, setIsLoading] = useState(true);

  // Check vault existence on mount and user change
  useEffect(() => {
    if (!userPubkey) {
      setState({ status: "no_vault" });
      setIsLoading(false);
      return;
    }

    const checkVault = async () => {
      setIsLoading(true);
      try {
        // First, check if we have keys in sessionStorage (page refresh case)
        const sessionKeys = loadKeysFromSession(userPubkey);
        if (sessionKeys) {
          const vaultPubkey = getPublicKey(sessionKeys.signingKey);
          setState({ status: "unlocked", keys: sessionKeys, vaultPubkey });
          setIsLoading(false);
          return;
        }

        // Otherwise, check if vault exists in IndexedDB
        const vaultExists = await hasVault(userPubkey);
        if (vaultExists) {
          setState({ status: "locked" });
        } else {
          setState({ status: "no_vault" });
        }
      } catch (error) {
        console.error("[Vault] Error checking vault status:", error);
        setState({ status: "no_vault" });
      }
      setIsLoading(false);
    };

    checkVault();
  }, [userPubkey]);

  // Create a new vault
  const createVault = useCallback(
    async (passphrase: string): Promise<string> => {
      if (!userPubkey) {
        throw new Error("Must be logged in to create vault");
      }

      if (state.status !== "no_vault") {
        throw new Error("Vault already exists");
      }

      if (passphrase.length < MIN_PASSPHRASE_LENGTH) {
        throw new Error(
          `Passphrase must be at least ${MIN_PASSPHRASE_LENGTH} characters`
        );
      }

      setIsLoading(true);
      try {
        // Generate random salt
        const salt = generateSalt();
        const saltHex = saltToHex(salt);

        // Derive keys from passphrase + salt
        const keys = deriveVaultKeys(passphrase, salt);
        const vaultPubkey = getPublicKey(keys.signingKey);

        // Store salt in IndexedDB
        await writeVaultMetadata(userPubkey, {
          saltHex,
          createdAt: Math.floor(Date.now() / 1000),
          lastUnlockedAt: Math.floor(Date.now() / 1000),
        });

        // Store keys in session and memory
        saveKeysToSession(userPubkey, keys);
        setState({ status: "unlocked", keys, vaultPubkey });

        return saltHex;
      } finally {
        setIsLoading(false);
      }
    },
    [userPubkey, state.status]
  );

  // Unlock existing vault
  const unlockVault = useCallback(
    async (passphrase: string): Promise<void> => {
      if (!userPubkey) {
        throw new Error("Must be logged in to unlock vault");
      }

      if (state.status === "no_vault") {
        throw new Error("No vault exists. Create one first.");
      }

      if (state.status === "unlocked") {
        return; // Already unlocked
      }

      setIsLoading(true);
      try {
        // Read salt from IndexedDB
        const metadata = await readVaultMetadata(userPubkey);
        if (!metadata) {
          throw new Error("Vault metadata not found");
        }

        const salt = hexToSalt(metadata.saltHex);
        const keys = deriveVaultKeys(passphrase, salt);
        const vaultPubkey = getPublicKey(keys.signingKey);

        // Update last unlocked timestamp
        await updateLastUnlocked(userPubkey);

        // Store keys in session and memory
        saveKeysToSession(userPubkey, keys);
        setState({ status: "unlocked", keys, vaultPubkey });
      } catch (error) {
        // If derivation succeeds but something else fails, we can't easily
        // verify the passphrase. The user will find out when decryption fails.
        console.error("[Vault] Error unlocking vault:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [userPubkey, state.status]
  );

  // Lock the vault
  const lockVault = useCallback(() => {
    if (state.status === "unlocked") {
      // Clear keys from memory
      clearKeys(state.keys);
    }

    // Clear from session storage
    if (userPubkey) {
      clearKeysFromSession(userPubkey);
    }

    setState({ status: "locked" });
  }, [userPubkey, state]);

  // Delete vault entirely
  const deleteVault = useCallback(
    async (confirmPhrase: string): Promise<void> => {
      if (!userPubkey) {
        throw new Error("Must be logged in to delete vault");
      }

      if (confirmPhrase !== "DELETE") {
        throw new Error('Must type "DELETE" to confirm');
      }

      setIsLoading(true);
      try {
        // Clear keys from memory if unlocked
        if (state.status === "unlocked") {
          clearKeys(state.keys);
        }

        // Clear from session storage
        clearKeysFromSession(userPubkey);

        // Delete from IndexedDB
        await deleteVaultMetadata(userPubkey);

        setState({ status: "no_vault" });
      } finally {
        setIsLoading(false);
      }
    },
    [userPubkey, state]
  );

  // Encrypt content
  const encrypt = useCallback(
    (plaintext: string): string => {
      if (state.status !== "unlocked") {
        throw new Error("Vault must be unlocked to encrypt");
      }

      const encrypted = encryptContent(plaintext, state.keys.encryptionKey);
      return serializeEncryptedData(encrypted);
    },
    [state]
  );

  // Decrypt content
  const decrypt = useCallback(
    (serialized: string): string => {
      if (state.status !== "unlocked") {
        throw new Error("Vault must be unlocked to decrypt");
      }

      const encrypted = deserializeEncryptedData(serialized);
      return decryptContent(encrypted, state.keys.encryptionKey);
    },
    [state]
  );

  const contextValue: VaultContextType = useMemo(
    () => ({
      state,
      isLoading,
      createVault,
      unlockVault,
      lockVault,
      deleteVault,
      encrypt,
      decrypt,
    }),
    [
      state,
      isLoading,
      createVault,
      unlockVault,
      lockVault,
      deleteVault,
      encrypt,
      decrypt,
    ]
  );

  return (
    <VaultContext.Provider value={contextValue}>
      {children}
    </VaultContext.Provider>
  );
}

// ============================================================================
// Session Storage Helpers
// ============================================================================

/**
 * Save vault keys to sessionStorage for persistence across page refreshes.
 * Keys are stored as hex strings.
 */
function saveKeysToSession(userPubkey: string, keys: VaultKeys): void {
  try {
    const data = {
      signingKey: saltToHex(keys.signingKey),
      encryptionKey: saltToHex(keys.encryptionKey),
    };
    sessionStorage.setItem(
      SESSION_KEYS_PREFIX + userPubkey,
      JSON.stringify(data)
    );
  } catch (error) {
    // sessionStorage might be unavailable in some contexts
    console.warn("[Vault] Could not save keys to sessionStorage:", error);
  }
}

/**
 * Load vault keys from sessionStorage.
 * Returns undefined if not found or invalid.
 */
function loadKeysFromSession(userPubkey: string): VaultKeys | undefined {
  try {
    const stored = sessionStorage.getItem(SESSION_KEYS_PREFIX + userPubkey);
    if (!stored) return undefined;

    const data = JSON.parse(stored);
    if (!data.signingKey || !data.encryptionKey) return undefined;

    return {
      signingKey: hexToSalt(data.signingKey),
      encryptionKey: hexToSalt(data.encryptionKey),
    };
  } catch (error) {
    console.warn("[Vault] Could not load keys from sessionStorage:", error);
    return undefined;
  }
}

/**
 * Clear vault keys from sessionStorage.
 */
function clearKeysFromSession(userPubkey: string): void {
  try {
    sessionStorage.removeItem(SESSION_KEYS_PREFIX + userPubkey);
  } catch (error) {
    console.warn("[Vault] Could not clear keys from sessionStorage:", error);
  }
}
