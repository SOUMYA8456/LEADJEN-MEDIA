"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RealtimeEventType, RealtimeEvent } from "@/lib/realtime";

export type ConnectionStatus = "connected" | "reconnecting" | "offline";

interface UseRealtimeOptions {
  eventTypes?: RealtimeEventType[];
  onEvent?: (event: RealtimeEvent) => void;
  fallbackPollInterval?: number; // default 8000ms
  enablePollingFallback?: boolean;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    eventTypes = [],
    onEvent,
    fallbackPollInterval = 8000,
    enablePollingFallback = true,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>("reconnecting");
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const processedEventIds = useRef<Set<string>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const handleIncomingEvent = useCallback((event: RealtimeEvent) => {
    if (!event || !event.id) return;

    // Prevent duplicate event processing
    if (processedEventIds.current.has(event.id)) {
      return;
    }

    processedEventIds.current.add(event.id);
    if (processedEventIds.current.size > 200) {
      const arr = Array.from(processedEventIds.current);
      processedEventIds.current = new Set(arr.slice(-100));
    }

    setLastEvent(event);
    if (onEventRef.current) {
      onEventRef.current(event);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    function connectSSE() {
      if (typeof window === "undefined") return;

      try {
        const es = new EventSource("/api/realtime/stream");
        eventSourceRef.current = es;

        es.onopen = () => {
          if (isMounted) setStatus("connected");
        };

        es.onerror = () => {
          if (isMounted) {
            setStatus("reconnecting");
            es.close();

            // Reconnect with exponential backoff (2.5s)
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMounted) connectSSE();
            }, 2500);
          }
        };

        // Listen for specific event types
        const typesToListen: RealtimeEventType[] =
          eventTypes.length > 0
            ? eventTypes
            : [
                "BREAKING_UPDATE",
                "LIVE_UPDATE",
                "LIVE_COVERAGE_UPDATE",
                "ARTICLE_PUBLISHED",
                "HOMEPAGE_SYNC",
              ];

        typesToListen.forEach((type) => {
          es.addEventListener(type, (e: MessageEvent) => {
            try {
              const data: RealtimeEvent = JSON.parse(e.data);
              handleIncomingEvent(data);
            } catch {}
          });
        });

        // Also listen on general message
        es.onmessage = (e: MessageEvent) => {
          try {
            const data: RealtimeEvent = JSON.parse(e.data);
            handleIncomingEvent(data);
          } catch {}
        };
      } catch (err) {
        if (isMounted) setStatus("offline");
      }
    }

    connectSSE();

    return () => {
      isMounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [handleIncomingEvent, eventTypes]);

  return {
    status,
    lastEvent,
  };
}
