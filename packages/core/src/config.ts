import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import YAML from "yaml";
import type { AppConfig, WorkspaceConfig } from "./types.js";

const CONFIG_DIR = path.join(os.homedir(), ".braze");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.yaml");

const defaultConfig = (): AppConfig => ({
  version: 1,
  defaultWorkspace: "dev",
  workspaces: [
    {
      name: "dev",
      baseUrl: "https://rest.iad-01.braze.com",
      apiKeyEnv: "BRAZE_API_KEY"
    }
  ]
});

const normalizeConfig = (input: Partial<AppConfig> | undefined): AppConfig => {
  const base = defaultConfig();

  if (!input) return base;

  return {
    version: 1,
    defaultWorkspace: input.defaultWorkspace ?? base.defaultWorkspace,
    workspaces:
      input.workspaces?.map((ws) => ({
        ...ws,
        apiKeyEnv: ws.apiKeyEnv ?? "BRAZE_API_KEY"
      })) ?? base.workspaces
  };
};

export const ensureConfig = (): AppConfig => {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, YAML.stringify(defaultConfig()), "utf8");
  }

  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  const parsed = YAML.parse(raw) as Partial<AppConfig>;
  const normalized = normalizeConfig(parsed);

  if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
    saveConfig(normalized);
  }

  return normalized;
};

export const saveConfig = (config: AppConfig): void => {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, YAML.stringify(config), "utf8");
};

export const resolveWorkspace = (workspace?: string): WorkspaceConfig => {
  const cfg = ensureConfig();
  const name = workspace ?? cfg.defaultWorkspace;
  const found = cfg.workspaces.find((w) => w.name === name);

  if (!found) {
    throw new Error(`Workspace '${name}' not found in ${CONFIG_PATH}`);
  }

  return found;
};

export const listWorkspaces = (): WorkspaceConfig[] => ensureConfig().workspaces;

export const upsertWorkspace = (workspace: WorkspaceConfig): AppConfig => {
  const cfg = ensureConfig();
  const existing = cfg.workspaces.findIndex((w) => w.name === workspace.name);

  if (existing >= 0) {
    cfg.workspaces[existing] = workspace;
  } else {
    cfg.workspaces.push(workspace);
  }

  saveConfig(cfg);
  return cfg;
};

export const setDefaultWorkspace = (workspace: string): AppConfig => {
  const cfg = ensureConfig();
  const exists = cfg.workspaces.some((w) => w.name === workspace);
  if (!exists) {
    throw new Error(`Cannot set default workspace to '${workspace}' because it is not configured.`);
  }

  cfg.defaultWorkspace = workspace;
  saveConfig(cfg);
  return cfg;
};

export const configPath = CONFIG_PATH;
