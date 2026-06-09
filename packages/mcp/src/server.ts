import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  BrazeClient,
  resolveWorkspace,
  planContentBlockUpdate,
  applyPlan,
  lintLiquid,
  previewLiquid,
  generateCopy,
  runOptimizationAudit,
  generateWeeklyInsights,
  scaffoldDecisioning,
} from "@braze-oss/core";
import { z } from "zod";
import type { WorkspaceConfig } from "@braze-oss/core";

const workspaceOption = z.object({
  workspace: z.string().optional().describe("Braze workspace name (uses default if omitted)"),
});

export const createMcpServer = (opts?: { allowWrites?: boolean }): McpServer => {
  const allowWrites = opts?.allowWrites ?? false;
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

  server.registerTool(
    "braze_list_email_templates",
    {
      description: "List all Braze email templates in a workspace",
      inputSchema: workspaceOption,
    },
    async (args) => {
      const client = getClient(args.workspace);
      const templates = await client.listEmailTemplates();
      return {
        content: [{ type: "text" as const, text: JSON.stringify(templates, null, 2) }],
      };
    },
  );

  server.registerTool(
    "braze_get_email_template",
    {
      description: "Get details of a specific Braze email template",
      inputSchema: z.object({
        email_template_id: z.string().describe("Braze email template ID"),
        workspace: z.string().optional().describe("Braze workspace name (uses default if omitted)"),
      }),
    },
    async (args) => {
      const client = getClient(args.workspace);
      const template = await client.getEmailTemplate(args.email_template_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(template, null, 2) }],
      };
    },
  );

  server.registerTool(
    "braze_liquid_lint",
    {
      description: "Lint a Liquid template for syntax errors and warnings",
      inputSchema: z.object({
        template: z.string().describe("Liquid template to lint"),
      }),
    },
    async (args) => {
      const result = lintLiquid(args.template);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "braze_liquid_preview",
    {
      description: "Preview a Liquid template with optional sample data",
      inputSchema: z.object({
        template: z.string().describe("Liquid template to preview"),
        sampleData: z.record(z.unknown()).optional().describe("Sample data for variable substitution"),
      }),
    },
    async (args) => {
      const result = previewLiquid(args.template, args.sampleData as Record<string, unknown> | undefined);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ preview: result }, null, 2) }],
      };
    },
  );

  if (allowWrites) {
    server.registerTool(
      "braze_plan_content_block",
      {
        description: "Plan a content block update — shows the diff before applying. Use braze_apply_content_block to execute.",
        inputSchema: z.object({
          content_block_id: z.string().describe("Braze content block ID"),
          content: z.string().describe("New content for the content block"),
          workspace: z.string().optional().describe("Braze workspace name (uses default if omitted)"),
        }),
      },
      async (args) => {
        const client = getClient(args.workspace);
        const result = await planContentBlockUpdate(client, args.content_block_id, args.content);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    );

    server.registerTool(
      "braze_apply_content_block",
      {
        description: "Apply a planned content block update using the confirmation token returned from braze_plan_content_block.",
        inputSchema: z.object({
          plan_id: z.string().describe("Plan ID from braze_plan_content_block"),
          token: z.string().describe("Confirmation token from the plan step"),
          workspace: z.string().optional().describe("Braze workspace name (uses default if omitted)"),
        }),
      },
      async (args) => {
        const client = getClient(args.workspace);
        const result = await applyPlan(client, args.plan_id, args.token);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    );

    server.registerTool(
      "braze_generate_copy",
      {
        description: "Generate draft copy variants for a campaign or template. All output is draft-staged.",
        inputSchema: z.object({
          goal: z.string().describe("Campaign goal"),
          audience: z.string().describe("Target audience description"),
          tone: z.string().optional().describe("Tone (e.g. professional, casual, urgent)"),
          count: z.number().optional().describe("Number of variants (default 3)"),
          template_id: z.string().optional().describe("Optional email template ID"),
          workspace: z.string().optional().describe("Braze workspace name"),
        }),
      },
      async (args) => {
        const client = getClient(args.workspace);
        const result = await generateCopy(client, {
          goal: args.goal,
          audience: args.audience,
          tone: args.tone,
          count: args.count,
          templateId: args.template_id,
        });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    );

    server.registerTool(
      "braze_optimization_audit",
      {
        description: "Run an optimization audit on campaigns and canvases",
        inputSchema: z.object({
          campaign_ids: z.array(z.string()).optional().describe("Specific campaign IDs to audit"),
          canvas_ids: z.array(z.string()).optional().describe("Specific canvas IDs to audit"),
          workspace: z.string().optional().describe("Braze workspace name"),
        }),
      },
      async (args) => {
        const client = getClient(args.workspace);
        const result = await runOptimizationAudit(client, {
          campaignIds: args.campaign_ids,
          canvasIds: args.canvas_ids,
        });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    );

    server.registerTool(
      "braze_weekly_insights",
      {
        description: "Generate a weekly performance summary across campaigns, canvases, and segments",
        inputSchema: z.object({
          days_back: z.number().optional().describe("Number of days to look back (default 7)"),
          workspace: z.string().optional().describe("Braze workspace name"),
        }),
      },
      async (args) => {
        const client = getClient(args.workspace);
        const result = await generateWeeklyInsights(client, {
          daysBack: args.days_back,
        });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    );

    server.registerTool(
      "braze_decisioning_scaffold",
      {
        description: "Scaffold a Decisioning Studio experiment with variants",
        inputSchema: z.object({
          name: z.string().describe("Experiment name"),
          goal: z.string().describe("Experiment goal"),
          audience: z.string().describe("Target audience description"),
          variants: z.array(z.string()).describe("Variant names (e.g. ['Control', 'Variant A'])"),
          workspace: z.string().optional().describe("Braze workspace name"),
        }),
      },
      async (args) => {
        const client = getClient(args.workspace);
        const result = await scaffoldDecisioning(client, {
          name: args.name,
          goal: args.goal,
          audience: args.audience,
          variants: args.variants,
        });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      },
    );
  }

  return server;
};
