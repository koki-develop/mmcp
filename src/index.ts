import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { addCommand } from "./commands/add";
import { removeCommand } from "./commands/remove";
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
  .option("--overwrite", "Overwrite if the server already exists", false)
  .action(
    (
      name: string,
      command: string,
      args: string[],
      options: {
        config: string;
        overwrite: boolean;
      },
    ) => {
      addCommand({
        name,
        command,
        args,
        configPath: options.config,
        overwrite: options.overwrite,
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

program.parse(process.argv);
