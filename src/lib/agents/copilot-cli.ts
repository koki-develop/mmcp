import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Config } from "../config";
import type { AgentAdapter } from "./adapter";

export type CopilotCliConfig = {
  mcpServers?: {
    [name: string]: {
      type?: "local" | "http" | "sse";
      command?: string;
      args?: string[];
      env?: Record<string, string>;
      tools?: string[];
      url?: string;
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
};

export class CopilotCliAgent implements AgentAdapter {
  readonly id = "copilot-cli" as const;

  applyConfig(config: Config): void {
    const agentConfig = this._loadConfig();
    const next = mergeConfig(agentConfig, config);
    this._saveConfig(next);
  }

  configPath(): string {
    const home = os.homedir();
    return path.join(home, ".copilot", "mcp-config.json");
  }

  private _loadConfig(): CopilotCliConfig {
    const pathname = this.configPath();
    if (!fs.existsSync(pathname)) {
      // Ensure the directory exists
      const dir = path.dirname(pathname);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return { mcpServers: {} };
    }
    const content = fs.readFileSync(pathname, "utf-8");
    return JSON.parse(content);
  }

  private _saveConfig(config: CopilotCliConfig): void {
    const pathname = this.configPath();
    const dir = path.dirname(pathname);

    // Ensure the directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const content = `${JSON.stringify(config, null, 2)}\n`;
    fs.writeFileSync(pathname, content, "utf-8");
  }
}

export function mergeConfig(
  agentConfig: CopilotCliConfig,
  config: Config,
): CopilotCliConfig {
  if (!agentConfig.mcpServers) {
    agentConfig.mcpServers = {};
  }

  // Add new servers from config
  for (const [name, server] of Object.entries(config.mcpServers)) {
    const existing = agentConfig.mcpServers[name] ?? {};
    agentConfig.mcpServers[name] = {
      type: "local",
      tools: ["*"],
      args: [],
      ...existing,
      ...server,
    };
  }

  // Ensure all existing servers have required fields
  for (const [_name, server] of Object.entries(agentConfig.mcpServers)) {
    if (typeof server === "object" && server !== null) {
      const serverObj = server as Record<string, unknown>;
      if (!serverObj.type) {
        serverObj.type = "local";
      }
      if (!serverObj.tools) {
        serverObj.tools = ["*"];
      }
      if (!serverObj.args) {
        serverObj.args = [];
      }
      if (!serverObj.env) {
        serverObj.env = {};
      }
    }
  }

  return agentConfig;
}
