import React, { useRef } from "react";
import { NostrEvent, NostrFilter, NPool, NRelay1 } from "@nostrify/nostrify";
import { NostrContext } from "@nostrify/react";

interface ExtensionNostrProviderProps {
  children: React.ReactNode;
}

// Default relays for the extension
const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://nos.lol",
  "wss://relay.snort.social",
];

export const ExtensionNostrProvider: React.FC<ExtensionNostrProviderProps> = ({
  children,
}) => {
  const pool = useRef<NPool | undefined>(undefined);

  if (!pool.current) {
    pool.current = new NPool({
      open(url: string) {
        return new NRelay1(url);
      },
      reqRouter(filters: NostrFilter[]) {
        const routes = new Map<string, NostrFilter[]>();
        for (const url of DEFAULT_RELAYS) {
          routes.set(url, filters);
        }
        return routes;
      },
      eventRouter(_event: NostrEvent) {
        return DEFAULT_RELAYS;
      },
    });
  }

  return (
    <NostrContext.Provider value={{ nostr: pool.current }}>
      {children}
    </NostrContext.Provider>
  );
};
