# Codex MCP integration for Braze OSS

Add this to your Codex MCP configuration to connect to the Braze OSS MCP server.

## Local (stdio) mode

```json
{
  "mcpServers": {
    "braze-oss": {
      "command": "npx",
      "args": ["@braze-oss/mcp", "--transport", "stdio"],
      "env": {
        "BRAZE_API_KEY": "${BRAZE_API_KEY}",
        "BRAZE_WORKSPACE": "dev"
      }
    }
  }
}
```

## Remote (HTTP) mode

Run the server:

```bash
npx @braze-oss/mcp --transport http
```

Then configure Codex to connect:

```json
{
  "mcpServers": {
    "braze-oss": {
      "url": "http://your-host:3000/mcp",
      "headers": {
        "Authorization": "Bearer ${BRAZE_MCP_API_KEY}"
      }
    }
  }
}
```

### Available tools

| Tool | Description |
|---|---|
| `braze_list_campaigns` | List all campaigns |
| `braze_get_campaign` | Get campaign details by ID |
| `braze_list_canvases` | List all canvases |
| `braze_get_canvas` | Get canvas details by ID |
| `braze_list_segments` | List all segments |
| `braze_get_segment` | Get segment details by ID |
| `braze_list_content_blocks` | List all content blocks |
| `braze_get_content_block` | Get content block details by ID |
