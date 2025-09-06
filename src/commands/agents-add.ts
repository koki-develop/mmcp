import { supportedAgentIds } from "../lib/agents/registry";
import { loadConfig, saveConfig } from "../lib/config";

export type AgentsAddCommandParams = {
  names: string[];
  configPath: string; // --config
};

export function agentsAddCommand(params: AgentsAddCommandParams) {
  const config = loadConfig({ path: params.configPath });

  // Validate agents
  const supported = supportedAgentIds();
  const unsupported = params.names.filter((n) => !supported.includes(n));
  if (unsupported.length > 0) {
    throw new Error(`Unsupported agents: ${unsupported.join(", ")}.`);
  }

  // Determine which to append
  const toAppend: string[] = [];
  for (const agentId of params.names) {
    if (!config.agents.includes(agentId) && !toAppend.includes(agentId)) {
      toAppend.push(agentId);
    }
  }
  if (toAppend.length === 0) {
    // No-op
    saveConfig({ path: params.configPath, config });
    return;
  }

  // Append and save
  config.agents = [...config.agents, ...toAppend];
  saveConfig({
    path: params.configPath,
    config,
  });
}
