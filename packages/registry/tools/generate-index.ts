import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.join(__dirname, "..", "skills");
const outputPath = path.join(__dirname, "..", "index.json");

type SkillManifest = {
  id: string;
  name: string;
  version: string;
  description: string;
  category?: string;
  requires?: Record<string, unknown>;
  entry: string;
  prompts?: string[];
  harnesses: Record<string, { type: string; path?: string; adapter?: string }>;
  tags?: string[];
  license?: string;
  author?: string;
};

const skills: SkillManifest[] = [];

const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const skillJsonPath = path.join(skillsDir, entry.name, "skill.json");
  if (!fs.existsSync(skillJsonPath)) continue;

  const raw = fs.readFileSync(skillJsonPath, "utf8");
  const manifest = JSON.parse(raw) as SkillManifest;
  skills.push(manifest);
}

skills.sort((a, b) => a.id.localeCompare(b.id));

const index = {
  version: "0.1.0",
  generated_at: new Date().toISOString(),
  skills,
};

fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), "utf8");
console.log(`Generated index.json with ${skills.length} skills`);
