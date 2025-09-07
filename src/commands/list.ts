import { loadConfig } from "../lib/config";

export type ListCommandParams = {
  configPath: string; // --config
  json: boolean; // --json
};

export function listCommand(params: ListCommandParams) {
  const config = loadConfig({ path: params.configPath });

  if (params.json) {
    console.log(JSON.stringify(config.mcpServers, null, 2));
    return;
  }

  const entries = Object.entries(config.mcpServers).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  for (const [name, server] of entries) {
    const cmdline = [server.command, ...server.args].join(" ");
    console.log(`${name}: ${cmdline}`);
  }
}
