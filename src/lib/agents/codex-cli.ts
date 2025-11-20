import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { updateTomlValues } from "@shopify/toml-patch";
import type { Config } from "../config";
import type { AgentAdapter } from "./adapter";

export class CodexCliAgent implements AgentAdapter {
  readonly id = "codex-cli" as const;

  applyConfig(config: Config): void {
    const content = this._loadConfig();
    const next = mergeConfig(content, config);
    this._saveConfig(next);
  }

  configPath(): string {
    const home = os.homedir();
    return path.join(home, ".codex", "config.toml");
  }

  private _loadConfig(): string {
    const filePath = this.configPath();
    if (!fs.existsSync(filePath)) {
      return "";
    }
    return fs.readFileSync(filePath, "utf-8");
  }

  private _saveConfig(config: string): void {
    const filePath = this.configPath();
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, config, "utf-8");
  }
}

export function mergeConfig(content: string, config: Config): string {
  const servers = Object.entries(config.mcpServers);

  if (config.mode === "replace") {
    const stripped = stripMcpServerSections(content);
    if (servers.length === 0) {
      return stripped;
    }
    const patches = buildPatches(config);
    return updateTomlValues(stripped, patches);
  }

  if (config.mode === "merge") {
    if (servers.length === 0) {
      return content;
    }
    const patches = buildPatches(config);
    return updateTomlValues(content, patches);
  }

  throw new Error(`Unknown config mode: ${config.mode}`);
}

function stripMcpServerSections(content: string): string {
  const lines = content.split("\n");
  const kept: string[] = [];
  let skipping = false;

  // Allow inline comments (`#` or `;`) after section headers.
  const sectionRegex = /^\s*\[([^\]]+)]\s*(?:[#;].*)?$/;

  for (const line of lines) {
    const match = line.match(sectionRegex);
    if (match) {
      const header = match[1].trim();
      if (header === "mcp_servers" || header.startsWith("mcp_servers.")) {
        skipping = true;
        continue;
      }
      skipping = false;
      kept.push(line);
      continue;
    }

    if (skipping) {
      continue;
    }

    kept.push(line);
  }

  // Preserve original trailing newline behavior by trimming possible empty line
  // artifacts introduced during stripping.
  return kept.join("\n").replace(/\n+$/, (match) => "\n".repeat(match.length));
}

type PatchValue =
  | number
  | string
  | boolean
  | undefined
  | (number | string | boolean)[];

type Patch = [string[], PatchValue];

export function buildPatches(config: Config): Patch[] {
  const patches: Patch[] = [];

  const isPrimitive = (v: unknown): v is number | string | boolean =>
    typeof v === "string" || typeof v === "number" || typeof v === "boolean";

  const isPrimitiveArray = (v: unknown): v is (number | string | boolean)[] =>
    Array.isArray(v) && v.every((e) => isPrimitive(e));

  const walk = (base: string[], value: unknown): void => {
    if (value === undefined) {
      // explicit undefined -> clear key
      patches.push([base, undefined]);
      return;
    }

    if (isPrimitive(value) || isPrimitiveArray(value)) {
      patches.push([base, value as PatchValue]);
      return;
    }

    if (Array.isArray(value)) {
      // Array of non-primitives: try to set by index recursively.
      for (let i = 0; i < value.length; i++) {
        walk([...base, String(i)], value[i]);
      }
      return;
    }

    if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        walk([...base, k], v);
      }
    }
  };

  for (const [name, server] of Object.entries(config.mcpServers)) {
    // Server entry may contain arbitrary nested keys; walk them all.
    walk(["mcp_servers", name], server as unknown);
  }

  return patches;
}
