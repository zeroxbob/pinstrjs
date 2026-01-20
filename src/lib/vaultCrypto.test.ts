import { describe, it, expect } from "vitest";
import {
  generateSalt,
  deriveSaltFromPubkey,
  deriveVaultKeys,
  encryptContent,
  decryptContent,
  serializeEncryptedData,
  deserializeEncryptedData,
  saltToHex,
  hexToSalt,
  clearKeys,
} from "./vaultCrypto";

describe("vaultCrypto", () => {
  describe("generateSalt", () => {
    it("generates 32-byte salt", () => {
      const salt = generateSalt();
      expect(salt).toBeInstanceOf(Uint8Array);
      expect(salt.length).toBe(32);
    });

    it("generates unique salts", () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(saltToHex(salt1)).not.toBe(saltToHex(salt2));
    });
  });

  describe("deriveSaltFromPubkey", () => {
    it("derives 32-byte salt from pubkey", () => {
      const pubkey = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const salt = deriveSaltFromPubkey(pubkey);
      expect(salt).toBeInstanceOf(Uint8Array);
      expect(salt.length).toBe(32);
    });

    it("derives consistent salt for same pubkey", () => {
      const pubkey = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      const salt1 = deriveSaltFromPubkey(pubkey);
      const salt2 = deriveSaltFromPubkey(pubkey);
      expect(saltToHex(salt1)).toBe(saltToHex(salt2));
    });

    it("derives different salts for different pubkeys", () => {
      const pubkey1 = "1111111111111111111111111111111111111111111111111111111111111111";
      const pubkey2 = "2222222222222222222222222222222222222222222222222222222222222222";
      const salt1 = deriveSaltFromPubkey(pubkey1);
      const salt2 = deriveSaltFromPubkey(pubkey2);
      expect(saltToHex(salt1)).not.toBe(saltToHex(salt2));
    });

    it("enables deterministic vault key derivation", { timeout: 10000 }, () => {
      const pubkey = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
      const passphrase = "my-secret-passphrase";

      // Simulate vault creation and later recovery
      const salt1 = deriveSaltFromPubkey(pubkey);
      const keys1 = deriveVaultKeys(passphrase, salt1);

      // On a different device, derive again
      const salt2 = deriveSaltFromPubkey(pubkey);
      const keys2 = deriveVaultKeys(passphrase, salt2);

      // Keys should be identical
      expect(saltToHex(keys1.signingKey)).toBe(saltToHex(keys2.signingKey));
      expect(saltToHex(keys1.encryptionKey)).toBe(saltToHex(keys2.encryptionKey));
    });
  });

  describe("deriveVaultKeys", () => {
    it("derives 32-byte keys from passphrase and salt", () => {
      const salt = generateSalt();
      const keys = deriveVaultKeys("test-passphrase", salt);

      expect(keys.signingKey).toBeInstanceOf(Uint8Array);
      expect(keys.signingKey.length).toBe(32);
      expect(keys.encryptionKey).toBeInstanceOf(Uint8Array);
      expect(keys.encryptionKey.length).toBe(32);
    });

    it("derives different keys for different passphrases", () => {
      const salt = generateSalt();
      const keys1 = deriveVaultKeys("passphrase-one", salt);
      const keys2 = deriveVaultKeys("passphrase-two", salt);

      expect(saltToHex(keys1.signingKey)).not.toBe(saltToHex(keys2.signingKey));
      expect(saltToHex(keys1.encryptionKey)).not.toBe(
        saltToHex(keys2.encryptionKey)
      );
    });

    it("derives different keys for different salts", () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      const keys1 = deriveVaultKeys("same-passphrase", salt1);
      const keys2 = deriveVaultKeys("same-passphrase", salt2);

      expect(saltToHex(keys1.signingKey)).not.toBe(saltToHex(keys2.signingKey));
    });

    it("derives consistent keys for same inputs", () => {
      const salt = generateSalt();
      const keys1 = deriveVaultKeys("consistent-passphrase", salt);
      const keys2 = deriveVaultKeys("consistent-passphrase", salt);

      expect(saltToHex(keys1.signingKey)).toBe(saltToHex(keys2.signingKey));
      expect(saltToHex(keys1.encryptionKey)).toBe(
        saltToHex(keys2.encryptionKey)
      );
    });
  });

  describe("encryption and decryption", () => {
    it("encrypts and decrypts content correctly", () => {
      const salt = generateSalt();
      const keys = deriveVaultKeys("encryption-test", salt);
      const plaintext = "Hello, private bookmark!";

      const encrypted = encryptContent(plaintext, keys.encryptionKey);
      const decrypted = decryptContent(encrypted, keys.encryptionKey);

      expect(decrypted).toBe(plaintext);
    });

    it("encrypts to different ciphertext each time (unique nonce)", () => {
      const salt = generateSalt();
      const keys = deriveVaultKeys("nonce-test", salt);
      const plaintext = "Same content";

      const encrypted1 = encryptContent(plaintext, keys.encryptionKey);
      const encrypted2 = encryptContent(plaintext, keys.encryptionKey);

      expect(saltToHex(encrypted1.ciphertext)).not.toBe(
        saltToHex(encrypted2.ciphertext)
      );
    });

    it("fails to decrypt with wrong key", () => {
      const salt = generateSalt();
      const keys1 = deriveVaultKeys("correct-key", salt);
      const keys2 = deriveVaultKeys("wrong-key", salt);
      const plaintext = "Secret content";

      const encrypted = encryptContent(plaintext, keys1.encryptionKey);

      expect(() => {
        decryptContent(encrypted, keys2.encryptionKey);
      }).toThrow();
    });

    it("handles unicode content", () => {
      const salt = generateSalt();
      const keys = deriveVaultKeys("unicode-test", salt);
      const plaintext = "Hello \ud83d\udc4b \u4e16\u754c \ud83c\udf0d \u0645\u0631\u062d\u0628\u0627";

      const encrypted = encryptContent(plaintext, keys.encryptionKey);
      const decrypted = decryptContent(encrypted, keys.encryptionKey);

      expect(decrypted).toBe(plaintext);
    });

    it("handles large content", () => {
      const salt = generateSalt();
      const keys = deriveVaultKeys("large-content-test", salt);
      const plaintext = "x".repeat(100000);

      const encrypted = encryptContent(plaintext, keys.encryptionKey);
      const decrypted = decryptContent(encrypted, keys.encryptionKey);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe("serialization", () => {
    it("serializes and deserializes encrypted data", () => {
      const salt = generateSalt();
      const keys = deriveVaultKeys("serialize-test", salt);
      const plaintext = "Data to serialize";

      const encrypted = encryptContent(plaintext, keys.encryptionKey);
      const serialized = serializeEncryptedData(encrypted);
      const deserialized = deserializeEncryptedData(serialized);

      expect(saltToHex(deserialized.nonce)).toBe(saltToHex(encrypted.nonce));
      expect(saltToHex(deserialized.ciphertext)).toBe(
        saltToHex(encrypted.ciphertext)
      );

      // Verify it can still be decrypted
      const decrypted = decryptContent(deserialized, keys.encryptionKey);
      expect(decrypted).toBe(plaintext);
    });

    it("throws on invalid serialized format", () => {
      expect(() => deserializeEncryptedData("invalid")).toThrow();
      expect(() => deserializeEncryptedData("")).toThrow();
    });
  });

  describe("salt conversion", () => {
    it("converts salt to hex and back", () => {
      const original = generateSalt();
      const hex = saltToHex(original);
      const restored = hexToSalt(hex);

      expect(saltToHex(restored)).toBe(saltToHex(original));
    });
  });

  describe("clearKeys", () => {
    it("zeros out key material", () => {
      const salt = generateSalt();
      const keys = deriveVaultKeys("clear-test", salt);

      // Verify keys have data
      expect(keys.signingKey.some((b) => b !== 0)).toBe(true);
      expect(keys.encryptionKey.some((b) => b !== 0)).toBe(true);

      clearKeys(keys);

      // Verify keys are zeroed
      expect(keys.signingKey.every((b) => b === 0)).toBe(true);
      expect(keys.encryptionKey.every((b) => b === 0)).toBe(true);
    });
  });
});
