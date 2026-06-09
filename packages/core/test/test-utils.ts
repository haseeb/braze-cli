import { vi } from "vitest";

type MockEndpoint = {
  path: string;
  method?: string;
  handler: (body: Record<string, unknown>) => Record<string, unknown>;
};

export const createMockFetch = (endpoints: MockEndpoint[]) => {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const body = init?.body ? JSON.parse(init.body as string) : {};

    for (const endpoint of endpoints) {
      if (url.endsWith(endpoint.path)) {
        const json = endpoint.handler(body);
        return new Response(JSON.stringify(json), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ message: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  });
};

export const mockCampaignsEndpoint = {
  path: "/campaigns/list",
  handler: () => ({
    campaigns: [
      { id: "camp_1", name: "Welcome Series", status: "active" },
      { id: "camp_2", name: "Abandoned Cart", status: "draft" },
    ],
  }),
};

export const mockCampaignDetailsEndpoint = {
  path: "/campaigns/details",
  handler: (body: Record<string, unknown>) => ({
    id: body.campaign_id ?? "camp_1",
    name: "Welcome Series",
    status: "active",
    tags: ["onboarding"],
  }),
};

export const mockContentBlocksListEndpoint = {
  path: "/content_blocks/list",
  handler: () => ({
    content_blocks: [
      { id: "cb_1", name: "Header", content: "Welcome {{first_name}}" },
    ],
  }),
};

export const mockContentBlockInfoEndpoint = {
  path: "/content_blocks/info",
  handler: (body: Record<string, unknown>) => ({
    id: body.content_block_id ?? "cb_1",
    name: "Header",
    content: "Welcome {{first_name}}",
  }),
};

export const mockContentBlockUpdateEndpoint = {
  path: "/content_blocks/update",
  handler: () => ({ message: "success" }),
};
