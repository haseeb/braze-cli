import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export type HarnessConfig = {
  name: string;
  skillsDir: string;
  format: string;
};

const HARNESS_CONFIGS: Record<string, HarnessConfig> = {
  "claude-code": {
    name: "Claude Code",
    skillsDir: ".claude/skills",
    format: "agent-skill",
  },
  codex: {
    name: "Codex",
    skillsDir: ".codex/skills",
    format: "instructions",
  },
  goose: {
    name: "Goose",
    skillsDir: ".goose/skills",
    format: "recipe",
  },
  hermes: {
    name: "Hermes",
    skillsDir: ".hermes/skills",
    format: "instructions",
  },
  openclaw: {
    name: "OpenClaw",
    skillsDir: ".openclaw/skills",
    format: "instructions",
  },
  generic: {
    name: "Generic",
    skillsDir: ".braze-oss/skills",
    format: "prompt",
  },
};

export const listHarnesses = (): string[] => Object.keys(HARNESS_CONFIGS);

export const getHarnessConfig = (id: string): HarnessConfig | undefined => HARNESS_CONFIGS[id];

export const installSkill = (
  skillsDir: string,
  harnessId: string,
  skillPath: string,
  dryRun: boolean,
): string[] => {
  const harness = HARNESS_CONFIGS[harnessId];
  if (!harness) {
    throw new Error(`Unknown harness: ${harnessId}. Available: ${Object.keys(HARNESS_CONFIGS).join(", ")}`);
  }

  const targetDir = path.join(os.homedir(), harness.skillsDir, path.basename(skillPath));
  const actions: string[] = [];

  if (dryRun) {
    actions.push(`[DRY-RUN] Would create ${targetDir}`);
    return actions;
  }

  fs.mkdirSync(targetDir, { recursive: true });

  const entries = fs.readdirSync(skillPath, { recursive: true }) as string[];
  for (const entry of entries) {
    const src = path.join(skillPath, entry);
    const dest = path.join(targetDir, entry);

    if (fs.statSync(src).isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
      actions.push(`Copied ${path.relative(skillPath, src)} → ${dest}`);
    }
  }

  return actions;
};

export const removeSkill = (
  harnessId: string,
  skillId: string,
  dryRun: boolean,
): string[] => {
  const harness = HARNESS_CONFIGS[harnessId];
  if (!harness) {
    throw new Error(`Unknown harness: ${harnessId}`);
  }

  const targetDir = path.join(os.homedir(), harness.skillsDir, skillId);
  const actions: string[] = [];

  if (dryRun) {
    actions.push(`[DRY-RUN] Would remove ${targetDir}`);
    return actions;
  }

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    actions.push(`Removed ${targetDir}`);
  } else {
    actions.push(`Skill '${skillId}' not found in ${harness.name} (${targetDir})`);
  }

  return actions;
};
