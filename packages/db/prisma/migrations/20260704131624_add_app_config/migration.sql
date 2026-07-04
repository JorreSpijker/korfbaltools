-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'app_config_changed';

-- CreateTable
CREATE TABLE "AppConfig" (
    "capability" "Capability" NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("capability")
);
