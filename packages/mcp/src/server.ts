import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BrazeClient, resolveWorkspace } from "@braze-oss/core";
import { z } from "zod";
import type { WorkspaceConfig } from "@braze-oss/core";

const workspaceOption = z.object({
  workspace: z.string().optional().describe("Braze workspace name (uses default if omitted)"),
});

export const createMcpServer = (): McpServer => {
  const server = new McpServer({
    name: "braze-oss-mcp",
    version: "0.1.0",
  });

  const getClient = (workspaceName?: string): BrazeClient => {
    const ws: WorkspaceConfig = resolveWorkspace(workspaceName);
    return new BrazeClient(ws);
  };

  server.registerTool(
    "braze_list_campaigns",
    {
      description: "List all Braze campaigns in a workspace",
      inputSchema: workspaceOption,
    },
    async (args) => {
      const client = getClient(args.workspace);
      const campaigns = await client.listCampaigns();
      return {
        content: [{ type: "text" as const, text: JSON.stringify(campaigns, null, 2) }],
      };
    },
  );

  server.registerTool(
    "braze_get_campaign",
    {
      description: "Get details of a specific Braze campaign",
      inputSchema: z.object({
        campaign_id: z.string().describe("Braze campaign ID"),
        workspace: z.string().optional().describe("Braze workspace name (uses default if omitted)"),
      }),
    },
    async (args) => {
      const client = getClient(args.workspace);
      const campaign = await client.getCampaign(args.campaign_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(campaign, null, 2) }],
      };
    },
  );

  server.registerTool(
    "braze_list_canvases",
    {
      description: "List all Braze canvases in a workspace",
      inputSchema: workspaceOption,
    },
    async (args) => {
      const client = getClient(args.workspace);
      const canvases = await client.listCanvases();
      return {
        content: [{ type: "text" as const, text: JSON.stringify(canvases, null, 2) }],
      };
    },
  );

  server.registerTool(
    "braze_get_canvas",
    {
      description: "Get details of a specific Braze canvas",
      inputSchema: z.object({
        canvas_id: z.string().describe("Braze canvas ID"),
        workspace: z.string().optional().describe("Braze workspace name (uses default if omitted)"),
      }),
    },
    async (args) => {
      const client = getClient(args.workspace);
      const canvas = await client.getCanvas(args.canvas_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(canvas, null, 2) }],
      };
    },
  );

  server.registerTool(
    "braze_list_segments",
    {
      description: "List all Braze segments in a workspace",
      inputSchema: workspaceOption,
    },
    async (args) => {
      const client = getClient(args.workspace);
      const segments = await client.listSegments();
      return {
        content: [{ type: "text" as const, text: JSON.stringify(segments, null, 2) }],
      };
    },
  );

  server.registerTool(
    "braze_get_segment",
    {
      description: "Get details of a specific Braze segment",
      inputSchema: z.object({
        segment_id: z.string().describe("Braze segment ID"),
        workspace: z.string().optional().describe("Braze workspace name (uses default if omitted)"),
      }),
    },
    async (args) => {
      const client = getClient(args.workspace);
      const segment = await client.getSegment(args.segment_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(segment, null, 2) }],
      };
    },
  );

  server.registerTool(
    "braze_list_content_blocks",
    {
      description: "List all Braze content blocks in a workspace",
      inputSchema: workspaceOption,
    },
    async (args) => {
      const client = getClient(args.workspace);
      const blocks = await client.listContentBlocks();
      return {
        content: [{ type: "text" as const, text: JSON.stringify(blocks, null, 2) }],
      };
    },
  );

  server.registerTool(
    "braze_get_content_block",
    {
      description: "Get details of a specific Braze content block",
      inputSchema: z.object({
        content_block_id: z.string().describe("Braze content block ID"),
        workspace: z.string().optional().describe("Braze workspace name (uses default if omitted)"),
      }),
    },
    async (args) => {
      const client = getClient(args.workspace);
      const block = await client.getContentBlock(args.content_block_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(block, null, 2) }],
      };
    },
  );

  return server;
};
