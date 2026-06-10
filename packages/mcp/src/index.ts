#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { createMcpServer } from "./server.js";
import { bearerAuth } from "./auth.js";

const PORT = parseInt(process.env.BRAZE_MCP_PORT ?? "3000", 10);
const HOST = process.env.BRAZE_MCP_HOST ?? "127.0.0.1";

const parseArgs = (): { transport: "stdio" | "http"; allowWrites: boolean } => {
  const args = process.argv.slice(2);
  const transportIndex = args.indexOf("--transport");
  let transport: "stdio" | "http" = "stdio";
  const allowWrites = args.includes("--allow-writes");

  if (transportIndex >= 0 && args[transportIndex + 1]) {
    const value = args[transportIndex + 1];
    if (value === "stdio" || value === "http") {
      transport = value;
    }
  }

  return { transport, allowWrites };
};

async function runStdio(allowWrites: boolean): Promise<void> {
  const server = createMcpServer({ allowWrites });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function runHttp(allowWrites: boolean): Promise<void> {
  const app = createMcpExpressApp({ host: HOST });

  app.use(bearerAuth());

  // Stateless transport: a fresh server + transport is created per request so
  // that multiple cloud clients can connect concurrently without sharing
  // session state. See the MCP Streamable HTTP "stateless mode" pattern.
  app.post("/mcp", async (req, res) => {
    const server = createMcpServer({ allowWrites });
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    res.on("close", () => {
      void transport.close();
      void server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`MCP request error: ${message}`);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  // Stateless mode does not support server-initiated SSE streams or session
  // teardown, so GET/DELETE are not allowed.
  const methodNotAllowed = (_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed in stateless mode." },
      id: null,
    });
  };
  app.get("/mcp", methodNotAllowed);
  app.delete("/mcp", methodNotAllowed);

  app.listen(PORT, HOST, () => {
    console.error(`Braze MCP server listening on http://${HOST}:${PORT}/mcp`);
  });
}

async function main(): Promise<void> {
  const { transport, allowWrites } = parseArgs();

  switch (transport) {
    case "http":
      await runHttp(allowWrites);
      break;
    case "stdio":
    default:
      await runStdio(allowWrites);
      break;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`MCP server error: ${message}`);
  process.exit(1);
});
