import * as XLSX from "xlsx";
import type { Gender } from "@korfbaltools/types";

export interface ParsedPlayer {
  naam: string;
  geslacht: Gender;
}

function parseGender(value: unknown): Gender {
  if (!value) return "m";
  const normalized = String(value).toLowerCase().trim();
  if (["v", "f", "vrouw", "female", "dame", "woman"].includes(normalized)) return "v";
  return "m";
}

function findColumn(headers: string[], patterns: string[]): string | null {
  for (const header of headers) {
    const lower = header.toLowerCase().trim();
    for (const pattern of patterns) {
      if (lower.includes(pattern)) return header;
    }
  }
  return null;
}

export function parsePlayersFile(file: File): Promise<ParsedPlayer[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]!]!;
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

        if (rows.length === 0) throw new Error("Geen data gevonden in bestand");

        const headers = Object.keys(rows[0]!);
        const naamCol = findColumn(headers, ["naam", "name", "speler"]);
        const geslachtCol = findColumn(headers, ["geslacht", "gender", "sekse", "sex"]);

        if (!naamCol) throw new Error('Kolom "naam" niet gevonden. Verwacht: naam, geslacht');

        const players: ParsedPlayer[] = rows
          .filter((row) => row[naamCol]?.toString().trim())
          .map((row) => ({
            naam: String(row[naamCol]).trim(),
            geslacht: geslachtCol ? parseGender(row[geslachtCol]) : "m",
          }));

        resolve(players);
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
    reader.onerror = () => reject(new Error("Fout bij lezen van bestand"));
    reader.readAsArrayBuffer(file);
  });
}
