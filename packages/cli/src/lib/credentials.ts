import type { WorkspaceConfig } from "./types.js";

const KEYTAR_SERVICE = "braze-cli";

type KeytarLike = {
  getPassword: (service: string, account: string) => Promise<string | null>;
  setPassword: (service: string, account: string, password: string) => Promise<void>;
};

const loadKeytar = async (): Promise<KeytarLike | null> => {
  try {
    const mod = await import("keytar");
    return mod.default as KeytarLike;
  } catch {
    return null;
  }
};

export const getApiKey = async (workspace: WorkspaceConfig): Promise<string | null> => {
  const fromEnv = process.env[workspace.apiKeyEnv ?? "BRAZE_API_KEY"];
  if (fromEnv) return fromEnv;

  const keytar = await loadKeytar();
  if (!keytar) return null;

  return keytar.getPassword(KEYTAR_SERVICE, workspace.name);
};

export const saveApiKey = async (workspaceName: string, apiKey: string): Promise<boolean> => {
  const keytar = await loadKeytar();
  if (!keytar) return false;

  await keytar.setPassword(KEYTAR_SERVICE, workspaceName, apiKey);
  return true;
};
