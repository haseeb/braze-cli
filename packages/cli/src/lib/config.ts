import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import YAML from "yaml";
import type { AppConfig, WorkspaceConfig } from "./types.js";

const CONFIG_DIR = path.join(os.homedir(), ".braze");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.yaml");

const defaultConfig = (): AppConfig => ({
  defaultWorkspace: "dev",
  workspaces: [
    {
      name: "dev",
      baseUrl: "https://rest.iad-01.braze.com",
      apiKeyEnv: "BRAZE_API_KEY"
    }
  ]
});

export const ensureConfig = (): AppConfig => {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, YAML.stringify(defaultConfig()), "utf8");
  }

  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  return YAML.parse(raw) as AppConfig;
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

export const configPath = CONFIG_PATH;
