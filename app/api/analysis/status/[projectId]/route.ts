import { analysisStatusManager } from "@/lib/analysis-status-manager";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * SSE endpoint for real-time analysis status updates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  // Create a ReadableStream for SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;
      let timeoutId: NodeJS.Timeout | null = null;

      // Centralized cleanup function
      const cleanup = (reason: string) => {
        if (isClosed) {
          return; // Already cleaned up
        }
        isClosed = true;

        console.log(`[v0] SSE cleanup for project ${projectId}: ${reason}`);

        // Clear intervals and timeouts
        clearInterval(keepAlive);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Unsubscribe from updates
        unsubscribe();

        // Close controller
        try {
          controller.close();
        } catch (error) {
          // Controller might already be closed, ignore
          console.log(
            `[v0] Controller already closed for project ${projectId}`
          );
        }
      };

      // Send initial connection message
      const initialData = `data: ${JSON.stringify({
        status: "Conectado",
        projectId,
        timestamp: Date.now(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initialData));

      // Subscribe to status updates
      const unsubscribe = analysisStatusManager.subscribe(
        projectId,
        (update) => {
          if (isClosed) {
            return; // Don't send if already closed
          }

          const data = `data: ${JSON.stringify(update)}\n\n`;
          try {
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            console.error("[v0] Error sending SSE data:", error);
            cleanup("enqueue error");
          }
        }
      );

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        if (isClosed) {
          return;
        }

        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch (error) {
          cleanup("keepalive error");
        }
      }, 30000);

      // Cleanup on disconnect
      request.signal.addEventListener("abort", () => {
        cleanup("client disconnected");
      });

      // Auto-cleanup after 10 minutes
      timeoutId = setTimeout(() => {
        cleanup("timeout after 10 minutes");
      }, 600000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
