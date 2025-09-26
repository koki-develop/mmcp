import type { AgentAdapter } from "./adapter";
import { ClaudeCodeAgent } from "./claude-code";
import { ClaudeDesktopAgent } from "./claude-desktop";
import { CodexCliAgent } from "./codex-cli";
import { CopilotCliAgent } from "./copilot-cli";
import { CursorAgent } from "./cursor";
import { GeminiCliAgent } from "./gemini-cli";

const agents: AgentAdapter[] = [
  new ClaudeCodeAgent(),
  new ClaudeDesktopAgent(),
  new CodexCliAgent(),
  new CopilotCliAgent(),
  new CursorAgent(),
  new GeminiCliAgent(),
];

export function getAgentById(id: string): AgentAdapter {
  const agent = agents.find((a) => a.id === id);
  if (!agent) {
    throw new Error(`Unsupported agent: ${JSON.stringify(id)}.`);
  }
  return agent;
}

export function supportedAgentIds(): string[] {
  return agents.map((a) => a.id);
}
