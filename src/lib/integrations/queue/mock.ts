/**
 * Mock QueueProvider — in-memory queue (docs/INTEGRATIONS.md §1 mock-first).
 * No SQS needed: enqueue appends to a per-type buffer; process drains it (and any
 * future enqueues are delivered to the registered handler). Deterministic ids.
 */
import { mockId } from "../_shared/mockId";
import type { QueueHandler, QueueMessage, QueueProvider } from "./types";

/** Pending messages per type, until a handler is registered. */
const buffers = new Map<string, QueueMessage[]>();
/** Live handlers per type. */
const handlers = new Map<string, QueueHandler>();

export const mockQueue: QueueProvider = {
  async enqueue({ type, payload }) {
    const id = mockId("job", `${type}:${JSON.stringify(payload)}`);
    const message: QueueMessage = { id, type, payload };
    const handler = handlers.get(type);
    if (handler) {
      // Deliver on the next tick so enqueue stays non-blocking.
      setTimeout(() => void handler(message), 0);
    } else {
      const buf = buffers.get(type) ?? [];
      buf.push(message);
      buffers.set(type, buf);
    }
    return { id };
  },

  async process<T>(type: string, handler: QueueHandler<T>) {
    handlers.set(type, handler as QueueHandler);
    // Drain anything enqueued before the handler existed.
    const pending = buffers.get(type) ?? [];
    buffers.delete(type);
    for (const message of pending) {
      await (handler as QueueHandler)(message);
    }
  },
};
