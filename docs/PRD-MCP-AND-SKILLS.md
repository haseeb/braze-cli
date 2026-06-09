# PRD: Braze Cloud MCP Server + Open Skills Registry

**Status:** Draft v1.0 — planning only (no implementation in this document)
**Owner:** Haseeb Tariq
**Last updated:** 2026-06-09
**Audience:** The coding agent that will implement this, plus reviewers

> This project is unofficial and not affiliated with Braze, Inc. It is an
> open-source complement to Braze's own MCP server, optimized for
> cloud-based coding agents (Claude Code on the web, Codex, Goose, and
> similar harnesses).

---

## 0. TL;DR

We are evolving `braze-cli` from a terminal CLI into three coordinated
deliverables:

1. **`@braze-oss/mcp`** — an open-source **Braze MCP server** that runs well
   in **cloud coding agents** (Claude Code on the web, Codex, Goose, etc.),
   speaks **remote HTTP/SSE transport** (not just stdio), and reuses the
   existing CLI core. It wraps Braze REST endpoints **and** the new
   **AI/decisioning** surfaces (BrazeAI Decisioning Studio / OfferFit,
   content generation, Liquid).
2. **An Open Skills Registry** — a downloadable, portable catalog of
   Braze "skills" (prompt + workflow packs) that users can drop into
   Claude Code, Codex, Goose, and other agent harnesses. Open source,
   community-contributable.
3. **Glue** — a thin install/sync tool and docs site that lets a user go
   from "nothing" to "connected MCP + installed skills" in one command,
   from a cloud session.

The differentiator vs. the official Braze MCP: **cloud-first ergonomics,
write/change workflows that are safe-by-default, an AI-feature focus, and a
portable, multi-harness skills ecosystem.**

---

## 1. Background & research findings

### 1.1 The official Braze MCP server (what already exists)

Source: Braze docs and ecosystem listings (see References).

- **What it is:** A secure MCP bridge that lets AI tools (Claude, Cursor,
  Goose, VS Code, plus agent frameworks like OpenAI Agents SDK, LangChain,
  Vercel AI SDK) access **non-PII** Braze data for Q&A, trend analysis, and
  insights.
- **Distribution:** Python package `braze-mcp-server` on PyPI; run via
  `uvx --native-tls braze-mcp-server@latest` or `pip install`. **stdio
  transport.** Configured per-client with `BRAZE_API_KEY` + `BRAZE_BASE_URL`
  env vars. Currently **beta**.
- **Surface:** ~38–43 API functions across ~15–16 categories (campaigns,
  canvases, segments, attributes, events, KPIs, templates, catalogs, media
  library, etc.). **Read-focused**, with a **limited set of write**
  functions: `create_content_block` / `update_content_block`,
  `create_email_template` / `update_email_template`,
  `create_media_library_asset` — each gated behind a matching API-key
  permission.
- **Security posture:** Endpoints are restricted to **non-PII**. Braze
  recommends a **dedicated, read-only, non-PII API key**; any granted write
  permission *can* be exercised by the agent. Known **indirect
  prompt-injection** exposure on any tool that reads free-text fields.

### 1.2 Gaps / opportunities (where we add value)

| Gap in official MCP | Our opportunity |
| --- | --- |
| **stdio-only**, per-client manual JSON config | **Remote HTTP/SSE** transport + one-command connect, designed for **cloud** Claude Code / Codex sessions where stdio subprocesses are awkward |
| **Read-first**, thin write surface | Safe, **auditable change workflows** (dry-run, diff, approval gate, rollback) for the writes that matter to MarTech teams |
| Python only | **TypeScript** server that **reuses the existing CLI core** in this repo (one codebase: CLI + MCP) |
| No first-class **AI/decisioning** tooling | Tools for **BrazeAI Decisioning Studio (OfferFit)**, content generation, Liquid authoring/validation, and Catalyst-style optimization workflows |
| No portable **skills** ecosystem | **Open Skills Registry** installable into multiple harnesses (Claude Code, Codex, Goose, etc.) |
| No change-management guardrails | Built-in **approvals, audit log, environment scoping (dev/staging/prod)** |

### 1.3 The AI layer worth targeting

- **BrazeAI Decisioning Studio (formerly OfferFit, acquired 2025, ~$325M):**
  reinforcement-learning / contextual-bandit agents that autonomously
  experiment and pick the optimal action (journey, content, incentive,
  timing) **per individual**, replacing manual A/B testing.
