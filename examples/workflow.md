# Example workflows

## 1) Workspace bootstrap

```bash
node packages/cli/dist/index.js auth init
node packages/cli/dist/index.js auth workspace-add --workspace prod --base-url https://rest.iad-01.braze.com
node packages/cli/dist/index.js auth workspace-use prod
```

## 2) Campaign inventory

```bash
BRAZE_API_KEY=*** node packages/cli/dist/index.js campaigns list --workspace prod --output json
```

## 3) Canvas lookup

```bash
BRAZE_API_KEY=*** node packages/cli/dist/index.js canvases get <canvas-id> --workspace prod --output yaml
```

## 4) Content block dry-run bulk update

```bash
node packages/cli/dist/index.js content-blocks bulk-update --from ./blocks.csv --workspace prod --dry-run --output table
```
