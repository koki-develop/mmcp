import { Argument, Command, Option } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { addCommand } from "./commands/add";
import { agentsAddCommand } from "./commands/agents-add";
import { agentsRemoveCommand } from "./commands/agents-remove";
import { applyCommand } from "./commands/apply";
import { listCommand } from "./commands/list";
import { removeCommand } from "./commands/remove";
import { supportedAgentIds } from "./lib/agents/registry";
import { defaultConfigPath } from "./lib/config";

const program = new Command();

program.name("mmcp").version(packageJson.version);

program
  .command("add")
  .description("Add a mcp server")
  .argument("<name>", "Name of the server")
  .argument("<command>", "Command to start the server")
  .argument("[args...]", "Arguments for the command")
  .option("-e, --env <key=value...>", "Environment variables for the server")
  .option("-c, --config <path>", "Path to config file", defaultConfigPath())
  .option("-f, --force", "Overwrite if the server already exists", false)
  .action(
    (
      name: string,
      command: string,
      args: string[],
      options: {
        config: string;
        force: boolean;
        env?: string[];
      },
    ) => {
      const env: Record<string, string> = {};
      for (const item of options.env ?? []) {
        const [key, value, ...rest] = item.split("=");
        if (!key || !value || rest.length > 0) {
          throw new Error(
            `Invalid --env value: ${JSON.stringify(item)}. Use KEY=VALUE format.`,
          );
        }
        env[key] = value;
      }
      addCommand({
        name,
        command,
        args,
        env,
        configPath: options.config,
        force: options.force,
      });
    },
  );

program
  .command("remove")
  .description("Remove a mcp server")
  .argument("<name>", "Name of the server")
  .option("-c, --config <path>", "Path to config file", defaultConfigPath())
  .action((name: string, options: { config: string }) => {
    removeCommand({
      name,
      configPath: options.config,
    });
  });

program
  .command("apply")
  .description("Apply mmcp config to an agent")
  .addOption(
    new Option("--agents <name...>", "Target agents").choices(
      supportedAgentIds(),
    ),
  )
  .option("-c, --config <path>", "Path to config file", defaultConfigPath())
  .action((options: { agents?: string[]; config: string }) => {
    applyCommand({ agents: options.agents ?? [], configPath: options.config });
  });

program
  .command("list")
  .description("List configured mcp servers")
  .option("-c, --config <path>", "Path to config file", defaultConfigPath())
  .option("--json", "Output mcpServers as JSON", false)
  .action((options: { config: string; json: boolean }) => {
    listCommand({ configPath: options.config, json: options.json });
  });

// agents subcommands
const agents = program
  .command("agents")
  .description("Manage apply target agents");

agents
  .command("add")
  .description("Add apply target agents")
  .addArgument(
    new Argument("<name...>", "Agent names").choices(supportedAgentIds()),
  )
  .option("-c, --config <path>", "Path to config file", defaultConfigPath())
  .action((names: string[], options: { config: string }) => {
    agentsAddCommand({ names, configPath: options.config });
  });

agents
  .command("remove")
  .description("Remove apply target agents")
  .addArgument(
    new Argument("<name...>", "Agent names").choices(supportedAgentIds()),
  )
  .option("-c, --config <path>", "Path to config file", defaultConfigPath())
  .action((names: string[], options: { config: string }) => {
    agentsRemoveCommand({ names, configPath: options.config });
  });

program.parseAsync(process.argv).catch((err) => {
  if (process.env.DEBUG === "true") {
    console.error(err);
  } else {
    console.error(String(err));
  }
  process.exit(1);
});
