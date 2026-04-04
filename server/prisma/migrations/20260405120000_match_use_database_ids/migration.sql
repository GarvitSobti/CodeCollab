-- Match table migration: Convert from Firebase UIDs to database User IDs
-- This migration converts userOneId, userTwoId, and createdByUserId from Firebase UIDs to database UUIDs

-- Step 1: Add temporary columns to store the new database IDs
ALTER TABLE "Match" ADD COLUMN "userOneId_new" TEXT;
ALTER TABLE "Match" ADD COLUMN "userTwoId_new" TEXT;
ALTER TABLE "Match" ADD COLUMN "createdByUserId_new" TEXT;

-- Step 2: Populate the new columns by looking up the database ID from Firebase UID
UPDATE "Match" m
SET "userOneId_new" = u.id
FROM "User" u
WHERE u."firebaseUid" = m."userOneId";

UPDATE "Match" m
SET "userTwoId_new" = u.id
FROM "User" u
WHERE u."firebaseUid" = m."userTwoId";

UPDATE "Match" m
SET "createdByUserId_new" = u.id
FROM "User" u
WHERE u."firebaseUid" = m."createdByUserId";

-- Step 3: Delete any orphaned matches where the user lookup failed
DELETE FROM "Match" WHERE "userOneId_new" IS NULL OR "userTwoId_new" IS NULL OR "createdByUserId_new" IS NULL;

-- Step 4: Drop the unique constraint on the old columns
ALTER TABLE "Match" DROP CONSTRAINT IF EXISTS "Match_userOneId_userTwoId_key";

-- Step 5: Drop the old columns
ALTER TABLE "Match" DROP COLUMN "userOneId";
ALTER TABLE "Match" DROP COLUMN "userTwoId";
ALTER TABLE "Match" DROP COLUMN "createdByUserId";

-- Step 6: Rename new columns to the original names
ALTER TABLE "Match" RENAME COLUMN "userOneId_new" TO "userOneId";
ALTER TABLE "Match" RENAME COLUMN "userTwoId_new" TO "userTwoId";
ALTER TABLE "Match" RENAME COLUMN "createdByUserId_new" TO "createdByUserId";

-- Step 7: Make the columns NOT NULL
ALTER TABLE "Match" ALTER COLUMN "userOneId" SET NOT NULL;
ALTER TABLE "Match" ALTER COLUMN "userTwoId" SET NOT NULL;
ALTER TABLE "Match" ALTER COLUMN "createdByUserId" SET NOT NULL;

-- Step 8: Add the unique constraint back
ALTER TABLE "Match" ADD CONSTRAINT "Match_userOneId_userTwoId_key" UNIQUE ("userOneId", "userTwoId");

-- Step 9: Add foreign key constraints to reference User.id
ALTER TABLE "Match" ADD CONSTRAINT "Match_userOneId_fkey" FOREIGN KEY ("userOneId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_userTwoId_fkey" FOREIGN KEY ("userTwoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
