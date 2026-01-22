import { useContext } from "react";
import { VaultContext } from "@ext/contexts/VaultContext";

export function useExtensionVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useExtensionVault must be used within ExtensionVaultProvider");
  }
  return context;
}
