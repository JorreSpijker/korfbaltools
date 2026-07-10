-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'club_join_requested';
ALTER TYPE "AuditAction" ADD VALUE 'club_join_approved';
ALTER TYPE "AuditAction" ADD VALUE 'club_join_rejected';
ALTER TYPE "AuditAction" ADD VALUE 'club_manager_changed';

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isClubBeheerder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pendingClubId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Club_code_key" ON "Club"("code");

-- CreateIndex
CREATE INDEX "User_pendingClubId_idx" ON "User"("pendingClubId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_pendingClubId_fkey" FOREIGN KEY ("pendingClubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

