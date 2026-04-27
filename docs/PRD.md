# PRD: braze-skill

**Tagline:** A first-class Braze CLI and Claude Code agent skill for marketers and MarTech engineers who'd rather work in a terminal than a tab.
**Author:** Haseeb Tariq
**Status:** Draft v0.2 implementation checkpoint
**Last updated:** April 27, 2026

## Implementation progress snapshot

### Delivered in repository

- Monorepo structure with CLI + skill package
- Workspace config lifecycle and default-workspace switching
- Env + optional keychain auth path
- Read surfaces for campaigns, canvases, segments, and content blocks
- CSV-driven content block bulk update (with dry-run)
- Skill templates for weekly reporting, segment audits, and release checks

### In progress / next

- Campaign/canvas trigger and schedule operations
- Catalog and users coverage
- Currents validation commands
- CI release recipes and end-to-end integration tests
