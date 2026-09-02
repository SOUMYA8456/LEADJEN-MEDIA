import { NextRequest } from "next/server";
import { addRealtimeClient, removeRealtimeClient } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  let clientController: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(controller) {
      clientController = controller;
      addRealtimeClient(controller);

      // Send initial connection handshake
      const initialHandshake = `event: INITIAL_SYNC\ndata: ${JSON.stringify({
        status: "connected",
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initialHandshake));
    },
    cancel() {
      if (clientController) {
        removeRealtimeClient(clientController);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
