# Ideaflow

**Lightweight idea management for OpenClaw** 🦞 — capture ideas from spark to shipped.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-compatible-blue)](https://openclaw.ai)

## What is Ideaflow?

Ideaflow is a simple idea tracking system for [OpenClaw](https://openclaw.ai). It helps you capture fleeting ideas, organize them through stages, and track progress from brainstorming to shipped.

**Key features:**
- 📝 Quick idea capture via `/idea`
- 📁 Vault-based Markdown storage (works with Obsidian)
- 🚀 Stage progression: Brainstorming → Validating → Greenlit → In Development → Shipped
- 🔘 Optional slash commands with inline buttons
- ⚙️ Configurable vault location

## Packages

| Package | Purpose | Install |
|---------|---------|---------|
| **ideaflow-skill** | Core skill (agent instructions) | `clawhub install idea` |
| **ideaflow-commands** | Optional addon for `/ideas` and `/ideas_status` | `openclaw plugins install @benmillerat/ideaflow-commands` |

> **Note:** The addon slash commands (`/ideas`, `/ideas_status`) and inline buttons are **Telegram-specific**. The core `/idea` command works on any channel.

## Installation

### 1. Install the Skill (required)

```bash
clawhub install idea
```

Or manually copy `ideaflow-skill/` to your OpenClaw skills folder:
```bash
cp -r ideaflow-skill ~/.openclaw/workspace/skills/ideaflow
```

### 2. Install the Addon (optional)

For quick-access slash commands:

```bash
openclaw plugins install @benmillerat/ideaflow-commands
```

Or manually copy `ideaflow-commands/` to your extensions folder:
```bash
cp -r ideaflow-commands ~/.openclaw/workspace/.openclaw/extensions/ideaflow-commands
```

Then enable it in your config:
```json
{
  "plugins": {
    "entries": {
      "ideaflow-commands": { "enabled": true }
    }
  }
}
```

### 3. Restart OpenClaw

```bash
openclaw gateway restart
```

## First-Run Setup

On your first `/idea`, Ideaflow will:

1. **Welcome you** and ask for vault location
2. **Create folders**: `workbench/`, `shipped/`, `trash/`
3. **Save config** to `~/.openclaw/ideaflow.json`
4. **Offer the addon** (if not installed)

Default vault location: `~/.openclaw/workspace/ideas-vault/ideas`

## Usage

### Commands

| Command | Description | Requires Addon | Telegram Only |
|---------|-------------|----------------|---------------|
| `/idea [description]` | Create a new idea | No | No |
| `/ideas` | List 6 most recent ideas | Yes | Yes |
| `/ideas_status` | Browse ideas by stage with buttons | Yes | Yes |

### Natural Language

You can also use natural language:
- "I have an idea for a weather app"
- "Show me my ideas"
- "Move the weather app to greenlit"
- "Delete the baking app idea"

### Stages

| Stage | Emoji | Description |
|-------|-------|-------------|
| Brainstorming | 💭 | Raw ideas, just captured |
| Validating | ✅ | Checking feasibility |
| Greenlit | 🚀 | Approved, ready to build |
| In Development | 🔨 | Actively being worked on |
| Shipped | ✨ | Complete! |
| Paused / Archived | ⏸️ | On hold |

## Vault Structure

```
~/.openclaw/workspace/ideas-vault/ideas/
├── workbench/     ← Active ideas (all stages except Shipped)
├── shipped/       ← Completed ideas
└── trash/         ← Soft-deleted (recoverable)
```

### Idea File Format

```yaml
---
title: Weather App
short_title: Weather
stage: Brainstorming
summary: "A minimal weather app focused on rain forecasts."
summary_updated: 2026-02-10T12:00:00
created: 2026-02-10
---

# Weather App

A minimal weather app focused on rain forecasts.

## Notes

- Android tablet only
- Austria region
```

## Configuration

Config file: `~/.openclaw/ideaflow.json`

```json
{
  "initialized": true,
  "vaultPath": "~/.openclaw/workspace/ideas-vault/ideas"
}
```

### Moving Your Vault

Tell the agent: "Move my ideas vault to ~/notes/ideas"

The agent will:
1. Move all files to the new location
2. Update the config file
3. Confirm completion

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Submit a PR

[Open an issue](https://github.com/benmillerat/ideaflow/issues) for bugs or feature requests.

## License

MIT © 2026 Benjamin Miller

---

Made for [OpenClaw](https://openclaw.ai) 🦞
