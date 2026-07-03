-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "refId" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "addressName" TEXT,
ADD COLUMN     "addressType" TEXT,
ADD COLUMN     "addressDescription" TEXT,
ADD COLUMN     "streetName" TEXT,
ADD COLUMN     "addressNumber" INTEGER,
ADD COLUMN     "addressNumberAppendix" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "veldPoolName" TEXT,
ADD COLUMN     "veldPoolId" INTEGER,
ADD COLUMN     "zaalPoolName" TEXT,
ADD COLUMN     "zaalPoolId" INTEGER,
ADD COLUMN     "clusterId" TEXT,
ADD COLUMN     "clusterName" TEXT,
ADD COLUMN     "regioId" INTEGER,
ADD COLUMN     "regioName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Club_refId_key" ON "Club"("refId");
