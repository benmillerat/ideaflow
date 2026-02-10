/**
 * Ideaflow - Auto-reply Commands
 * 
 * /ideas - List 6 most recent ideas
 * /ideas_status - Stage browser with inline buttons
 */

import { readdirSync, statSync, readFileSync } from "fs";
import { join, basename } from "path";

const STAGES = [
  { name: "Brainstorming", emoji: "💭", key: "brainstorming" },
  { name: "Validating", emoji: "✅", key: "validating" },
  { name: "Greenlit", emoji: "🚀", key: "greenlit" },
  { name: "In Development", emoji: "🔨", key: "in-development" },
  { name: "Shipped", emoji: "✨", key: "shipped" },
  { name: "Paused / Archived", emoji: "⏸️", key: "archived" },
];

interface IdeaNote {
  filename: string;
  title: string;
  shortTitle: string;
  stage: string;
  summary: string;
  modified: number;
  location: "workbench" | "shipped" | "trash";
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  
  const fm: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      fm[key] = val;
    }
  }
  return fm;
}

function getStageEmoji(stage: string): string {
  const s = STAGES.find(x => 
    x.name.toLowerCase() === stage.toLowerCase() ||
    x.key === stage.toLowerCase() ||
    stage.toLowerCase().includes(x.key)
  );
  return s?.emoji || "📝";
}

function readIdeas(vaultBase: string): IdeaNote[] {
  const ideas: IdeaNote[] = [];
  
  for (const loc of ["workbench", "shipped", "trash"] as const) {
    try {
      const dir = join(vaultBase, loc);
      for (const file of readdirSync(dir)) {
        if (!file.endsWith(".md")) continue;
        const path = join(dir, file);
        const stats = statSync(path);
        try {
          const content = readFileSync(path, "utf-8");
          const fm = parseFrontmatter(content);
          ideas.push({
            filename: file,
            title: fm.title || basename(file, ".md"),
            shortTitle: fm.short_title || (fm.title?.slice(0, 18)) || basename(file, ".md").slice(0, 18),
            stage: fm.stage || "Brainstorming",
            summary: fm.summary || "",
            modified: stats.mtimeMs,
            location: loc,
          });
        } catch {}
      }
    } catch {}
  }
  return ideas;
}

function getIdeasByStage(ideas: IdeaNote[], key: string): IdeaNote[] {
  const stage = STAGES.find(s => s.key === key);
  if (!stage) return [];
  return ideas.filter(i => {
    const n = i.stage.toLowerCase();
    return n === stage.name.toLowerCase() || n.includes(stage.key);
  });
}

function countByStage(ideas: IdeaNote[]): Record<string, number> {
  const c: Record<string, number> = {};
  for (const s of STAGES) c[s.key] = getIdeasByStage(ideas, s.key).length;
  return c;
}

export default function (api: any) {
  const defaultVaultPath = `${process.env.HOME}/.openclaw/workspace/ideas-vault/ideas`;
  const getVaultPath = () => api.config?.plugins?.entries?.["ideaflow-commands"]?.config?.vaultPath || defaultVaultPath;

  api.registerCommand({
    name: "ideas",
    description: "List 6 most recent ideas",
    acceptsArgs: false,
    requireAuth: true,
    handler: () => {
      const path = getVaultPath();
      const ideas = readIdeas(path);
      if (!ideas.length) return { text: `📭 No ideas yet. Path: ${path}` };
      
      ideas.sort((a, b) => b.modified - a.modified);
      const lines = ideas.slice(0, 6).map(i => `${i.location === "trash" ? "🗑️" : getStageEmoji(i.stage)} ${i.shortTitle}`);
      return { text: `**Recent Ideas:**\n${lines.join("\n")}` };
    },
  });

  api.registerCommand({
    name: "ideas_status",
    description: "Browse ideas by stage",
    acceptsArgs: true,
    requireAuth: true,
    handler: (ctx: any) => {
      const args = ctx.args?.trim() || "";
      const allIdeas = readIdeas(getVaultPath());
      const ideas = allIdeas.filter(i => i.location !== "trash");

      // Stage drill-down
      if (args.startsWith("stage:")) {
        const key = args.slice(6);
        const stage = STAGES.find(s => s.key === key);
        const list = getIdeasByStage(ideas, key).sort((a, b) => b.modified - a.modified);
        
        if (!list.length) return { text: `${stage?.emoji || "📝"} **${stage?.name || key}**: Empty` };

        const top = list.slice(0, 5);
        const rows: any[][] = [];
        for (let i = 0; i < top.length; i += 2) {
          const row: any[] = [{ text: top[i].shortTitle, callback_data: `/ideas_status idea:${top[i].filename}` }];
          if (top[i + 1]) row.push({ text: top[i + 1].shortTitle, callback_data: `/ideas_status idea:${top[i + 1].filename}` });
          rows.push(row);
        }
        if (list.length > 5) {
          const last = rows[rows.length - 1];
          if (last.length < 2) last.push({ text: "...", callback_data: `/ideas_status list:${key}` });
          else rows.push([{ text: "...", callback_data: `/ideas_status list:${key}` }]);
        }

        return {
          text: `${stage?.emoji || "📝"} **${stage?.name || key}** (${list.length}):`,
          channelData: { telegram: { buttons: rows } },
        };
      }

      // Idea summary
      if (args.startsWith("idea:")) {
        const file = args.slice(5);
        const idea = ideas.find(i => i.filename === file);
        if (!idea) return { text: "❌ Idea not found." };
        return { text: `${getStageEmoji(idea.stage)} **${idea.title}**\n\n${idea.summary || "_No summary._"}\n\n📁 ${idea.stage}` };
      }

      // Full list
      if (args.startsWith("list:")) {
        const key = args.slice(5);
        const stage = STAGES.find(s => s.key === key);
        const list = getIdeasByStage(ideas, key).sort((a, b) => b.modified - a.modified);
        const lines = list.map((i, n) => `${n + 1}. ${i.title}`);
        return { text: `${stage?.emoji || "📝"} **${stage?.name || key}** (${list.length}):\n\n${lines.join("\n")}` };
      }

      // Default: stage buttons
      const counts = countByStage(ideas);
      const rows: any[][] = [];
      
      // Short labels for buttons (max ~18 chars to fit 2 per row)
      const shortLabels: Record<string, string> = {
        "brainstorming": "Brainstorm",
        "validating": "Validating", 
        "greenlit": "Greenlit",
        "in-development": "In Dev",
        "shipped": "Shipped",
        "archived": "Archived",
      };
      
      for (let i = 0; i < STAGES.length; i += 2) {
        const row: any[] = [];
        const s1 = STAGES[i];
        const label1 = shortLabels[s1.key] || s1.name;
        row.push({ text: `${s1.emoji} ${label1} (${counts[s1.key]})`, callback_data: `/ideas_status stage:${s1.key}` });
        if (STAGES[i + 1]) {
          const s2 = STAGES[i + 1];
          const label2 = shortLabels[s2.key] || s2.name;
          row.push({ text: `${s2.emoji} ${label2} (${counts[s2.key]})`, callback_data: `/ideas_status stage:${s2.key}` });
        }
        rows.push(row);
      }

      const total = ideas.filter(i => i.location !== "trash").length;
      const result = {
        text: `📊 **Ideas Status** (${total} total):`,
        channelData: { telegram: { buttons: rows } },
      };
      return result;
    },
  });
}
