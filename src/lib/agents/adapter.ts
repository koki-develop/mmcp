import type { Config } from "../config";

export interface AgentAdapter<TConfig> {
  // Unique identifier used by CLI, e.g. "claude-code"
  readonly id: string;

  // Load/save the agent-specific config shape.
  loadConfig(): TConfig;
  saveConfig(config: TConfig): void;

  // Merge mmcp config into agent config according to the agent's schema/policy.
  mergeWithMmcp(params: { agentConfig: TConfig; mmcpConfig: Config }): TConfig;
}
