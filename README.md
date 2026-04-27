# braze-cli

Unofficial Braze CLI and Claude Code skill for marketers and MarTech engineers.

## Monorepo layout

```
braze-cli/
├── packages/
│   ├── cli/    # TypeScript CLI
│   └── skill/  # Claude Code skill files and prompt templates
├── docs/
└── examples/
```

## Current status (v0.1 scaffold)

- ✅ Read-only command groups for campaigns, canvases, and segments (`list`, `get`)
- ✅ Config bootstrap at `~/.braze/config.yaml` via `braze auth init`
- ✅ Output modes: `table`, `json`, `yaml`
- ✅ Initial Claude Code skill docs and prompt templates

## Quick start

```bash
npm install
npm run build

# initialize config
node packages/cli/dist/index.js auth init

# run commands (requires BRAZE_API_KEY)
BRAZE_API_KEY=*** node packages/cli/dist/index.js campaigns list --output table
BRAZE_API_KEY=*** node packages/cli/dist/index.js canvases list --output json
```

## Notes

- API key lookup currently uses environment variables (`BRAZE_API_KEY` by default).
- Keychain-backed credential storage and write operations are planned for v0.5+.

## License

MIT
