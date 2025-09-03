import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { addCommand } from "./commands/add";

const program = new Command();

program.name("mmcp").version(packageJson.version);

program
  .command("add")
  .argument("<name>")
  .argument("<command>")
  .argument("[args...]")
  .action((name: string, command: string, args: string[]) => {
    addCommand({ name, command, args });
  });

program.parse(process.argv);
