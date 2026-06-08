"use client";

import { useEffect, useRef } from "react";

const HMR_RECONNECT_MS = 1500;
const RELOAD_COOLDOWN_MS = 5000;

export function DevAutoReload() {
  const lastReloadAtRef = useRef(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let activeSocket: WebSocket | undefined;

    const connect = () => {
      const { protocol, host } = window.location;
      const wsProtocol = protocol === "https:" ? "wss:" : "ws:";
      activeSocket = new WebSocket(`${wsProtocol}//${host}/_next/webpack-hmr`);

      activeSocket.onmessage = (event) => {
        if (typeof event.data !== "string") return;
        // Only reload after a finished compilation — never on initial HMR "sync"
        // (sync fires on every connect and caused infinite reload loops).
        if (!event.data.includes('"action":"built"')) return;

        const now = Date.now();
        if (now - lastReloadAtRef.current < RELOAD_COOLDOWN_MS) return;

        try {
          const novaOpen = sessionStorage.getItem("fgs-nova-chat-open") === "1";
          const novaDraft = sessionStorage.getItem("fgs-nova-chat-draft")?.trim();
          if (novaOpen || novaDraft) return;
        } catch {
          /* ignore */
        }

        lastReloadAtRef.current = now;
        window.location.reload();
      };

      activeSocket.onclose = () => {
        reconnectTimer = setTimeout(connect, HMR_RECONNECT_MS);
      };

      activeSocket.onerror = () => activeSocket?.close();
    };

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      activeSocket?.close();
    };
  }, []);

  return null;
}
