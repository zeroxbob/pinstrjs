import { useEffect } from "react";
import { useNostrLogin } from "@nostrify/react/login";
import { Nip07ProxySigner } from "@ext/lib/nip07Proxy";

/**
 * Checks for pending NIP-07 logins from the web app and processes them.
 */
export function PendingLoginHandler({ children }: { children: React.ReactNode }) {
  const { addLogin } = useNostrLogin();

  useEffect(() => {
    // Check for pending login on mount
    const checkPendingLogin = async () => {
      const result = await chrome.storage.local.get("pendingLogin");

      if (result.pendingLogin?.pubkey) {
        const { pubkey, timestamp } = result.pendingLogin;

        // Only process if less than 1 minute old
        if (Date.now() - timestamp < 60000) {
          try {
            const signer = new Nip07ProxySigner(pubkey);

            // Create a custom login object
            const login = {
              id: `nip07-${pubkey}`,
              type: "nip07" as const,
              pubkey,
              signer,
            };

            addLogin(login);
          } catch (error) {
            console.error("Failed to process pending login:", error);
          }
        }

        // Clear the pending login
        await chrome.storage.local.remove("pendingLogin");
      }
    };

    checkPendingLogin();

    // Also listen for storage changes (in case another window processes it)
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === "local" && changes.pendingLogin?.newValue) {
        checkPendingLogin();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [addLogin]);

  return <>{children}</>;
}
