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
    const cmdline: string[] = [];
    if (server.command != null) {
      cmdline.push(server.command);
      if (server.args != null) {
        cmdline.push(...server.args);
      }
    } else if (server.url != null) {
      cmdline.push(server.url);
    }

    if (cmdline.length === 0) {
      console.log(name);
    } else {
      console.log(`${name}: ${cmdline.join(" ")}`);
    }
  }
}
