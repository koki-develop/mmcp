import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { z } from "zod";

export const mcpServerSchema = z.object({
  command: z.string().min(1),
  args: z.array(z.string().min(1)),
  env: z.record(z.string().min(1), z.string()).default({}),
});

export type MCPServer = z.infer<typeof mcpServerSchema>;

export const configSchema = z.object({
  agents: z.array(z.string().min(1)).default([]),
  mcpServers: z.record(z.string().min(1), mcpServerSchema).default({}),
});

export type Config = z.infer<typeof configSchema>;

export type LoadConfigParams = {
  path: string;
};

export function defaultConfigPath(): string {
  const home = os.homedir();
  return path.join(home, ".mmcp.json");
}

export function loadConfig(params: LoadConfigParams): Config {
  if (!fs.existsSync(params.path)) {
    return { mcpServers: {}, agents: [] };
  }

  const content = fs.readFileSync(params.path, "utf-8");
  const parsed = JSON.parse(content);
  return configSchema.parse(parsed);
}

export type SaveConfigParams = {
  path: string;
  config: Config;
};

export function saveConfig(params: SaveConfigParams): void {
  const content = `${JSON.stringify(params.config, null, 2)}\n`;
  fs.writeFileSync(params.path, content, "utf-8");
}
