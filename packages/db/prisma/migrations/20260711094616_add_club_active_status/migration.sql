-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'club_activated';
ALTER TYPE "AuditAction" ADD VALUE 'club_deactivated';

-- DropForeignKey
ALTER TABLE "VastspelenAppearance" DROP CONSTRAINT "VastspelenAppearance_gespeeldInTeamId_fkey";

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "VastspelenAppearance" ADD CONSTRAINT "VastspelenAppearance_gespeeldInTeamId_fkey" FOREIGN KEY ("gespeeldInTeamId") REFERENCES "VastspelenTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
