"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import {
  resolveInternalToPublic,
  type PublicPathMaps,
} from "@/lib/public-paths";

interface PublicPathsContextValue {
  toPublicPath: (internalPath: string) => string;
}

const PublicPathsContext = createContext<PublicPathsContextValue | null>(null);

export function PublicPathsProvider({
  maps,
  children,
}: {
  maps: PublicPathMaps;
  children: React.ReactNode;
}) {
  const toPublicPath = useCallback(
    (internalPath: string) => resolveInternalToPublic(internalPath, maps),
    [maps]
  );

  const value = useMemo(() => ({ toPublicPath }), [toPublicPath]);

  return (
    <PublicPathsContext.Provider value={value}>{children}</PublicPathsContext.Provider>
  );
}

export function usePublicPath(internalPath: string): string {
  const ctx = useContext(PublicPathsContext);
  if (!ctx) return internalPath;
  return ctx.toPublicPath(internalPath);
}

export function usePublicPaths() {
  const ctx = useContext(PublicPathsContext);
  if (!ctx) {
    return { toPublicPath: (internalPath: string) => internalPath };
  }
  return ctx;
}
