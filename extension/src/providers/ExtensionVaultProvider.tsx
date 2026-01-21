import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNostrLogin } from "@nostrify/react/login";
import {
  deriveSaltFromPubkey,
  deriveVaultKeys,
  encryptContent,
  decryptContent,
  serializeEncryptedData,
  deserializeEncryptedData,
  type VaultKeys,
} from "@/lib/vaultCrypto";
import { getPublicKey } from "nostr-tools/pure";
import { bytesToHex } from "@noble/hashes/utils.js";

type VaultStatus = "no_vault" | "locked" | "unlocked";

interface VaultState {
  status: VaultStatus;
  vaultPubkey: string | null;
  keys: VaultKeys | null;
}

interface VaultContextType {
  state: VaultState;
  userPubkey: string | null;
  createVault: (passphrase: string) => Promise<void>;
  unlockVault: (passphrase: string) => Promise<void>;
  lockVault: () => void;
  encrypt: (plaintext: string) => string;
  decrypt: (ciphertext: string) => string;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function useExtensionVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useExtensionVault must be used within ExtensionVaultProvider");
  }
  return context;
}

interface ExtensionVaultProviderProps {
  children: React.ReactNode;
}

export const ExtensionVaultProvider: React.FC<ExtensionVaultProviderProps> = ({
  children,
}) => {
  const { logins } = useNostrLogin();
  const [state, setState] = useState<VaultState>({
    status: "no_vault",
    vaultPubkey: null,
    keys: null,
  });

  // Get user pubkey from login
  const login = logins[0];
  const userPubkey = login?.pubkey ?? null;

  // Check vault status when user changes
  useEffect(() => {
    const checkVaultStatus = async () => {
      if (!userPubkey) {
        setState({ status: "no_vault", vaultPubkey: null, keys: null });
        return;
      }

      try {
        // Check if vault exists in chrome.storage.local
        const result = await chrome.storage.local.get(["vaultPubkey"]);
        if (result.vaultPubkey) {
          // Check if vault is unlocked in session storage
          const session = await chrome.storage.session.get(["vaultKeys"]);
          if (session.vaultKeys) {
            // Restore keys from session
            const keys: VaultKeys = {
              signingKey: new Uint8Array(session.vaultKeys.signingKey),
              encryptionKey: new Uint8Array(session.vaultKeys.encryptionKey),
            };
            setState({
              status: "unlocked",
              vaultPubkey: result.vaultPubkey,
              keys,
            });
          } else {
            setState({
              status: "locked",
              vaultPubkey: result.vaultPubkey,
              keys: null,
            });
          }
        }
      } catch (error) {
        console.error("Failed to check vault status:", error);
      }
    };

    checkVaultStatus();
  }, [userPubkey]);

  const createVault = useCallback(
    async (passphrase: string) => {
      if (!userPubkey) {
        throw new Error("User must be logged in to create vault");
      }

      const salt = deriveSaltFromPubkey(userPubkey);
      const keys = deriveVaultKeys(passphrase, salt);
      const vaultPubkey = bytesToHex(getPublicKey(keys.signingKey));

      // Store vault pubkey persistently
      await chrome.storage.local.set({ vaultPubkey });

      // Store keys in session (cleared when browser closes)
      await chrome.storage.session.set({
        vaultKeys: {
          signingKey: Array.from(keys.signingKey),
          encryptionKey: Array.from(keys.encryptionKey),
        },
      });

      setState({
        status: "unlocked",
        vaultPubkey,
        keys,
      });
    },
    [userPubkey]
  );

  const unlockVault = useCallback(
    async (passphrase: string) => {
      if (!userPubkey) {
        throw new Error("User must be logged in to unlock vault");
      }

      const salt = deriveSaltFromPubkey(userPubkey);
      const keys = deriveVaultKeys(passphrase, salt);
      const derivedVaultPubkey = bytesToHex(getPublicKey(keys.signingKey));

      // Verify the derived pubkey matches stored pubkey
      const result = await chrome.storage.local.get(["vaultPubkey"]);
      if (result.vaultPubkey && result.vaultPubkey !== derivedVaultPubkey) {
        throw new Error("Incorrect passphrase");
      }

      // Store in session
      await chrome.storage.session.set({
        vaultKeys: {
          signingKey: Array.from(keys.signingKey),
          encryptionKey: Array.from(keys.encryptionKey),
        },
      });

      // If no vault existed, store the pubkey
      if (!result.vaultPubkey) {
        await chrome.storage.local.set({ vaultPubkey: derivedVaultPubkey });
      }

      setState({
        status: "unlocked",
        vaultPubkey: derivedVaultPubkey,
        keys,
      });
    },
    [userPubkey]
  );

  const lockVault = useCallback(async () => {
    await chrome.storage.session.remove(["vaultKeys"]);
    setState((prev) => ({
      ...prev,
      status: prev.vaultPubkey ? "locked" : "no_vault",
      keys: null,
    }));
  }, []);

  const encrypt = useCallback(
    (plaintext: string): string => {
      if (state.status !== "unlocked" || !state.keys) {
        throw new Error("Vault must be unlocked to encrypt");
      }
      const encrypted = encryptContent(plaintext, state.keys.encryptionKey);
      return serializeEncryptedData(encrypted);
    },
    [state]
  );

  const decrypt = useCallback(
    (ciphertext: string): string => {
      if (state.status !== "unlocked" || !state.keys) {
        throw new Error("Vault must be unlocked to decrypt");
      }
      const encrypted = deserializeEncryptedData(ciphertext);
      return decryptContent(encrypted, state.keys.encryptionKey);
    },
    [state]
  );

  return (
    <VaultContext.Provider
      value={{
        state,
        userPubkey,
        createVault,
        unlockVault,
        lockVault,
        encrypt,
        decrypt,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};
