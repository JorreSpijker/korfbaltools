import * as XLSX from "xlsx";
import type { Gender, Player } from "@/types";

function excelDateToISO(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().split("T")[0]!;
  }
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      const y = date.y;
      const m = String(date.m).padStart(2, "0");
      const d = String(date.d).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  if (typeof value === "string") {
    const parts = value.split(/[-/.]/);
    if (parts.length === 3) {
      const [a, b, c] = parts as [string, string, string];
      if (c.length === 4) {
        return `${c}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`;
      }
      if (a.length === 4) return value;
    }
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0]!;
  }
  return String(value);
}

function parseGender(value: unknown): Gender {
  if (!value) return "m";
  const v = String(value).toLowerCase().trim();
  if (["v", "f", "vrouw", "female", "dame", "woman"].includes(v)) return "f";
  return "m";
}

function findColumn(headers: string[], patterns: string[]): string | null {
  for (const h of headers) {
    const lower = String(h).toLowerCase().trim();
    for (const p of patterns) {
      if (lower.includes(p)) return h;
    }
  }
  return null;
}

export function parseExcelFile(file: File): Promise<Player[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]!]!;
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

        if (rows.length === 0) throw new Error("Geen data gevonden in Excel bestand");

        const headers = Object.keys(rows[0]!);
        const nameCol = findColumn(headers, ["naam", "name", "speler"]);
        const birthCol = findColumn(headers, ["geboortedatum", "birthdate", "dob", "geboren", "geboorte"]);
        const genderCol = findColumn(headers, ["geslacht", "gender", "sekse", "sex"]);

        if (!nameCol) throw new Error('Kolom "naam" niet gevonden. Verwacht: naam, geboortedatum, geslacht');

        const players: Player[] = rows
          .filter((r) => r[nameCol]?.toString().trim())
          .map((r) => ({
            id: crypto.randomUUID(),
            name: String(r[nameCol]).trim(),
            birthdate: birthCol ? excelDateToISO(r[birthCol]) : "",
            gender: genderCol ? parseGender(r[genderCol]) : "m",
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
