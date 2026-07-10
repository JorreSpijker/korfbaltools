-- AlterEnum
ALTER TYPE "Capability" ADD VALUE 'vastspelen';

-- CreateEnum
CREATE TYPE "Seizoensdeel" AS ENUM ('veld', 'zaal');

-- CreateTable
CREATE TABLE "VastspelenTeam" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "niveau" INTEGER NOT NULL,
    "categorie" TEXT NOT NULL DEFAULT 'A',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VastspelenTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VastspelenPlayer" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "geboortedatum" TIMESTAMP(3) NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VastspelenPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VastspelenSeasonPeriod" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "seizoensdeel" "Seizoensdeel" NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "eind" TIMESTAMP(3) NOT NULL,
    "totaalWedstrijden" INTEGER NOT NULL,

    CONSTRAINT "VastspelenSeasonPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VastspelenFixture" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "teamId" TEXT NOT NULL,
    "seasonPeriodId" TEXT NOT NULL,
    "tegenstander" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "poule" TEXT,
    "speelweek" INTEGER NOT NULL,
    "wedstrijdduur" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VastspelenFixture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VastspelenAppearance" (
    "id" TEXT NOT NULL,
    "fixtureId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "gespeeldInTeamId" TEXT NOT NULL,
    "minuten" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VastspelenAppearance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VastspelenTeam_clubId_idx" ON "VastspelenTeam"("clubId");

-- CreateIndex
CREATE UNIQUE INDEX "VastspelenTeam_clubId_niveau_categorie_key" ON "VastspelenTeam"("clubId", "niveau", "categorie");

-- CreateIndex
CREATE INDEX "VastspelenPlayer_teamId_idx" ON "VastspelenPlayer"("teamId");

-- CreateIndex
CREATE INDEX "VastspelenSeasonPeriod_seizoensdeel_idx" ON "VastspelenSeasonPeriod"("seizoensdeel");

-- CreateIndex
CREATE UNIQUE INDEX "VastspelenFixture_externalId_key" ON "VastspelenFixture"("externalId");

-- CreateIndex
CREATE INDEX "VastspelenFixture_teamId_idx" ON "VastspelenFixture"("teamId");

-- CreateIndex
CREATE INDEX "VastspelenFixture_seasonPeriodId_idx" ON "VastspelenFixture"("seasonPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "VastspelenAppearance_fixtureId_playerId_key" ON "VastspelenAppearance"("fixtureId", "playerId");

-- CreateIndex
CREATE INDEX "VastspelenAppearance_fixtureId_idx" ON "VastspelenAppearance"("fixtureId");

-- CreateIndex
CREATE INDEX "VastspelenAppearance_playerId_idx" ON "VastspelenAppearance"("playerId");

-- CreateIndex
CREATE INDEX "VastspelenAppearance_gespeeldInTeamId_idx" ON "VastspelenAppearance"("gespeeldInTeamId");

-- AddForeignKey
ALTER TABLE "VastspelenTeam" ADD CONSTRAINT "VastspelenTeam_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VastspelenPlayer" ADD CONSTRAINT "VastspelenPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "VastspelenTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VastspelenFixture" ADD CONSTRAINT "VastspelenFixture_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "VastspelenTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VastspelenFixture" ADD CONSTRAINT "VastspelenFixture_seasonPeriodId_fkey" FOREIGN KEY ("seasonPeriodId") REFERENCES "VastspelenSeasonPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VastspelenAppearance" ADD CONSTRAINT "VastspelenAppearance_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "VastspelenFixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VastspelenAppearance" ADD CONSTRAINT "VastspelenAppearance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "VastspelenPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VastspelenAppearance" ADD CONSTRAINT "VastspelenAppearance_gespeeldInTeamId_fkey" FOREIGN KEY ("gespeeldInTeamId") REFERENCES "VastspelenTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
