/**
 * Tax resolver (docs/INTEGRATIONS.md §3). Real Avalara adapter only when
 * AVALARA_LICENSE_KEY is present; otherwise the flat-estimate mock.
 */
import { avalaraTax } from "./avalara";
import { mockTax } from "./mock";

export type { TaxProvider, TaxEstimate } from "./types";

export const tax = process.env.AVALARA_LICENSE_KEY ? avalaraTax : mockTax;
