/**
 * Centralized Real-Time Event Architecture for Leadjen Media
 * Server -> Real-Time Event -> Connected Clients
 */

export type RealtimeEventType =
  | "BREAKING_UPDATE"
  | "LIVE_UPDATE"
  | "LIVE_COVERAGE_UPDATE"
  | "ARTICLE_PUBLISHED"
  | "HOMEPAGE_SYNC";

export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  payload: any;
  timestamp: string;
}

// In-memory client controller registry for SSE connections
declare global {
  var __realtimeClients: Set<ReadableStreamDefaultController> | undefined;
  var __realtimeEventHistory: RealtimeEvent[] | undefined;
}

const clients: Set<ReadableStreamDefaultController> =
  global.__realtimeClients || (global.__realtimeClients = new Set());

const eventHistory: RealtimeEvent[] =
  global.__realtimeEventHistory || (global.__realtimeEventHistory = []);

const MAX_HISTORY = 50;

/**
 * Register a new active SSE client stream controller
 */
export function addRealtimeClient(controller: ReadableStreamDefaultController) {
  clients.add(controller);
}

/**
 * Remove an active client when connection closes
 */
export function removeRealtimeClient(controller: ReadableStreamDefaultController) {
  clients.delete(controller);
}

/**
 * Get recent event history for reconnecting clients
 */
export function getRecentEvents(sinceTimestamp?: string): RealtimeEvent[] {
  if (!sinceTimestamp) return eventHistory.slice(-10);
  const since = new Date(sinceTimestamp).getTime();
  return eventHistory.filter((e) => new Date(e.timestamp).getTime() > since);
}

/**
 * Broadcast an event to all connected public & admin SSE client streams
 */
export function broadcastRealtimeEvent(type: RealtimeEventType, payload: any) {
  const event: RealtimeEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  // Add to history buffer
  eventHistory.push(event);
  if (eventHistory.length > MAX_HISTORY) {
    eventHistory.shift();
  }

  const encodedData = `id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
  const encoder = new TextEncoder();
  const bytes = encoder.encode(encodedData);

  // Send to all active SSE client streams
  clients.forEach((controller) => {
    try {
      controller.enqueue(bytes);
    } catch {
      clients.delete(controller);
    }
  });

  return event;
}
