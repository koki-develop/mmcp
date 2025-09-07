import type { AgentAdapter } from "./adapter";
import { ClaudeCodeAgent } from "./claude-code";
import { ClaudeDesktopAgent } from "./claude-desktop";
import { CodexCliAgent } from "./codex-cli";
import { CursorAgent } from "./cursor";
import { GeminiCliAgent } from "./gemini-cli";

const agents: AgentAdapter[] = [
  new ClaudeCodeAgent(),
  new ClaudeDesktopAgent(),
  new CodexCliAgent(),
  new GeminiCliAgent(),
  new CursorAgent(),
];

export function getAgentById(id: string): AgentAdapter | undefined {
  return agents.find((a) => a.id === id);
}

export function supportedAgentIds(): string[] {
  return agents.map((a) => a.id);
}
