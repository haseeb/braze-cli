# Example workflows

## Campaign inventory

```bash
BRAZE_API_KEY=*** node packages/cli/dist/index.js campaigns list --workspace dev --output json
```

## Canvas lookup

```bash
BRAZE_API_KEY=*** node packages/cli/dist/index.js canvases get <canvas-id> --workspace dev --output yaml
```

## Segment inventory

```bash
BRAZE_API_KEY=*** node packages/cli/dist/index.js segments list --workspace dev --output table
```
