# Cursor MCP integration for Braze OSS

## Local (stdio) mode

Add to Cursor settings (`.cursor/mcp.json`):

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

Then configure Cursor:

```json
{
  "mcpServers": {
    "braze-oss": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer ${BRAZE_MCP_API_KEY}"
      }
    }
  }
}
```

### Available tools

Read-only (always available):
| Tool | Description |
|---|---|
| `braze_list_campaigns` | List all campaigns |
| `braze_get_campaign` | Get campaign details |
| `braze_list_canvases` | List all canvases |
| `braze_get_canvas` | Get canvas details |
| `braze_list_segments` | List all segments |
| `braze_get_segment` | Get segment details |
| `braze_list_content_blocks` | List all content blocks |
| `braze_get_content_block` | Get content block details |

Write (requires `--allow-writes`):
| Tool | Description |
|---|---|
| `braze_plan_content_block` | Plan content block update (shows diff) |
| `braze_apply_content_block` | Apply planned update with token |
