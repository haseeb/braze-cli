import { getApiKey } from "./credentials.js";
import type {
  BrazeListResponse,
  Campaign,
  Canvas,
  ContentBlock,
  ContentBlockBulkInput,
  Segment,
  WorkspaceConfig
} from "./types.js";

const RETRYABLE_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

export class BrazeClient {
  constructor(private readonly workspace: WorkspaceConfig) {}

  async listCampaigns(): Promise<Campaign[]> {
    const data = await this.post<BrazeListResponse<Campaign>>("/campaigns/list", {});
    return data.campaigns ?? data.items ?? [];
  }

  async getCampaign(id: string): Promise<Campaign> {
    return this.post<Campaign>("/campaigns/details", { campaign_id: id });
  }

  async listCanvases(): Promise<Canvas[]> {
    const data = await this.post<BrazeListResponse<Canvas>>("/canvas/list", {});
    return data.canvases ?? data.items ?? [];
  }

  async getCanvas(id: string): Promise<Canvas> {
    return this.post<Canvas>("/canvas/details", { canvas_id: id });
  }

  async listSegments(): Promise<Segment[]> {
    const data = await this.post<BrazeListResponse<Segment>>("/segments/list", {});
    return data.segments ?? data.items ?? [];
  }

  async getSegment(id: string): Promise<Segment> {
    return this.post<Segment>("/segments/details", { segment_id: id });
  }

  async listContentBlocks(): Promise<ContentBlock[]> {
    const data = await this.post<BrazeListResponse<ContentBlock>>("/content_blocks/list", {});
    return data.content_blocks ?? data.items ?? [];
  }

  async getContentBlock(id: string): Promise<ContentBlock> {
    return this.post<ContentBlock>("/content_blocks/info", { content_block_id: id });
  }

  async updateContentBlock(id: string, content: string): Promise<{ message?: string }> {
    return this.post<{ message?: string }>("/content_blocks/update", {
      content_block_id: id,
      content
    });
  }

  async bulkUpdateContentBlocks(rows: ContentBlockBulkInput[]): Promise<Array<{ id: string; message: string }>> {
    const result: Array<{ id: string; message: string }> = [];

    for (const row of rows) {
      const response = await this.updateContentBlock(row.id, row.content);
      result.push({
        id: row.id,
        message: response.message ?? "updated"
      });
    }

    return result;
  }

  private async post<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const apiKey = await getApiKey(this.workspace);
    if (!apiKey) {
      const envVar = this.workspace.apiKeyEnv ?? "BRAZE_API_KEY";
      throw new Error(
        `Missing API key. Set ${envVar} or run 'braze auth login --workspace ${this.workspace.name} --api-key <key>'.`
      );
    }

    const maxAttempts = 4;
    let attempt = 0;

    while (attempt < maxAttempts) {
      attempt += 1;
      const response = await fetch(`${this.workspace.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      if (!RETRYABLE_CODES.has(response.status) || attempt === maxAttempts) {
        const text = await response.text();
        throw new Error(`Braze API ${response.status}: ${text}`);
      }

      await delay(200 * 2 ** (attempt - 1));
    }

    throw new Error("Unexpected retry loop exit.");
  }
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
