/**
 * Queue resolver (docs/INTEGRATIONS.md §3). Real AWS SQS adapter only when
 * AWS_SQS_QUEUE_URL is present; otherwise the in-memory mock.
 */
import { mockQueue } from "./mock";
import { sqsQueue } from "./sqs";

export type { QueueProvider, QueueMessage, QueueHandler } from "./types";

export const queue = process.env.AWS_SQS_QUEUE_URL ? sqsQueue : mockQueue;
