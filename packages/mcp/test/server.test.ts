import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../src/server.js";

const connect = async (allowWrites: boolean): Promise<Client> => {
  const server = createMcpServer({ allowWrites });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  return client;
};

const listToolNames = async (client: Client): Promise<string[]> => {
  const { tools } = await client.listTools();
  return tools.map((t) => t.name).sort();
};

describe("createMcpServer tool catalog", () => {
  it("exposes read tools and hides write tools when writes are disabled", async () => {
    const client = await connect(false);
    const names = await listToolNames(client);

    expect(names).toContain("braze_list_campaigns");
    expect(names).toContain("braze_get_campaign");
    expect(names).toContain("braze_list_content_blocks");
    expect(names).toContain("braze_liquid_lint");
    expect(names).toContain("braze_liquid_preview");

    expect(names).not.toContain("braze_plan_content_block");
    expect(names).not.toContain("braze_apply_content_block");
    expect(names).not.toContain("braze_generate_copy");

    await client.close();
  });

  it("exposes write/AI tools when writes are enabled", async () => {
    const client = await connect(true);
    const names = await listToolNames(client);

    expect(names).toContain("braze_plan_content_block");
    expect(names).toContain("braze_apply_content_block");
    expect(names).toContain("braze_generate_copy");
    expect(names).toContain("braze_optimization_audit");
    expect(names).toContain("braze_weekly_insights");
    expect(names).toContain("braze_decisioning_scaffold");

    await client.close();
  });
});

describe("createMcpServer tool execution", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.BRAZE_API_KEY = "test-key";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    delete process.env.BRAZE_API_KEY;
  });

  it("runs braze_liquid_lint without touching the network", async () => {
    const client = await connect(false);
    const result = await client.callTool({
      name: "braze_liquid_lint",
      arguments: { template: "Hello {{first_name}}" },
    });

    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const parsed = JSON.parse(text);
    expect(parsed).toHaveProperty("valid");

    await client.close();
  });

  it("runs braze_list_campaigns against a mocked Braze API", async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          campaigns: [{ id: "camp_1", name: "Welcome", status: "active" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    ) as unknown as typeof fetch;

    const client = await connect(false);
    const result = await client.callTool({
      name: "braze_list_campaigns",
      arguments: { workspace: "dev" },
    });

    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const parsed = JSON.parse(text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].id).toBe("camp_1");

    await client.close();
  });
});
