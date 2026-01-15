/**
 * IndexedDB storage for private vault salt.
 *
 * The salt is stored per-user (keyed by their visible pubkey) and is safe
 * to store persistently - it provides no value without the passphrase.
 *
 * Storage structure:
 * - DB: nostr-vault-{hostname}
 * - Store: "vault"
 * - Key: user's visible pubkey
 * - Value: VaultMetadata (salt + timestamps)
 */

import { openDB, type IDBPDatabase } from "idb";

// Use domain-based naming to avoid conflicts between apps
const getDBName = () => {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "default";
  return `nostr-vault-${hostname}`;
};

const DB_VERSION = 1;
const STORE_NAME = "vault";

/**
 * Metadata stored for each user's vault.
 * The salt is stored as a hex string for easier serialization.
 */
export interface VaultMetadata {
  /** Random salt as hex string (32 bytes = 64 hex chars) */
  saltHex: string;
  /** Unix timestamp when vault was created */
  createdAt: number;
  /** Unix timestamp of last successful unlock */
  lastUnlockedAt: number | null;
}

/**
 * Opens the vault IndexedDB database.
 * Creates the store if it doesn't exist.
 */
async function openDatabase(): Promise<IDBPDatabase> {
  const dbName = getDBName();
  return openDB(dbName, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

/**
 * Checks if a vault exists for the given user.
 *
 * @param userPubkey - The user's visible pubkey (not the vault pubkey)
 * @returns True if vault metadata exists
 */
export async function hasVault(userPubkey: string): Promise<boolean> {
  try {
    const db = await openDatabase();
    const data = await db.get(STORE_NAME, userPubkey);
    return data !== undefined;
  } catch (error) {
    console.error("[VaultStore] Error checking vault existence:", error);
    return false;
  }
}

/**
 * Reads vault metadata from IndexedDB.
 *
 * @param userPubkey - The user's visible pubkey
 * @returns Vault metadata or undefined if not found
 */
export async function readVaultMetadata(
  userPubkey: string
): Promise<VaultMetadata | undefined> {
  try {
    const db = await openDatabase();
    const data = await db.get(STORE_NAME, userPubkey);
    return data as VaultMetadata | undefined;
  } catch (error) {
    console.error("[VaultStore] Error reading vault metadata:", error);
    throw error;
  }
}

/**
 * Writes vault metadata to IndexedDB.
 * Used when creating a new vault or updating last unlock time.
 *
 * @param userPubkey - The user's visible pubkey
 * @param metadata - Vault metadata to store
 */
export async function writeVaultMetadata(
  userPubkey: string,
  metadata: VaultMetadata
): Promise<void> {
  try {
    const db = await openDatabase();
    await db.put(STORE_NAME, metadata, userPubkey);
  } catch (error) {
    console.error("[VaultStore] Error writing vault metadata:", error);
    throw error;
  }
}

/**
 * Updates the last unlocked timestamp.
 * Called on successful vault unlock.
 *
 * @param userPubkey - The user's visible pubkey
 */
export async function updateLastUnlocked(userPubkey: string): Promise<void> {
  try {
    const metadata = await readVaultMetadata(userPubkey);
    if (metadata) {
      metadata.lastUnlockedAt = Math.floor(Date.now() / 1000);
      await writeVaultMetadata(userPubkey, metadata);
    }
  } catch (error) {
    console.error("[VaultStore] Error updating last unlocked:", error);
    // Non-critical, don't throw
  }
}

/**
 * Deletes vault metadata from IndexedDB.
 * Used when user wants to reset their vault.
 *
 * WARNING: This is destructive. All private bookmarks will become
 * inaccessible if the user has forgotten their passphrase.
 *
 * @param userPubkey - The user's visible pubkey
 */
export async function deleteVaultMetadata(userPubkey: string): Promise<void> {
  try {
    const db = await openDatabase();
    await db.delete(STORE_NAME, userPubkey);
  } catch (error) {
    console.error("[VaultStore] Error deleting vault metadata:", error);
    throw error;
  }
}

/**
 * Clears all vault metadata from IndexedDB.
 * Only for development/testing.
 */
export async function clearAllVaults(): Promise<void> {
  try {
    const db = await openDatabase();
    await db.clear(STORE_NAME);
  } catch (error) {
    console.error("[VaultStore] Error clearing all vaults:", error);
    throw error;
  }
}
