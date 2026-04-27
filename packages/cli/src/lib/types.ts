export type OutputFormat = "table" | "json" | "yaml";

export type WorkspaceConfig = {
  name: string;
  baseUrl: string;
  apiKeyEnv?: string;
};

export type AppConfig = {
  defaultWorkspace?: string;
  workspaces: WorkspaceConfig[];
};

export type Campaign = {
  id: string;
  name: string;
  status?: string;
  tags?: string[];
};

export type Canvas = {
  id: string;
  name: string;
  description?: string;
  archived?: boolean;
};

export type Segment = {
  id: string;
  name: string;
  description?: string;
};
