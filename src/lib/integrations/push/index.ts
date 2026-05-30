/**
 * Push resolver (docs/INTEGRATIONS.md §3). Real FCM adapter only when
 * FCM_SERVER_KEY is present; otherwise the no-op + log mock.
 */
import { fcmPush } from "./fcm";
import { mockPush } from "./mock";

export type { PushProvider, PushMessage } from "./types";

export const push = process.env.FCM_SERVER_KEY ? fcmPush : mockPush;
