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
  const servers = Object.entries(config.mcpServers);
  if (servers.length === 0) {
    return content;
  }

  const patches = buildPatches(config);
  return updateTomlValues(content, patches);
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
