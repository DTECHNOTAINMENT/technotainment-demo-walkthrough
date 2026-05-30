/**
 * Risk resolver (docs/INTEGRATIONS.md §3). Real Sift adapter only when
 * SIFT_API_KEY is present; otherwise the always-"low" mock.
 */
import { mockRisk } from "./mock";
import { siftRisk } from "./sift";

export type { RiskProvider, RiskLevel, RiskScore } from "./types";

export const risk = process.env.SIFT_API_KEY ? siftRisk : mockRisk;
