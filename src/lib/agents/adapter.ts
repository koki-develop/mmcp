import type { Config } from "../config";

export interface AgentAdapter {
  readonly id: string;
  applyConfig(config: Config): void;
  configPath(): string;
}
