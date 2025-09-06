import ora from "ora";
import { supportedAgentIds } from "../lib/agents/registry";
import { loadConfig, saveConfig } from "../lib/config";

export type AgentsRemoveCommandParams = {
  names: string[];
  configPath: string; // --config
};

export function agentsRemoveCommand(params: AgentsRemoveCommandParams) {
  const config = loadConfig({ path: params.configPath });

  // Validate agents
  const supported = supportedAgentIds();
  const unsupported = params.names.filter((n) => !supported.includes(n));
  if (unsupported.length > 0) {
    throw new Error(`Unsupported agents: ${unsupported.join(", ")}.`);
  }

  // Validate registered
  const missing = params.names.filter((n) => !config.agents.includes(n));
  if (missing.length > 0) {
    throw new Error(`Agents not registered in config: ${missing.join(", ")}.`);
  }

  // Remove and save
  config.agents = config.agents.filter((n) => !params.names.includes(n));
  saveConfig({
    path: params.configPath,
    config,
  });
  ora().succeed(`Removed agents: ${params.names.join(", ")}`);
}
