ALTER TABLE "UserProfile"
ADD COLUMN "aiScanSnapshot" JSONB,
ADD COLUMN "aiScanSeed" TEXT,
ADD COLUMN "aiScanUpdatedAt" TIMESTAMP(3);