- **Project Catalyst:** Braze's native agentic optimization vision for
  Journeys, Content, and Incentives.
- **Generative content / Liquid:** subject-line/body generation, variant
  creation, personalization via Liquid + Connected Content.

These are the "AI features done from the cloud" the user wants front and
center.

### 1.4 Existing repo (what we're building on)

- Monorepo: `packages/cli` (TypeScript CLI) + `packages/skill` (one Claude
  skill + templates).
- CLI covers read for campaigns/canvases/segments/content-blocks, plus a
  CSV content-block bulk update with `--dry-run`. Has a `BrazeClient` with
  retry/backoff, workspace config, env + keychain auth.
- **Note for implementer:** `packages/cli/src/lib/braze-client.ts` currently
  contains **duplicated/leftover class bodies** (two `listCampaigns`, a dead
  `get()` block after the real `post()` implementation). Clean this up as
  part of Phase 0 before extracting the shared core.

---

## 2. Goals & non-goals

### 2.1 Goals

1. Ship an **open-source MCP server** that connects from **cloud coding
   agents** with minimal setup and supports **safe change operations**.
2. Make **AI/decisioning** a first-class capability surface.
3. Build a **portable, downloadable Skills Registry** usable across Claude
   Code, Codex, Goose, and other harnesses.
4. Reuse the existing CLI core so CLI and MCP never drift.
5. Be **safe-by-default**: read-only unless explicitly elevated; every write
   is previewable, approvable, auditable, and (where possible) reversible.

### 2.2 Non-goals

- Replacing or reverse-engineering Braze's official MCP. We **complement**
  it and interoperate where sensible.
- Handling or exposing **PII**. Mirror Braze's non-PII stance.
- Building a hosted SaaS. We ship OSS; users self-host / run in their own
  cloud sessions. (A reference deploy is in scope; a managed service is not.)
- Shipping Braze's proprietary decisioning models. We orchestrate the
  **APIs/workflows**, not the models.

---

## 3. Personas & primary use cases

| Persona | Cloud-agent use case |
| --- | --- |
| Lifecycle marketer | "From my phone's Claude session, draft 3 subject-line variants for the winback canvas and stage them as content blocks for approval." |
| MarTech engineer | "Connect MCP to staging, diff content blocks vs. prod, open a PR-style change set, apply after approval." |
| Growth PM | "Summarize last 14 days of campaign KPIs and flag canvases with no holdout." |
| Decisioning/CRM engineer | "Set up a Decisioning Studio experiment skeleton: candidate actions, reward metric, audience; report on learning progress." |
| Partner consultant | "Install the Braze skill pack into a client's Codex setup and run a workspace audit." |

---

## 4. Architecture

### 4.1 Target repo structure (after this PRD)

```
braze-cli/  (consider renaming the project umbrella to "braze-oss")
├── packages/
│   ├── core/      # NEW: shared Braze client, auth, types, endpoint wrappers,
│   │              #      retry, redaction, audit log (extracted from cli)
│   ├── cli/       # existing CLI, refactored to depend on core
│   ├── mcp/       # NEW: MCP server (stdio + HTTP/SSE), tool definitions
│   └── skill/     # existing skill, folded into the registry format
├── registry/      # NEW: Open Skills Registry (skills + manifest + index)
│   ├── skills/
│   │   ├── <skill-id>/
│   │   │   ├── skill.json        # portable manifest (schema below)
│   │   │   ├── SKILL.md          # Claude Code / Agent Skills format
│   │   │   ├── prompts/          # reusable prompts/templates
│   │   │   └── adapters/         # per-harness shims (codex, goose, ...)
│   │   └── ...
│   ├── index.json   # generated catalog of all skills
│   └── schema/      # JSON Schema for skill.json + validation
├── tools/
│   └── installer/   # NEW: `braze-oss skills add <id>` cross-harness installer
├── docs/            # PRDs, site content
└── examples/
```

### 4.2 Shared core (`packages/core`)

Extract from `packages/cli`: `BrazeClient`, types, credentials/config,
output formatting, CSV. Add:

- **Endpoint coverage map** (read + write) mirroring Braze REST.
- **Redaction layer**: strip/deny PII fields before anything reaches an
  LLM (enforce non-PII even if an endpoint could return it).
