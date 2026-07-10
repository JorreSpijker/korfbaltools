import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { SchotPoging, TegenDoelpunt, Wedstrijd } from "@korfbaltools/scoreformulier-logic";

interface ScoreformulierDB extends DBSchema {
  wedstrijden: {
    key: string;
    value: Wedstrijd;
  };
  schotpogingen: {
    key: string;
    value: SchotPoging;
    indexes: { wedstrijdId: string };
  };
  tegendoelpunten: {
    key: string;
    value: TegenDoelpunt;
    indexes: { wedstrijdId: string };
  };
}

let dbPromise: Promise<IDBPDatabase<ScoreformulierDB>> | null = null;

function getDb(): Promise<IDBPDatabase<ScoreformulierDB>> {
  dbPromise ??= openDB<ScoreformulierDB>("scoreformulier", 1, {
    upgrade(db) {
      db.createObjectStore("wedstrijden", { keyPath: "id" });
      const schotpogingen = db.createObjectStore("schotpogingen", { keyPath: "id" });
      schotpogingen.createIndex("wedstrijdId", "wedstrijdId");
      const tegendoelpunten = db.createObjectStore("tegendoelpunten", { keyPath: "id" });
      tegendoelpunten.createIndex("wedstrijdId", "wedstrijdId");
    },
  });
  return dbPromise;
}

export async function listWedstrijden(): Promise<Wedstrijd[]> {
  const db = await getDb();
  return db.getAll("wedstrijden");
}

export async function getWedstrijd(id: string): Promise<Wedstrijd | undefined> {
  const db = await getDb();
  return db.get("wedstrijden", id);
}

export async function saveWedstrijd(wedstrijd: Wedstrijd): Promise<void> {
  const db = await getDb();
  await db.put("wedstrijden", wedstrijd);
}

export async function patchWedstrijd(id: string, patch: Partial<Wedstrijd>): Promise<void> {
  const db = await getDb();
  const bestaand = await db.get("wedstrijden", id);
  if (!bestaand) return;
  await db.put("wedstrijden", { ...bestaand, ...patch });
}

export async function listSchotpogingen(wedstrijdId: string): Promise<SchotPoging[]> {
  const db = await getDb();
  return db.getAllFromIndex("schotpogingen", "wedstrijdId", wedstrijdId);
}

export async function saveSchotPoging(poging: SchotPoging): Promise<void> {
  const db = await getDb();
  await db.put("schotpogingen", poging);
}

export async function deleteSchotPoging(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("schotpogingen", id);
}

export async function listTegendoelpunten(wedstrijdId: string): Promise<TegenDoelpunt[]> {
  const db = await getDb();
  return db.getAllFromIndex("tegendoelpunten", "wedstrijdId", wedstrijdId);
}

export async function saveTegenDoelpunt(doelpunt: TegenDoelpunt): Promise<void> {
  const db = await getDb();
  await db.put("tegendoelpunten", doelpunt);
}

export async function deleteTegenDoelpunt(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("tegendoelpunten", id);
}
