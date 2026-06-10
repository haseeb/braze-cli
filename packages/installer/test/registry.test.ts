import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const registryDir = path.join(here, "..", "..", "registry");
const skillsDir = path.join(registryDir, "skills");
const schemaPath = path.join(registryDir, "schema", "skill.schema.json");
const indexPath = path.join(registryDir, "index.json");

type Schema = {
  required: string[];
  properties: Record<string, { pattern?: string; minLength?: number; enum?: string[] }>;
};

type HarnessEntry = { type: string; path?: string; adapter?: string };
type Manifest = {
  id: string;
  name: string;
  version: string;
  description: string;
  category?: string;
  entry: string;
  prompts?: string[];
  harnesses: Record<string, HarnessEntry>;
};

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8")) as Schema;

const skillDirs = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((name) => fs.existsSync(path.join(skillsDir, name, "skill.json")));

const loadManifest = (dir: string): Manifest =>
  JSON.parse(fs.readFileSync(path.join(skillsDir, dir, "skill.json"), "utf8")) as Manifest;

describe("registry catalog", () => {
  it("contains skills", () => {
    expect(skillDirs.length).toBeGreaterThanOrEqual(7);
  });

  it.each(skillDirs)("%s/skill.json satisfies the schema", (dir) => {
    const manifest = loadManifest(dir) as unknown as Record<string, unknown>;

    for (const field of schema.required) {
      expect(manifest[field], `missing required field '${field}'`).toBeDefined();
    }

    expect(manifest.id).toMatch(new RegExp(schema.properties.id.pattern!));
    expect(manifest.version).toMatch(new RegExp(schema.properties.version.pattern!));
    expect((manifest.description as string).length).toBeGreaterThanOrEqual(
      schema.properties.description.minLength!,
    );
    if (manifest.category) {
      expect(schema.properties.category.enum).toContain(manifest.category);
    }
  });

  it.each(skillDirs)("%s references files that exist on disk", (dir) => {
    const manifest = loadManifest(dir);
    const skillRoot = path.join(skillsDir, dir);

    expect(fs.existsSync(path.join(skillRoot, manifest.entry))).toBe(true);

    for (const prompt of manifest.prompts ?? []) {
      expect(fs.existsSync(path.join(skillRoot, prompt)), `missing prompt ${prompt}`).toBe(true);
    }

    for (const [harness, entry] of Object.entries(manifest.harnesses)) {
      expect(entry.type, `${harness} missing type`).toBeTruthy();
      const ref = entry.adapter ?? entry.path;
      if (ref) {
        expect(fs.existsSync(path.join(skillRoot, ref)), `${harness} missing ${ref}`).toBe(true);
      }
    }
  });

  it("uses a unique id per skill", () => {
    const ids = skillDirs.map((dir) => loadManifest(dir).id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("index.json is in sync with the skill manifests", () => {
    const index = JSON.parse(fs.readFileSync(indexPath, "utf8")) as { skills: Manifest[] };
    const onDisk = skillDirs.map(loadManifest).sort((a, b) => a.id.localeCompare(b.id));
    const indexed = [...index.skills].sort((a, b) => a.id.localeCompare(b.id));

    expect(indexed.map((s) => s.id)).toEqual(onDisk.map((s) => s.id));
    for (const skill of onDisk) {
      const match = indexed.find((s) => s.id === skill.id);
      expect(match, `index missing ${skill.id}`).toBeDefined();
      expect(match!.version).toBe(skill.version);
      expect(match!.name).toBe(skill.name);
    }
  });
});
