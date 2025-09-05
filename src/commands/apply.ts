import { getAgentById } from "../lib/agents/registry";
import { loadConfig } from "../lib/config";

export type ApplyCommandParams = {
  agents: string[];
  configPath: string; // --config (mmcp)
};

export function applyCommand(params: ApplyCommandParams) {
  const mmcpConfig = loadConfig({ path: params.configPath });
  const adapters = params.agents.map((id) => {
    const adapter = getAgentById(id);
    if (!adapter) {
      throw new Error(`Unsupported agent: ${JSON.stringify(id)}.`);
    }
    return adapter;
  });

  for (const adapter of adapters) {
    const agentConfig = adapter.loadConfig();
    const merged = adapter.mergeWithMmcp({ agentConfig, mmcpConfig });
    adapter.saveConfig(merged);
  }
}