- **Change engine**: `plan()` → `diff()` → `apply()` → `audit()` with
  optional `rollback()` where the API allows.
- **Audit log**: append-only JSONL of every call (tool, params hash,
  workspace, result status, actor).

### 4.3 MCP server (`packages/mcp`)

- **Language:** TypeScript (`@modelcontextprotocol/sdk`). One codebase with
  CLI/core.
- **Transports:** **stdio** (parity with local clients) **and HTTP +
  Streamable HTTP/SSE** for cloud agents. HTTP is the headline feature.
- **Auth:**
  - Local/stdio: `BRAZE_API_KEY` + `BRAZE_BASE_URL` env (parity with
    official server, so existing configs port over).
  - Remote/HTTP: bearer token in front of the server; the Braze key never
    leaves the server. Support **multiple workspaces** selected per-request.
  - **Read-only by default.** Writes require the server to be launched with
    an explicit `--allow-writes` flag **and** the API key to carry the
    matching permission **and** (for `apply`) a confirmation token from a
    prior `plan`.
- **Tool catalog (initial):**
  - *Read:* `campaigns.list/get`, `canvases.list/get`,
    `segments.list/get`, `content_blocks.list/get`, `templates.email.list/get`,
    `catalogs.list/get`, `kpis.get`, `events.list`.
  - *Change (gated):* `content_blocks.plan_update` / `apply_update`,
    `email_templates.plan` / `apply`, `media_library.create`,
    `catalogs.plan_items` / `apply_items`.
  - *AI:* see §5.
  - *Meta:* `workspace.list/use`, `audit.tail`, `health`.
- **Every write tool returns a human-readable diff + a confirmation token;**
  `apply_*` refuses without it.
- **MCP resources/prompts:** expose canned prompts (audit, weekly report)
  as MCP prompts so any client gets them for free.

### 4.4 Compatibility

- Mirror official env var names so users migrating from the Python server
  change only the command.
- Provide ready-to-paste config snippets for: Claude Code (web + desktop),
  Codex, Goose, Cursor, VS Code, and generic OpenAI Agents SDK / LangChain.

---

## 5. AI / decisioning feature surface (the headline)

These are the "AI features done from the cloud" tools. Each is a thin,
safe orchestration over Braze AI capabilities — **we do not host models.**

1. **Content generation & variants**
   - `ai.generate_copy` — subject lines, push/SMS/email body variants for a
     given campaign/canvas + tone/length constraints. Output is **staged**
     as draft content blocks/templates, never auto-sent.
   - `ai.localize` — produce locale variants of a content block.
2. **Liquid authoring & validation**
   - `liquid.lint` — static-check Liquid/Connected Content for errors and
     unsafe personalization (missing defaults, undefined attributes).
   - `liquid.preview` — render with sample non-PII context.
3. **Decisioning Studio (OfferFit) workflows**
   - `decisioning.experiment.scaffold` — given an objective/reward metric,
     candidate actions, and audience, produce a **plan** for a Decisioning
     Studio experiment (no live launch without approval).
   - `decisioning.report` — summarize learning progress / lift / action
     distribution for an existing decisioning use case (read-only).
4. **Optimization advisor (Catalyst-style)**
   - `optimize.audit` — scan canvases/campaigns for missing holdouts, no
     send-time optimization, stale segments, no frequency capping; return
     prioritized recommendations.
5. **Insight synthesis**
   - `insights.weekly` — pull KPIs and produce a narrative report
     (wins/risks/actions) — productizes the existing skill template.

**Guardrails for all AI tools:** outputs are drafts/plans; nothing is sent
or launched to live users without an explicit gated `apply`. All inputs are
PII-redacted before leaving the server.

---

## 6. Open Skills Registry (the "skills section")

### 6.1 Concept

A directory of **portable, downloadable skill packs** that any user can add
to their agent of choice. Open source so the community can contribute. Think
"awesome-list meets installable manifests."

### 6.2 Portable skill manifest (`skill.json`) — proposed schema

