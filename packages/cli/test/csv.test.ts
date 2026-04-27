import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { parseContentBlocksCsv } from "../src/lib/csv.js";

const createdFiles: string[] = [];

afterEach(() => {
  for (const file of createdFiles) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  createdFiles.length = 0;
});

describe("parseContentBlocksCsv", () => {
  it("parses id and content columns", () => {
    const file = writeTmp("id,content\nabc,hello\ndef,world\n");
    const rows = parseContentBlocksCsv(file);
    expect(rows).toEqual([
      { id: "abc", content: "hello" },
      { id: "def", content: "world" }
    ]);
  });

  it("throws when required headers are missing", () => {
    const file = writeTmp("identifier,body\nabc,hello\n");
    expect(() => parseContentBlocksCsv(file)).toThrow("CSV must include 'id' and 'content' columns.");
  });
});

const writeTmp = (content: string): string => {
  const file = path.join(os.tmpdir(), `braze-cli-${Date.now()}-${Math.random()}.csv`);
  fs.writeFileSync(file, content, "utf8");
  createdFiles.push(file);
  return file;
};
