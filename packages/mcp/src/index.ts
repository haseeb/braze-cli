#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { createMcpServer } from "./server.js";
import { bearerAuth } from "./auth.js";

const PORT = parseInt(process.env.BRAZE_MCP_PORT ?? "3000", 10);
const HOST = process.env.BRAZE_MCP_HOST ?? "127.0.0.1";

const parseArgs = (): { transport: "stdio" | "http" } => {
  const args = process.argv.slice(2);
  const transportIndex = args.indexOf("--transport");

  if (transportIndex >= 0 && args[transportIndex + 1]) {
    const value = args[transportIndex + 1];
    if (value === "stdio" || value === "http") {
      return { transport: value };
    }
  }

  return { transport: "stdio" };
};

async function runStdio(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function runHttp(): Promise<void> {
  const server = createMcpServer();
  const app = createMcpExpressApp({ host: HOST });

  app.use(bearerAuth());

  const transport = new StreamableHTTPServerTransport();

  app.post("/mcp", async (req, res) => {
    await transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", async (req, res) => {
    await transport.handleRequest(req, res);
  });

  app.delete("/mcp", async (req, res) => {
    await transport.handleRequest(req, res);
  });

  await server.connect(transport);

  app.listen(PORT, HOST, () => {
    console.error(`Braze MCP server listening on http://${HOST}:${PORT}/mcp`);
  });
}

async function main(): Promise<void> {
  const { transport } = parseArgs();

  switch (transport) {
    case "http":
      await runHttp();
      break;
    case "stdio":
    default:
      await runStdio();
      break;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`MCP server error: ${message}`);
  process.exit(1);
});
