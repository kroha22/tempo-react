"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpError } from "@/shared/http/request-json";

export function isAccessError(error: unknown) {
  return error instanceof HttpError && (error.status === 401 || error.status === 403);
}

export type QueryScope = {
  client: QueryClient;
  scopeKey: string;
  blocked: boolean;
  isActive: () => boolean;
  controller: AbortController;
  retryAccess: () => void;
};
const Context = createContext<QueryScope | null>(null);

/** scopeKey is an opaque auth-generation token, never a database user ID.
 * Until an auth adapter supplies it, cache lifetime is limited to this mount. */
export function SessionQueryBoundary({ children, scopeKey = "screen" }: { children: ReactNode; scopeKey?: string }) {
  return <CacheOwner key={scopeKey} scopeKey={scopeKey}>{children}</CacheOwner>;
}

function CacheOwner({ children, scopeKey }: { children: ReactNode; scopeKey: string }) {
  const [access, setAccess] = useState({ revision: 0, blocked: false });
  function denyAccess() {
    setAccess((current) => current.revision === access.revision && !current.blocked
      ? { revision: current.revision + 1, blocked: true } : current);
  }
  return <CacheInstance key={access.revision} scopeKey={`${scopeKey}:${access.revision}`} blocked={access.blocked}
    denyAccess={denyAccess} retryAccess={() => setAccess((current) => ({ revision: current.revision + 1, blocked: false }))}>
    {children}
  </CacheInstance>;
}

function CacheInstance({ children, scopeKey, blocked, denyAccess, retryAccess }: {
  children: ReactNode; scopeKey: string; blocked: boolean; denyAccess: () => void; retryAccess: () => void;
}) {
  const lifecycle = useRef({ active: true, version: 0 });
  const [scope] = useState<QueryScope>(() => {
    const onError = (error: unknown) => { if (isAccessError(error)) denyAccess(); };
    return {
      scopeKey, blocked, isActive: () => lifecycle.current.active, controller: new AbortController(), retryAccess,
      client: new QueryClient({
        queryCache: new QueryCache({ onError }), mutationCache: new MutationCache({ onError }),
        defaultOptions: {
          queries: { staleTime: 30_000, gcTime: 300_000, retry: false, networkMode: "always" },
          mutations: { retry: false, networkMode: "always" },
        },
      }),
    };
  });
  useEffect(() => {
    const lifetime = lifecycle.current;
    lifetime.active = true;
    const version = ++lifetime.version;
    return () => {
      lifetime.active = false;
      // StrictMode's immediate setup/cleanup cycle must not destroy its live client.
      queueMicrotask(() => {
        if (version !== lifetime.version) return;
        scope.controller.abort();
        scope.client.clear();
      });
    };
  }, [scope]);
  return <Context.Provider value={scope}><QueryClientProvider client={scope.client}>{children}</QueryClientProvider></Context.Provider>;
}

export function useQueryScope() {
  const scope = useContext(Context);
  if (!scope) throw new Error("Queries require SessionQueryBoundary");
  return scope;
}

/** Screens may own a scope or participate in an explicitly composed boundary. */
export function EnsureQueryScope({ children }: { children: ReactNode }) {
  const scope = useContext(Context);
  return scope ? children : <SessionQueryBoundary>{children}</SessionQueryBoundary>;
}
