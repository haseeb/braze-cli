import type { Campaign, Canvas, Segment, WorkspaceConfig } from "./types.js";

type ListResponse<T> = {
  items: T[];
};

export class BrazeClient {
  constructor(private readonly workspace: WorkspaceConfig) {}

  async listCampaigns(): Promise<Campaign[]> {
    const data = await this.get<ListResponse<Campaign>>("/campaigns/list");
    return data.items;
  }

  async getCampaign(id: string): Promise<Campaign> {
    return this.get<Campaign>(`/campaigns/${id}`);
  }

  async listCanvases(): Promise<Canvas[]> {
    const data = await this.get<ListResponse<Canvas>>("/canvases/list");
    return data.items;
  }

  async getCanvas(id: string): Promise<Canvas> {
    return this.get<Canvas>(`/canvases/${id}`);
  }

  async listSegments(): Promise<Segment[]> {
    const data = await this.get<ListResponse<Segment>>("/segments/list");
    return data.items;
  }

  async getSegment(id: string): Promise<Segment> {
    return this.get<Segment>(`/segments/${id}`);
  }

  private async get<T>(endpoint: string): Promise<T> {
    const apiKey = process.env[this.workspace.apiKeyEnv ?? "BRAZE_API_KEY"];
    if (!apiKey) {
      throw new Error(
        `Missing API key. Set ${this.workspace.apiKeyEnv ?? "BRAZE_API_KEY"} for workspace '${this.workspace.name}'.`
      );
    }

    const url = `${this.workspace.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Braze API ${response.status}: ${text}`);
    }

    return (await response.json()) as T;
  }
}
