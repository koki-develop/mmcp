import chalk from "chalk";
import ora from "ora";
import { getAgentById, supportedAgentIds } from "../lib/agents/registry";
import { loadConfig } from "../lib/config";

export type ApplyCommandParams = {
  agents: string[];
  configPath: string; // --config (mmcp)
};

export function applyCommand(params: ApplyCommandParams) {
  const config = loadConfig({ path: params.configPath });

  // Determine target agents
  const agentIds = (() => {
    if (params.agents.length > 0) return params.agents;
    return config.agents;
  })();
  if (agentIds.length === 0) {
    throw new Error(
      "No target agents specified. Use --agents or set agents in mmcp config.",
    );
  }

  // Validate agents
  const supported = supportedAgentIds();
  const unsupported = agentIds.filter((id) => !supported.includes(id));
  if (unsupported.length > 0) {
    throw new Error(`Unsupported agents: ${unsupported.join(", ")}.`);
  }

  const adapters = agentIds.map((id) => getAgentById(id));
  for (const adapter of adapters) {
    const spinner = ora().start(`Applying config: ${adapter.id}...`);
    adapter.applyConfig(config);
    spinner.succeed(`${adapter.id} ${chalk.dim(adapter.configPath())}`);
  }
}
