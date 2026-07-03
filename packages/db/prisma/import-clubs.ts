import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, "../../../data/clubs.json");

interface Address {
  name: string;
  type: string;
  description: string;
  streetName: string;
  addressNumber: number;
  addressNumberAppendix: string | null;
  cipCode: string;
  city: string;
  country: string;
  countryCode: string;
}

interface Pool {
  pool_name: string;
  pool_id: number;
}

interface ClubEntry {
  name: string;
  coordinates: [number, number] | null;
  address: Address | null;
  ref_id: string;
  veld?: Pool;
  zaal?: Pool;
}

interface Regio {
  id: number;
  name: string;
  clubs: ClubEntry[];
}

interface Cluster {
  id: string;
  name: string;
  regios: Regio[];
}

interface ClubsFile {
  clusters: Cluster[];
}

async function main() {
  const file: ClubsFile = JSON.parse(readFileSync(dataPath, "utf-8"));

  const seenRefIds = new Set<string>();
  let imported = 0;
  let skipped = 0;

  for (const cluster of file.clusters) {
    for (const regio of cluster.regios) {
      for (const club of regio.clubs) {
        if (seenRefIds.has(club.ref_id)) {
          skipped++;
          continue;
        }
        seenRefIds.add(club.ref_id);

        await prisma.club.upsert({
          where: { refId: club.ref_id },
          create: {
            naam: club.name,
            refId: club.ref_id,
            latitude: club.coordinates?.[1] ?? null,
            longitude: club.coordinates?.[0] ?? null,
            addressName: club.address?.name ?? null,
            addressType: club.address?.type ?? null,
            addressDescription: club.address?.description ?? null,
            streetName: club.address?.streetName ?? null,
            addressNumber: club.address?.addressNumber ?? null,
            addressNumberAppendix: club.address?.addressNumberAppendix ?? null,
            postalCode: club.address?.cipCode ?? null,
            city: club.address?.city ?? null,
            country: club.address?.country ?? null,
            countryCode: club.address?.countryCode ?? null,
            veldPoolName: club.veld?.pool_name ?? null,
            veldPoolId: club.veld?.pool_id ?? null,
            zaalPoolName: club.zaal?.pool_name ?? null,
            zaalPoolId: club.zaal?.pool_id ?? null,
            clusterId: cluster.id,
            clusterName: cluster.name,
            regioId: regio.id,
            regioName: regio.name,
          },
          update: {
            naam: club.name,
            latitude: club.coordinates?.[1] ?? null,
            longitude: club.coordinates?.[0] ?? null,
            addressName: club.address?.name ?? null,
            addressType: club.address?.type ?? null,
            addressDescription: club.address?.description ?? null,
            streetName: club.address?.streetName ?? null,
            addressNumber: club.address?.addressNumber ?? null,
            addressNumberAppendix: club.address?.addressNumberAppendix ?? null,
            postalCode: club.address?.cipCode ?? null,
            city: club.address?.city ?? null,
            country: club.address?.country ?? null,
            countryCode: club.address?.countryCode ?? null,
            veldPoolName: club.veld?.pool_name ?? null,
            veldPoolId: club.veld?.pool_id ?? null,
            zaalPoolName: club.zaal?.pool_name ?? null,
            zaalPoolId: club.zaal?.pool_id ?? null,
            clusterId: cluster.id,
            clusterName: cluster.name,
            regioId: regio.id,
            regioName: regio.name,
          },
        });
        imported++;
      }
    }
  }

  console.log(`Imported/updated ${imported} clubs, skipped ${skipped} duplicate ref_id entries.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
