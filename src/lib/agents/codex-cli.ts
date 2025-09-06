import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { updateTomlValues } from "@shopify/toml-patch";
import type { Config } from "../config";
import type { AgentAdapter } from "./adapter";

export class CodexCliAgent implements AgentAdapter {
  readonly id = "codex-cli" as const;

  applyConfig(config: Config): void {
    const servers = Object.entries(config.mcpServers);
    if (servers.length === 0) {
      return;
    }

    const content = this._loadConfig();
    const next = mergeConfig(content, config);
    if (next === content) {
      return;
    }

    this._saveConfig(next);
  }

  private _loadConfig(): string {
    const home = os.homedir();
    const dirPath = path.join(home, ".codex");
    if (!fs.existsSync(dirPath)) {
      return "";
    }

    const filePath = path.join(dirPath, "config.toml");
    if (!fs.existsSync(filePath)) {
      return "";
    }

    return fs.readFileSync(filePath, "utf-8");
  }

  private _saveConfig(config: string): void {
    const home = os.homedir();
    const dirPath = path.join(home, ".codex");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, "config.toml");
    fs.writeFileSync(filePath, config, "utf-8");
  }
}

export function mergeConfig(content: string, config: Config): string {
  const patches: [
    string[],
    number | string | boolean | undefined | (number | string | boolean)[],
  ][] = [];
  for (const [name, server] of Object.entries(config.mcpServers)) {
    patches.push([["mcp_servers", name, "command"], server.command]);
    patches.push([["mcp_servers", name, "args"], server.args]);
    for (const [k, v] of Object.entries(server.env)) {
      patches.push([["mcp_servers", name, "env", k], v]);
    }
  }

  return updateTomlValues(content, patches);
}
