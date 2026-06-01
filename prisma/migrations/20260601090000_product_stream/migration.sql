-- AlterTable: per-stream commerce — a Product (drop) can be tied to a specific live stream
ALTER TABLE "Product" ADD COLUMN "streamId" TEXT;

-- CreateIndex
CREATE INDEX "Product_streamId_idx" ON "Product"("streamId");
