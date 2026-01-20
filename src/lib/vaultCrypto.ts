/**
 * Quantum-resistant encryption utilities for private vault.
 *
 * Uses Argon2id for key derivation and AES-256-GCM for encryption.
 * These are symmetric encryption methods that remain secure against
 * quantum computers (unlike elliptic curve cryptography).
 *
 * Security model:
 * - Passphrase + deterministic salt (derived from npub) → Argon2id → 64 bytes
 * - First 32 bytes: Nostr signing key (for vault identity)
 * - Second 32 bytes: AES-256 encryption key (for content)
 * - Salt is derived from user's npub, enabling recovery on any device
 * - Passphrase is never stored
 */

import { argon2id } from "@noble/hashes/argon2.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { gcm } from "@noble/ciphers/aes.js";
import { randomBytes } from "@noble/ciphers/utils.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

/**
 * Argon2id parameters.
 * These are conservative settings balancing security and UX.
 * - t (iterations): 3
 * - m (memory): 65536 KiB (64 MB)
 * - p (parallelism): 4
 *
 * On a modern device, this takes ~0.5-1 second.
 * Provides strong resistance against brute-force attacks.
 */
const ARGON2_PARAMS = {
  t: 3,
  m: 65536,
  p: 4,
  dkLen: 64, // 64 bytes: 32 for signing + 32 for encryption
} as const;

/**
 * Salt length in bytes.
 * 32 bytes = 256 bits, providing ample uniqueness.
 */
const SALT_LENGTH = 32;

/**
 * AES-GCM nonce length in bytes.
 * 12 bytes (96 bits) is the recommended size for GCM.
 */
const NONCE_LENGTH = 12;

export interface VaultKeys {
  /** 32-byte private key for signing Nostr events */
  signingKey: Uint8Array;
  /** 32-byte key for AES-256-GCM encryption */
  encryptionKey: Uint8Array;
}

export interface EncryptedData {
  /** 12-byte nonce (must be unique per encryption) */
  nonce: Uint8Array;
  /** Ciphertext with authentication tag appended */
  ciphertext: Uint8Array;
}

/**
 * Domain separator for salt derivation.
 * Changing this would create a new, incompatible vault identity.
 */
const SALT_DOMAIN = "pinstr-vault-v1";

/**
 * Derives a deterministic salt from a user's public key.
 * This enables vault recovery on any device with just npub + passphrase.
 *
 * @param pubkey - The user's Nostr public key (hex format)
 * @returns 32-byte deterministic salt
 *
 * @security The salt is derived using SHA-256 with a domain separator.
 * This ensures the salt is unique per user and per application.
 * An attacker who knows the npub still cannot derive vault keys without
 * the passphrase, and Argon2id makes brute-forcing expensive.
 */
export function deriveSaltFromPubkey(pubkey: string): Uint8Array {
  const input = `${SALT_DOMAIN}:${pubkey}`;
  return sha256(new TextEncoder().encode(input));
}

/**
 * Generates a cryptographically secure random salt.
 * @deprecated Use deriveSaltFromPubkey for deterministic, recoverable vaults.
 */
export function generateSalt(): Uint8Array {
  return randomBytes(SALT_LENGTH);
}

/**
 * Derives vault keys from a passphrase and salt using Argon2id.
 *
 * @param passphrase - User's passphrase (should be strong)
 * @param salt - Salt derived from user's pubkey via deriveSaltFromPubkey()
 * @returns Signing key and encryption key
 *
 * @security The passphrase should never be stored. The salt is derived
 * deterministically from the user's npub, enabling recovery on any device.
 * Even with the npub (public) and salt (derivable), the passphrase is
 * required to derive the vault keys. Argon2id makes brute-forcing expensive.
 */
export function deriveVaultKeys(
  passphrase: string,
  salt: Uint8Array
): VaultKeys {
  const passphraseBytes = new TextEncoder().encode(passphrase);

  const keyMaterial = argon2id(passphraseBytes, salt, ARGON2_PARAMS);

  return {
    signingKey: keyMaterial.slice(0, 32),
    encryptionKey: keyMaterial.slice(32, 64),
  };
}

/**
 * Encrypts plaintext using AES-256-GCM.
 *
 * @param plaintext - Content to encrypt
 * @param encryptionKey - 32-byte key from deriveVaultKeys
 * @returns Nonce and ciphertext (both needed for decryption)
 *
 * @security A fresh random nonce is generated for each encryption.
 * Never reuse a nonce with the same key.
 */
export function encryptContent(
  plaintext: string,
  encryptionKey: Uint8Array
): EncryptedData {
  const nonce = randomBytes(NONCE_LENGTH);
  const plaintextBytes = new TextEncoder().encode(plaintext);

  const aes = gcm(encryptionKey, nonce);
  const ciphertext = aes.encrypt(plaintextBytes);

  return { nonce, ciphertext };
}

/**
 * Decrypts ciphertext using AES-256-GCM.
 *
 * @param encryptedData - Nonce and ciphertext from encryptContent
 * @param encryptionKey - 32-byte key from deriveVaultKeys
 * @returns Decrypted plaintext
 * @throws Error if decryption fails (wrong key or tampered data)
 *
 * @security GCM provides authenticated encryption. If the ciphertext
 * has been tampered with or the key is wrong, decryption will fail.
 */
export function decryptContent(
  encryptedData: EncryptedData,
  encryptionKey: Uint8Array
): string {
  const { nonce, ciphertext } = encryptedData;

  const aes = gcm(encryptionKey, nonce);
  const plaintextBytes = aes.decrypt(ciphertext);

  return new TextDecoder().decode(plaintextBytes);
}

/**
 * Serializes encrypted data to a string for storage in Nostr event content.
 * Format: hex(nonce) + ":" + hex(ciphertext)
 */
export function serializeEncryptedData(data: EncryptedData): string {
  return `${bytesToHex(data.nonce)}:${bytesToHex(data.ciphertext)}`;
}

/**
 * Deserializes encrypted data from a Nostr event content string.
 */
export function deserializeEncryptedData(serialized: string): EncryptedData {
  const [nonceHex, ciphertextHex] = serialized.split(":");
  if (!nonceHex || !ciphertextHex) {
    throw new Error("Invalid encrypted data format");
  }
  return {
    nonce: hexToBytes(nonceHex),
    ciphertext: hexToBytes(ciphertextHex),
  };
}

/**
 * Converts a salt to hex string for storage.
 */
export function saltToHex(salt: Uint8Array): string {
  return bytesToHex(salt);
}

/**
 * Converts a hex string back to salt bytes.
 */
export function hexToSalt(hex: string): Uint8Array {
  return hexToBytes(hex);
}

/**
 * Clears sensitive data from memory.
 * Call this when vault is locked or on logout.
 *
 * @security This provides defense-in-depth but JavaScript doesn't guarantee
 * immediate memory clearing. The GC may retain copies.
 */
export function clearKeys(keys: VaultKeys): void {
  keys.signingKey.fill(0);
  keys.encryptionKey.fill(0);
}
