import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { BrazeClient, resolveWorkspace, planContentBlockUpdate, applyPlan, changeEngine } from "../src/index.js";
import {
  createMockFetch,
  mockContentBlocksListEndpoint,
  mockContentBlockInfoEndpoint,
  mockContentBlockUpdateEndpoint,
  mockCampaignsEndpoint,
  mockCampaignDetailsEndpoint,
} from "./test-utils.js";
import type { WorkspaceConfig } from "../src/types.js";

const workspace: WorkspaceConfig = {
  name: "test",
  baseUrl: "https://rest.test.braze.com",
};

describe("BrazeClient integration", () => {
  beforeEach(() => {
    process.env.BRAZE_API_KEY = "test-key";
    changeEngine.clear();
  });

  afterEach(() => {
    delete process.env.BRAZE_API_KEY;
  });

  it("lists campaigns via mocked API", async () => {
    vi.stubGlobal("fetch", createMockFetch([mockCampaignsEndpoint]));

    const client = new BrazeClient(workspace);
    const campaigns = await client.listCampaigns();

    expect(campaigns).toHaveLength(2);
    expect(campaigns[0].name).toBe("Welcome Series");
    expect(campaigns[1].name).toBe("Abandoned Cart");

    vi.unstubAllGlobals();
  });

  it("gets campaign details via mocked API", async () => {
    vi.stubGlobal("fetch", createMockFetch([mockCampaignDetailsEndpoint]));

    const client = new BrazeClient(workspace);
    const campaign = await client.getCampaign("camp_1");

    expect(campaign.id).toBe("camp_1");
    expect(campaign.name).toBe("Welcome Series");
    expect(campaign.tags).toEqual(["onboarding"]);

    vi.unstubAllGlobals();
  });

  it("lists content blocks via mocked API", async () => {
    vi.stubGlobal("fetch", createMockFetch([mockContentBlocksListEndpoint]));

    const client = new BrazeClient(workspace);
    const blocks = await client.listContentBlocks();

    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe("cb_1");

    vi.unstubAllGlobals();
  });

  it("plans and applies content block update via mocked API", async () => {
    vi.stubGlobal("fetch", createMockFetch([
      mockContentBlockInfoEndpoint,
      mockContentBlockUpdateEndpoint,
    ]));

    const client = new BrazeClient(workspace);

    const plan = await planContentBlockUpdate(client, "cb_1", "Updated content");
    expect(plan.diff).toContain("+ Updated content");
    expect(plan.planId).toMatch(/^plan_/);

    const result = await applyPlan(client, plan.planId, plan.token);
    expect(result.message).toBe("success");

    vi.unstubAllGlobals();
  });

  it("fails to apply with wrong token", async () => {
    vi.stubGlobal("fetch", createMockFetch([
      mockContentBlockInfoEndpoint,
      mockContentBlockUpdateEndpoint,
    ]));

    const client = new BrazeClient(workspace);
    const plan = await planContentBlockUpdate(client, "cb_1", "Updated content");

    await expect(applyPlan(client, plan.planId, "wrong_token"))
      .rejects.toThrow("Invalid confirmation token");

    vi.unstubAllGlobals();
  });
});
