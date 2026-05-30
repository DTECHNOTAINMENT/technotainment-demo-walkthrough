/**
 * Real PushProvider adapter — Firebase Cloud Messaging (docs/DECISIONS.md §1;
 * APNs for iOS later behind the same port). Selected when FCM_SERVER_KEY is present.
 *
 * Phase 6 real implementation:
 *   // import { getMessaging } from "firebase-admin/messaging";
 *   // send → messaging.send({ token: to, notification: { title, body }, data });
 */
import type { PushProvider } from "./types";

const NOT_IMPL = "fcm push adapter not yet implemented — Phase 6";

export const fcmPush: PushProvider = {
  async send() {
    throw new Error(NOT_IMPL);
  },
};
