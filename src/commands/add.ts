import { defaultConfigPath, loadConfig, saveConfig } from "../lib/config";

export type AddCommandParams = {
  name: string;
  command: string;
  args: string[];
};

export function addCommand(params: AddCommandParams) {
  // TODO: from `--config` flag
  const configPath = defaultConfigPath();

  const config = loadConfig({ path: configPath });

  if (config.mcpServers[params.name]) {
    throw new Error(`Server with name "${params.name}" already exists.`);
  }

  config.mcpServers[params.name] = {
    command: params.command,
    args: params.args,
  };

  saveConfig({
    path: configPath,
    config,
  });
}
