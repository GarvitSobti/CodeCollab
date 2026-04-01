-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "projectExperience" JSONB,
ADD COLUMN     "workExperience" JSONB,
ADD COLUMN     "githubScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "githubScoreUpdatedAt" TIMESTAMP(3);
