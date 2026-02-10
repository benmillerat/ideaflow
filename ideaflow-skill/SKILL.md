---
name: idea
description: "Idea management system for capturing, organizing, and tracking ideas from spark to shipped. Use when user wants to capture a new idea, browse existing ideas, check idea status, move ideas between stages, or manage their ideas vault. Trigger on /idea or any request about managing, viewing, or organizing ideas. (Optional addon: @benmillerat/ideaflow-commands provides /ideas and /ideas_status slash commands.)"
---

# Ideaflow

Version 1.0.0

Capture and manage ideas from fragment to finished product.

## Configuration & Vault Path

- Config file: `~/.openclaw/ideaflow.json`
- Structure:
```json
{
  "initialized": true,
  "vaultPath": "~/.openclaw/workspace/ideas-vault/ideas"
}
```
- On first interaction, check if the config file exists.
  - No config = first run → show welcome, run setup, create config.
  - Config exists = skip setup, use the stored `vaultPath`.

All file operations must use the configured `vaultPath` read from the config.

### Default Vault Path

During setup, offer the default path `~/.openclaw/workspace/ideas-vault/ideas`, but allow a custom path. Store the final choice in the config.

## First-Run Setup Flow

1. Check for `~/.openclaw/ideaflow.json`.
2. If missing → Welcome message → Ask about vault location (offer default or custom) → Create folders → Create config file.
3. After setup, offer the optional addon:
   > **Optional:** Want quick-access slash commands (`/ideas`, `/ideas_status`)?
   > Install: `openclaw plugins install @benmillerat/ideaflow-commands`
   > Reply **install** or **skip**.
4. If exists → Read `vaultPath` from config → Proceed normally.

## Folder Structure (configured vaultPath)

```
<vaultPath>/
├── workbench/     ← Active ideas (all stages except Shipped)
├── shipped/       ← Completed ideas (trophy case 🏆)
└── trash/         ← Soft-deleted ideas (recoverable)
```

## Stages (emoji derived, not stored)

| Stage | Emoji |
|-------|-------|
| Brainstorming | 💭 |
| Validating | ✅ |
| Greenlit | 🚀 |
| In Development | 🔨 |
| Shipped | ✨ |
| Paused / Archived | ⏸️ |

## Commands

- `/idea [text]` — Create new idea (agent-assisted: generate titles, summary)
- `/ideas` — List 6 most recent (auto-reply, no AI)
- `/ideas_status` — Stage browser with buttons (auto-reply, no AI)

> Note: `/ideas` and `/ideas_status` are available when the optional **@benmillerat/ideaflow-commands** addon is installed.

## Creating Ideas (`/idea`)

1. Generate `title` (max ~30 chars) from description
2. Generate `short_title` (max ~18 chars) for Telegram buttons
3. Generate `summary` (1-2 sentences)
4. Create file in `<vaultPath>/workbench/` with frontmatter:

```yaml
---
title: Recipe-Database
short_title: Recipe DB
stage: Brainstorming
summary: "A searchable database for personal recipes..."
summary_updated: 2026-02-09T14:30:00
created: 2026-02-09
---
```

## Stage Movement

Via conversation:
- "Move the Weather App **note** to validating"
- "Move the Recipe DB **idea** to greenlit"

Update frontmatter `stage` field. File stays in workbench.

### Moving to Shipped

1. Move file: `<vaultPath>/workbench/X.md` → `<vaultPath>/shipped/X.md`
2. Scan vault for links to old path
3. Update links to new path
4. Update `stage: Shipped`

## Summary Staleness

Compare file mtime vs `summary_updated`. If stale:
> ⚠️ Summary may be outdated. Reply 'update' to regenerate.

## Deletion

| User says | Action |
|-----------|--------|
| "Delete the X idea" | Soft delete → `<vaultPath>/trash/` |
| "Permanently delete X" | Confirm → hard delete |

## Moving the Vault

When the user says "Move my ideas vault to [new path]":

1. Confirm the move.
2. Move all files from the current configured `vaultPath` to the new location.
3. Update `~/.openclaw/ideaflow.json` with the new `vaultPath`.
4. Confirm completion.

## Guardrails

### "Ship" Ambiguity

When user says "ship [X]" without "note" or "idea":

> ⚠️ DO NOT assume deployment. ASK:
> "Do you mean move the idea note to shipped, or actually release/deploy something?"

### Title Stability

- **New idea (no explicit title):** Generate a fitting, short title.
- **Updating existing idea:** NEVER change the title — only add/update notes and content.
- **Rename:** Only when user explicitly asks to rename (e.g., "rename this idea to X").

This keeps naming predictable and user-controlled.

### Deletion Safety

- "Delete" → soft delete (recoverable)
- "Permanently delete" → require confirmation

### Empty Trash

When user asks to "empty the trash" / "clear trash" / "delete everything in trash":

1. List all files in `<vaultPath>/trash/` folder
2. Show confirmation prompt with ALL affected ideas:
   > "Are you sure? This will **permanently delete** 3 ideas: Weather-App, Baking-App, Dancing-App"
3. Wait for explicit confirmation before proceeding
4. Only then: `rm <vaultPath>/trash/*.md`

**Never auto-empty trash without confirmation.**
