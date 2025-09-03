import { Command } from "commander";
import packageJson from "../package.json" with { type: "json" };

const program = new Command();

program.name("mmcp").version(packageJson.version);

program.parse(process.argv);