```jsonc
{
  "id": "braze-weekly-report",
  "name": "Braze Weekly Performance Report",
  "version": "1.0.0",
  "description": "Pull KPIs and synthesize a wins/risks/actions report.",
  "category": "reporting",
  "requires": { "mcp": "@braze-oss/mcp >=1.0", "permissions": ["kpis.read"] },
  "entry": "SKILL.md",
  "prompts": ["prompts/weekly-performance.md"],
  "harnesses": {
    "claude-code": { "type": "agent-skill", "path": "SKILL.md" },
    "codex":       { "type": "instructions", "adapter": "adapters/codex.md" },
    "goose":       { "type": "recipe", "adapter": "adapters/goose.yaml" },
    "generic":     { "type": "prompt", "path": "SKILL.md" }
  },
  "tags": ["braze", "reporting", "kpi"],
  "license": "MIT",
  "author": "community"
}
```

- `SKILL.md` follows the **Claude Code Agent Skills** convention (the format
  the existing `packages/skill/SKILL.md` already uses) so it Just Works in
  Claude Code.
- `adapters/` hold thin per-harness translations (Codex instructions, Goose
  recipe YAML, etc.). A skill is valid with only `generic` + `claude-code`;
  other harnesses are best-effort.
- `index.json` at the registry root is **generated** from all `skill.json`
  files and powers the docs-site catalog and the installer.

> **Harness note:** the user named "claude code or codex, hermes, openclaw,
> goose etc." Treat these as a **pluggable harness list**. Implement
> `claude-code`, `codex`, and `goose` first (well-documented formats),
> ship a `generic` prompt fallback for everything else, and make adding a
> new harness adapter a documented, contribution-friendly step. Where a
> named harness (e.g., "hermes", "openclaw") has no public skill format yet,
> it falls back to `generic` until an adapter is contributed.

### 6.3 Initial skill catalog (seed set)

| Skill id | Purpose | Maps to |
| --- | --- | --- |
| `braze-weekly-report` | KPI narrative report | `insights.weekly` |
| `braze-segment-audit` | Segment hygiene/governance | read tools |
| `braze-release-checklist` | Pre-launch validation | `optimize.audit` |
| `braze-content-block-refactor` | Bulk content-block edits w/ diff+approval | change engine |
| `braze-copy-studio` | Generate + stage copy variants | `ai.generate_copy` |
| `braze-liquid-doctor` | Lint/preview Liquid | `liquid.lint/preview` |
| `braze-decisioning-setup` | Scaffold a Decisioning Studio experiment | `decisioning.*` |

(The first three already exist as templates in `packages/skill` and just
need to be reformatted into the manifest structure.)

### 6.4 Installer (`tools/installer`)

- `braze-oss skills list` — read `index.json`, show catalog.
- `braze-oss skills add <id> --harness claude-code|codex|goose|generic` —
  copy the right files into the harness's expected location
  (e.g., `.claude/skills/<id>/` for Claude Code), wiring in the MCP config
  snippet if missing.
- `braze-oss skills update <id>` / `remove <id>`.
- Idempotent, dry-run capable, prints exactly what it writes.

---

## 7. Phased roadmap

Each phase is independently shippable and has explicit acceptance criteria.

### Phase 0 — Foundation cleanup (S)

- Fix the duplicated/dead code in `braze-client.ts`.
- Extract `packages/core` from `packages/cli`; CLI depends on core.
- Add PII redaction utility + audit-log scaffolding to core.
- **Done when:** CLI behaves identically on top of `core`; lint/test/build
  green; redaction + audit covered by unit tests.

### Phase 1 — MCP server, read-only, stdio + HTTP (M)

- Implement `packages/mcp` with the read tool catalog over `core`.
- Both stdio and HTTP/SSE transports; bearer auth on HTTP.
- Config snippets for Claude Code (web/desktop), Codex, Goose, Cursor.
- **Done when:** "List my Braze campaigns" works from a **cloud** Claude
  Code session via HTTP; from Claude Desktop via stdio; non-PII enforced;
  integration tests against a mock Braze API pass.

### Phase 2 — Safe change engine (M)

- `plan/diff/apply/audit` for content blocks + email templates + media
  library; confirmation-token gating; `--allow-writes` flag.
- CLI gets the same `plan/apply` UX for parity.
- **Done when:** a content-block edit can be planned (diff shown), approved,
  applied, and found in the audit log; apply without a valid token is
  refused; rollback works where the API supports it.

### Phase 3 — AI/decisioning tools (L)

- Ship `ai.generate_copy`, `liquid.lint/preview`, `optimize.audit`,
  `insights.weekly`, `decisioning.scaffold/report`.
