import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Config, MCPServer } from "../config";
import type { AgentAdapter } from "./adapter";

type ClaudeCodeConfig = {
  mcpServers?: {
    [name: string]: unknown;
  };
  [key: string]: unknown;
};

export class ClaudeCodeAgent implements AgentAdapter<ClaudeCodeConfig> {
  readonly id = "claude-code" as const;

  loadConfig(): ClaudeCodeConfig {
    const pathname = this._configPath();
    if (!fs.existsSync(pathname)) {
      return { mcpServers: {} };
    }
    const content = fs.readFileSync(pathname, "utf-8");
    return JSON.parse(content);
  }

  saveConfig(config: ClaudeCodeConfig): void {
    const pathname = this._configPath();
    const content = `${JSON.stringify(config, null, 2)}\n`;
    fs.writeFileSync(pathname, content, "utf-8");
  }

  mergeWithMmcp(params: {
    mmcpConfig: Config;
    agentConfig: ClaudeCodeConfig;
  }): ClaudeCodeConfig {
    const next: ClaudeCodeConfig = {
      ...params.agentConfig,
    };
    if (!next.mcpServers) {
      next.mcpServers = {};
    }

    for (const [name, server] of Object.entries(params.mmcpConfig.mcpServers)) {
      next.mcpServers[name] = this._toClaudeServer(server);
    }

    return next;
  }

  private _configPath(): string {
    const home = os.homedir();
    return path.join(home, ".claude.json");
  }

  private _toClaudeServer(server: MCPServer): {
    command: string;
    args: string[];
  } {
    return { command: server.command, args: server.args };
  }
}
