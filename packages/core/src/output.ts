import Table from "cli-table3";
import YAML from "yaml";
import type { OutputFormat } from "./types.js";

const ALLOWED_OUTPUTS: OutputFormat[] = ["table", "json", "yaml"];

export const parseOutputFormat = (value: string): OutputFormat => {
  if (ALLOWED_OUTPUTS.includes(value as OutputFormat)) {
    return value as OutputFormat;
  }

  throw new Error(`Invalid output format '${value}'. Allowed values: ${ALLOWED_OUTPUTS.join(", ")}.`);
};

export const print = (rows: unknown, format: OutputFormat): void => {
  if (format === "json") {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (format === "yaml") {
    console.log(YAML.stringify(rows));
    return;
  }

  const data = Array.isArray(rows) ? rows : [rows];
  if (data.length === 0) {
    console.log("No results");
    return;
  }

  const headers = Object.keys(data[0] as Record<string, unknown>);
  const table = new Table({ head: headers });

  for (const row of data) {
    const record = row as Record<string, unknown>;
    table.push(headers.map((h) => stringifyCell(record[h])));
  }

  console.log(table.toString());
};

const stringifyCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};
