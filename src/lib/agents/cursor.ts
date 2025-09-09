import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Config } from "../config";
import type { AgentAdapter } from "./adapter";

export type CursorMcpConfig = {
  mcpServers?: {
    [name: string]: Record<string, unknown>;
  };
  // keep any other top-level keys
  [key: string]: unknown;
};

export class CursorAgent implements AgentAdapter {
  readonly id = "cursor" as const;

  applyConfig(config: Config): void {
    const agentConfig = this._loadConfig();
    const next = mergeConfig(agentConfig, config);
    this._saveConfig(next);
  }

  configPath(): string {
    const home = os.homedir();
    return path.join(home, ".cursor", "mcp.json");
  }

  private _loadConfig(): CursorMcpConfig {
    const pathname = this.configPath();
    if (!fs.existsSync(pathname)) {
      return { mcpServers: {} };
    }
    const content = fs.readFileSync(pathname, "utf-8");
    return JSON.parse(content);
  }

  private _saveConfig(config: CursorMcpConfig): void {
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
  agentConfig: CursorMcpConfig,
  config: Config,
): CursorMcpConfig {
  const servers = Object.entries(config.mcpServers);
  if (servers.length === 0) {
    return agentConfig;
  }

  if (!agentConfig.mcpServers) {
    agentConfig.mcpServers = {};
  }

  for (const [name, server] of Object.entries(config.mcpServers)) {
    const existing = agentConfig.mcpServers[name] ?? {};
    agentConfig.mcpServers[name] = {
      ...existing,
      ...server,
    };
  }

  return agentConfig;
}
