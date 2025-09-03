import { loadConfig, saveConfig } from "../lib/config";

export type AddCommandParams = {
  name: string;
  command: string;
  args: string[];

  configPath: string; // --config
  overwrite: boolean; // --overwrite
};

export function addCommand(params: AddCommandParams) {
  const config = loadConfig({ path: params.configPath });

  if (config.mcpServers[params.name] && !params.overwrite) {
    throw new Error(`Server with name "${params.name}" already exists.`);
  }

  config.mcpServers[params.name] = {
    command: params.command,
    args: params.args,
  };

  saveConfig({
    path: params.configPath,
    config,
  });
}
