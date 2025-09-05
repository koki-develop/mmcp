import type { AgentAdapter } from "./adapter";
import { ClaudeCodeAgent } from "./claude-code";

const agents: AgentAdapter<unknown>[] = [new ClaudeCodeAgent()];

export function getAgentById(id: string): AgentAdapter<unknown> | undefined {
  return agents.find((a) => a.id === id);
}

export function supportedAgentIds(): string[] {
  return agents.map((a) => a.id);
}
