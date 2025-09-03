import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { addCommand } from "./commands/add";

const program = new Command();

program.name("mmcp").version(packageJson.version);

program
  .command("add")
  .description("Add a mcp server")
  .argument("<name>", "Name of the server")
  .argument("<command>", "Command to start the server")
  .argument("[args...]", "Arguments for the command")
  .action((name: string, command: string, args: string[]) => {
    addCommand({ name, command, args });
  });

program.parse(process.argv);
