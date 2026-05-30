-- Replace the ref index with a (ref, kind) unique constraint (ledger idempotency).
DROP INDEX IF EXISTS "WalletEntry_ref_idx";
CREATE UNIQUE INDEX "WalletEntry_ref_kind_key" ON "WalletEntry"("ref", "kind");
