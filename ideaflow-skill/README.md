# Ideaflow Skill

Ideaflow is a lightweight idea management system for OpenClaw. Capture ideas, move them through stages, and keep a clean vault from brainstorming to shipped.

## Setup the vault

Create the default vault folder structure:

```
~/.openclaw/workspace/ideas-vault/ideas/
├── workbench/
├── shipped/
└── trash/
```

Use `_template-idea.md` as a starting point for new ideas.

## Using Ideaflow

- Create a new idea via `/idea [text]` or by asking naturally.
- Move ideas between stages (Brainstorming → Validating → Greenlit → In Development → Shipped).
- Soft-delete ideas into `trash/` and restore if needed.

## Optional slash commands addon

If you want slash commands for listing and browsing ideas, install the optional addon:

```
openclaw plugins install @benmillerat/ideaflow-commands
```

This adds:
- `/ideas` — list recent ideas
- `/ideas_status` — browse ideas by stage
