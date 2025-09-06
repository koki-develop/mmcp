import ora from "ora";
import { loadConfig, saveConfig } from "../lib/config";

export type RemoveCommandParams = {
  name: string;
  configPath: string; // --config
};

export function removeCommand(params: RemoveCommandParams) {
  const config = loadConfig({ path: params.configPath });

  if (!config.mcpServers[params.name]) {
    throw new Error(`Server with name "${params.name}" does not exist.`);
  }

  delete config.mcpServers[params.name];
  saveConfig({
    path: params.configPath,
    config,
  });
  ora().succeed(`Removed server: "${params.name}"`);
}