- All outputs are drafts/plans behind the Phase 2 gate.
- **Done when:** from a cloud session a user can generate staged copy
  variants and run an optimization audit; no live send/launch without
  explicit apply; decisioning scaffold produces a reviewable plan.

### Phase 4 — Open Skills Registry + installer (M)

- Define `skill.json` schema + validator; convert seed skills; generate
  `index.json`.
- Build the cross-harness installer (`skills add/list/update/remove`).
- Docs site / README catalog; contribution guide for new skills + adapters.
- **Done when:** a user runs one command to install a skill into Claude Code
  **and** Codex, the skill invokes MCP tools end-to-end, and a new skill can
  be contributed via PR with CI validating its manifest.

### Phase 5 — Polish & ecosystem (ongoing)

- More harness adapters; more skills; reference cloud deployment (container
  + one-click); telemetry opt-in; semantic-version release pipeline;
  publish `@braze-oss/mcp` to npm.

**Rough sizing:** Phase 0–2 are the critical path to "connect from cloud and
make safe changes." Phases 3–4 deliver the AI + skills differentiation.

---

## 8. Security & safety requirements

- **Non-PII invariant:** redaction layer is mandatory and tested; deny-list
  of fields; fail closed.
- **Least privilege:** read-only default; writes require flag + key
  permission + confirmation token. Document the recommended dedicated,
  scoped API key.
- **Prompt-injection mitigation:** treat all Braze free-text content
  (descriptions, message bodies, tickets) as untrusted; never let it
  silently trigger writes; surface a confirmation step.
- **Auditability:** every tool call logged; secrets never logged.
- **Environment scoping:** explicit dev/staging/prod workspace selection;
  prod writes require an extra confirmation.
- **Supply chain:** signed releases, pinned deps, CI security scan on the
  registry and packages.

## 9. Success metrics

- Time-to-first-successful-MCP-call from a cloud session < 5 min.
- ≥ 7 seed skills installable into ≥ 3 harnesses.
- 100% of writes pass through plan→approve→audit (no un-gated write path).
- Zero PII fields observed in MCP responses (automated test gate).

## 10. Open questions / decisions for the user

1. **Project/package naming** — keep `braze-cli` or rebrand the umbrella to
   `braze-oss`? (Affects npm scope `@braze-oss/*`.)
2. **Harness priority** — confirm the first-class set. Proposed:
   **Claude Code, Codex, Goose**, with a generic fallback for
   "hermes/openclaw/etc." Which of those named harnesses are must-haves vs.
   nice-to-have?
3. **Hosting** — is a reference container/deploy in scope now, or keep it
   bring-your-own for v1?
4. **Decisioning depth** — how deep into Decisioning Studio (OfferFit) APIs
   can we go given current API availability? (May start as
   scaffold+report-only until endpoints are confirmed.)
5. **Language for MCP** — confirm TypeScript (reuse this repo) vs. matching
   Braze's Python. Recommendation: **TypeScript**.

---

## 11. References

- Braze MCP server overview — https://www.braze.com/docs/user_guide/brazeai/mcp_server
- Available API functions — https://www.braze.com/docs/user_guide/brazeai/mcp_server/available_api_functions
- Set up the MCP server — https://www.braze.com/docs/user_guide/brazeai/mcp_server/setup
- Use the MCP server — https://www.braze.com/docs/user_guide/brazeai/mcp_server/usage
- Introducing the Braze MCP Server — https://www.braze.com/resources/articles/introducing-braze-mcp-server
- `braze-mcp-server` (PyPI) — https://pypi.org/project/braze-mcp-server/
- Braze API guide — https://www.braze.com/docs/api/home
- Developer guide home — https://www.braze.com/docs/developer_guide/home
- What is OfferFit — https://www.braze.com/resources/articles/what-is-offerfit
- Braze acquires OfferFit — https://www.braze.com/press-releases/braze-announces-agreement-to-acquire-offerfit
- BrazeAI — https://www.braze.com/docs/user_guide/brazeai
- Community Braze Claude skill — https://claudskills.com/skills/braze/
- StackOne Braze MCP connector listing — https://www.stackone.com/connectors/braze/mcp/
- Braze MCP connector risk (PromptArmor) — https://www.promptarmor.com/connectors/braze-mcp-server
