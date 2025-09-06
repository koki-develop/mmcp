import type { AgentAdapter } from "./adapter";
import { ClaudeCodeAgent } from "./claude-code";

const agents: AgentAdapter[] = [new ClaudeCodeAgent()];

export function getAgentById(id: string): AgentAdapter | undefined {
  return agents.find((a) => a.id === id);
}

export function supportedAgentIds(): string[] {
  return agents.map((a) => a.id);
}
