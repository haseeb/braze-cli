import fs from "node:fs";
import type { ContentBlockBulkInput } from "./types.js";

export const parseContentBlocksCsv = (filePath: string): ContentBlockBulkInput[] => {
  const raw = fs.readFileSync(filePath, "utf8").trim();
  if (!raw) return [];

  const [headerLine, ...lines] = raw.split(/\r?\n/);
  const headers = splitCsvLine(headerLine).map((value) => value.trim());
  const idIndex = headers.indexOf("id");
  const contentIndex = headers.indexOf("content");

  if (idIndex < 0 || contentIndex < 0) {
    throw new Error("CSV must include 'id' and 'content' columns.");
  }

  return lines
    .filter((line) => line.trim().length > 0)
    .map((line, idx) => {
      const cells = splitCsvLine(line);
      const id = cells[idIndex]?.trim();
      const content = cells[contentIndex] ?? "";

      if (!id) {
        throw new Error(`Invalid row ${idx + 2} in ${filePath}: missing id.`);
      }

      return { id, content };
    });
};

const splitCsvLine = (line: string): string[] => {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (inQuotes) {
    throw new Error("Malformed CSV: unmatched quote in line.");
  }

  out.push(current);
  return out;
};
