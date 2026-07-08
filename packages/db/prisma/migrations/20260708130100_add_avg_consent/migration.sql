-- AlterTable
-- No backfill: null correctly reflects that consent wasn't collected before
-- this feature existed, for users who registered before it shipped.
ALTER TABLE "User" ADD COLUMN "consentedAt" TIMESTAMP(3);
