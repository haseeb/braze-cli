export type OutputFormat = "table" | "json" | "yaml";

export type WorkspaceConfig = {
  name: string;
  baseUrl: string;
  apiKeyEnv?: string;
};

export type AppConfig = {
  version: number;
  defaultWorkspace: string;
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

export type ContentBlock = {
  id: string;
  name: string;
  description?: string;
  content?: string;
  tags?: string[];
};

export type ContentBlockBulkInput = {
  id: string;
  content: string;
};

export type BrazeListResponse<T> = {
  items?: T[];
  campaigns?: T[];
  canvases?: T[];
  segments?: T[];
  content_blocks?: T[];
  message?: string;
};
