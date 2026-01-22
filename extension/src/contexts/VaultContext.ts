import { createContext } from "react";
import type { VaultKeys } from "@/lib/vaultCrypto";

type VaultStatus = "no_vault" | "locked" | "unlocked";

interface VaultState {
  status: VaultStatus;
  vaultPubkey: string | null;
  keys: VaultKeys | null;
}

export interface VaultContextType {
  state: VaultState;
  userPubkey: string | null;
  createVault: (passphrase: string) => Promise<void>;
  unlockVault: (passphrase: string) => Promise<void>;
  lockVault: () => void;
  encrypt: (plaintext: string) => string;
  decrypt: (ciphertext: string) => string;
}

export const VaultContext = createContext<VaultContextType | null>(null);
