import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NostrLoginProvider } from "@nostrify/react/login";
import { Popup } from "./Popup";
import { ExtensionNostrProvider } from "@ext/providers/ExtensionNostrProvider";
import { ExtensionVaultProvider } from "@ext/providers/ExtensionVaultProvider";
import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NostrLoginProvider storageKey="pinstr-extension-logins">
        <ExtensionNostrProvider>
          <ExtensionVaultProvider>
            <Popup />
          </ExtensionVaultProvider>
        </ExtensionNostrProvider>
      </NostrLoginProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
