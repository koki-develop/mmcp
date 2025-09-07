import { loadConfig } from "../lib/config";

export type AgentsListCommandParams = {
  configPath: string; // --config
  json: boolean; // --json
};

export function agentsListCommand(params: AgentsListCommandParams) {
  const config = loadConfig({ path: params.configPath });

  if (params.json) {
    console.log(JSON.stringify({ agents: config.agents }, null, 2));
    return;
  }

  const agents = [...config.agents].sort((a, b) => a.localeCompare(b));
  for (const id of agents) {
    console.log(id);
  }
}
