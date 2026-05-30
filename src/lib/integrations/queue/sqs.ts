/**
 * Real QueueProvider adapter — AWS SQS (docs/INFRASTRUCTURE.md). Selected when
 * AWS_SQS_QUEUE_URL is present (with AWS_REGION / IAM credentials).
 *
 * Phase 6 real implementation:
 *   // import { SQSClient, SendMessageCommand, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
 *   // enqueue → SendMessageCommand; process → long-poll ReceiveMessageCommand loop (a worker).
 */
import type { QueueHandler, QueueProvider } from "./types";

const NOT_IMPL = "aws sqs queue adapter not yet implemented — Phase 6";

export const sqsQueue: QueueProvider = {
  async enqueue() {
    throw new Error(NOT_IMPL);
  },
  async process<T>(_type: string, _handler: QueueHandler<T>) {
    throw new Error(NOT_IMPL);
  },
};
