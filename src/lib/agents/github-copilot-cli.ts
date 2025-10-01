import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Config } from "../config";
import type { AgentAdapter } from "./adapter";

export type GitHubCopilotCliConfig = {
  mcpServers?: {
    [name: string]: unknown;
  };
  [key: string]: unknown;
};

export class GitHubCopilotCliAgent implements AgentAdapter {
  readonly id = "github-copilot-cli" as const;

  applyConfig(config: Config): void {
    const agentConfig = this._loadConfig();
    const next = mergeConfig(agentConfig, config);
    this._saveConfig(next);
  }

  configPath(): string {
    const home = os.homedir();
    return path.join(home, ".copilot", "mcp-config.json");
  }

  private _loadConfig(): GitHubCopilotCliConfig {
    const pathname = this.configPath();
    if (!fs.existsSync(pathname)) {
      return { mcpServers: {} };
    }
    const content = fs.readFileSync(pathname, "utf-8");
    return JSON.parse(content);
  }

  private _saveConfig(config: GitHubCopilotCliConfig): void {
    const pathname = this.configPath();
    const dir = path.dirname(pathname);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const content = `${JSON.stringify(config, null, 2)}\n`;
    fs.writeFileSync(pathname, content, "utf-8");
  }
}

export function mergeConfig(
  agentConfig: GitHubCopilotCliConfig,
  config: Config,
): GitHubCopilotCliConfig {
  const servers = Object.entries(config.mcpServers);
  if (servers.length === 0) {
    return agentConfig;
  }

  if (!agentConfig.mcpServers) {
    agentConfig.mcpServers = {};
  }

  for (const [name, server] of servers) {
    const existing = agentConfig.mcpServers[name] ?? {};
    agentConfig.mcpServers[name] = {
      type: "local",
      tools: ["*"],
      ...existing,
      ...server,
    };
  }

  return agentConfig;
}
