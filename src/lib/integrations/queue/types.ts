/**
 * QueueProvider port — async jobs (docs/INFRASTRUCTURE.md; .env.example
 * AWS_SQS_QUEUE_URL). Real provider: AWS SQS. Used for background work like
 * webhook fan-out, payout runs, media post-processing.
 */

export interface QueueMessage<T = unknown> {
  id: string;
  type: string;
  payload: T;
}

export type QueueHandler<T = unknown> = (message: QueueMessage<T>) => Promise<void>;

export interface QueueProvider {
  /** Enqueue a job. Returns the message id. */
  enqueue<T>(input: { type: string; payload: T }): Promise<{ id: string }>;
  /** Register a handler that drains queued messages of a given type. */
  process<T>(type: string, handler: QueueHandler<T>): Promise<void>;
}
