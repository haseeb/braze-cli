#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { listHarnesses, installSkill, removeSkill } from "./lib/harness.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

type SkillManifest = {
  id: string;
  name: string;
  version: string;
  description: string;
  category?: string;
  tags?: string[];
};

type RegistryIndex = {
  skills: SkillManifest[];
};

const loadIndex = (): RegistryIndex => {
  const indexPaths = [
    join(__dirname, "..", "..", "registry", "index.json"),
    join(__dirname, "..", "..", "..", "registry", "index.json"),
  ];

  for (const p of indexPaths) {
    try {
      return JSON.parse(readFileSync(p, "utf8"));
    } catch {
      continue;
    }
  }

  try {
    const registryModule = "@braze-oss/registry";
    const pkgPath = resolve(join(__dirname, "..", "..", registryModule, "index.json"));
    return JSON.parse(readFileSync(pkgPath, "utf8"));
  } catch {
    return { skills: [] };
  }
};

const findSkillPath = (skillId: string): string => {
  const searchPaths = [
    join(__dirname, "..", "..", "registry", "skills", skillId),
    join(__dirname, "..", "..", "..", "registry", "skills", skillId),
  ];

  for (const p of searchPaths) {
    try {
      readdirSync(p);
      return p;
    } catch {
      continue;
    }
  }

  throw new Error(`Skill '${skillId}' not found in registry.`);
};

const program = new Command();

program
  .name("braze-oss")
  .description("Braze OSS CLI — manage skills and MCP tools")
  .version("0.1.0");

const skillsCommand = new Command("skills")
  .description("Manage installable skill packs");

skillsCommand
  .command("list")
  .description("List available skills")
  .option("--json", "Output as JSON")
  .action((opts: { json?: boolean }) => {
    const index = loadIndex();

    if (opts.json) {
      console.log(JSON.stringify(index.skills, null, 2));
      return;
    }

    for (const skill of index.skills) {
      const tags = skill.tags?.join(", ") ?? "";
      const cat = skill.category ? `[${skill.category}]` : "";
      console.log(`  ${skill.id} ${cat} v${skill.version}`);
      console.log(`    ${skill.description}`);
      if (tags) console.log(`    tags: ${tags}`);
      console.log();
    }

    if (index.skills.length === 0) {
      console.log("No skills found in registry.");
    }
  });

skillsCommand
  .command("add")
  .description("Install a skill into a harness")
  .argument("<id>", "Skill ID")
  .option("--harness <name>", "Target harness (claude-code, codex, goose, hermes, openclaw, generic)", "claude-code")
  .option("--dry-run", "Preview without making changes")
  .action((id: string, opts: { harness: string; dryRun: boolean }) => {
    const skillPath = findSkillPath(id);
    const actions = installSkill(skillPath, opts.harness, skillPath, opts.dryRun);

    for (const action of actions) {
      console.log(action);
    }

    if (opts.dryRun) {
      console.log(`\nRun without --dry-run to install '${id}' into ${opts.harness}.`);
    }
  });

skillsCommand
  .command("update")
  .description("Update a skill (reinstall)")
  .argument("<id>", "Skill ID")
  .option("--harness <name>", "Target harness", "claude-code")
  .option("--dry-run", "Preview without making changes")
  .action((id: string, opts: { harness: string; dryRun: boolean }) => {
    console.log(`Updating skill '${id}' in ${opts.harness}...`);
    removeSkill(opts.harness, id, opts.dryRun);
    const skillPath = findSkillPath(id);
    installSkill(skillPath, opts.harness, skillPath, opts.dryRun);
  });

skillsCommand
  .command("remove")
  .description("Remove an installed skill")
  .argument("<id>", "Skill ID")
  .option("--harness <name>", "Target harness", "claude-code")
  .option("--dry-run", "Preview without making changes")
  .action((id: string, opts: { harness: string; dryRun: boolean }) => {
    const actions = removeSkill(opts.harness, id, opts.dryRun);
    for (const action of actions) {
      console.log(action);
    }
  });

skillsCommand
  .command("harnesses")
  .description("List available harnesses")
  .action(() => {
    console.log("Available harnesses:");
    for (const h of listHarnesses()) {
      console.log(`  - ${h}`);
    }
  });

program.addCommand(skillsCommand);

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
});
