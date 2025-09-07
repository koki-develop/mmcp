import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Config } from "../config";
import type { AgentAdapter } from "./adapter";

export type GeminiSettings = {
  mcpServers?: {
    [name: string]: Record<string, unknown>;
  };
  // keep any other top-level keys
  [key: string]: unknown;
};

export class GeminiCliAgent implements AgentAdapter {
  readonly id = "gemini-cli" as const;

  applyConfig(config: Config): void {
    const agentConfig = this._loadConfig();

    const next = mergeConfig(agentConfig, config);
    if (JSON.stringify(next) === JSON.stringify(agentConfig)) {
      return;
    }

    this._saveConfig(next);
  }

  private _configPath(): string {
    const home = os.homedir();
    return path.join(home, ".gemini", "settings.json");
  }

  private _loadConfig(): GeminiSettings {
    const pathname = this._configPath();
    if (!fs.existsSync(pathname)) {
      return { mcpServers: {} };
    }

    const content = fs.readFileSync(pathname, "utf-8");
    return JSON.parse(content);
  }

  private _saveConfig(config: GeminiSettings): void {
    const pathname = this._configPath();
    const dir = path.dirname(pathname);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const content = `${JSON.stringify(config, null, 2)}\n`;
    fs.writeFileSync(pathname, content, "utf-8");
  }
}

export function mergeConfig(
  agentConfig: GeminiSettings,
  config: Config,
): GeminiSettings {
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
      command: server.command,
      args: server.args,
      env: server.env,
    } as Record<string, unknown>;
  }

  return agentConfig;
}
