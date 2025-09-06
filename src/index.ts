import { Command, Option } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { addCommand } from "./commands/add";
import { applyCommand } from "./commands/apply";
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
  .option("-c, --config <path>", "Path to config file", defaultConfigPath())
  .option("--force", "Overwrite if the server already exists", false)
  .action(
    (
      name: string,
      command: string,
      args: string[],
      options: {
        config: string;
        force: boolean;
      },
    ) => {
      addCommand({
        name,
        command,
        args,
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
    new Option("--agents <name...>", "Target agents")
      .choices(supportedAgentIds())
      .makeOptionMandatory(true),
  )
  .option("-c, --config <path>", "Path to config file", defaultConfigPath())
  .action((options: { agents: string[]; config: string }) => {
    applyCommand({ agents: options.agents, configPath: options.config });
  });

program.parse(process.argv);
