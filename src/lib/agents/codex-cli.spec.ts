import { describe, expect, test } from "bun:test";
import type { Config } from "../config";
import { mergeConfig } from "./codex-cli";

describe("mergeConfig", () => {
  type Case = {
    title: string;
    input: string;
    config: Config;
    expected: string;
  };

  const cases: Case[] = [
    {
      title: "insert into empty file (with env)",
      input: "",
      config: {
        agents: ["codex-cli"],
        mcpServers: {
          context7: {
            command: "npx",
            args: ["-y", "@upstash/context7-mcp@latest"],
            env: { API_KEY: "value" },
          },
        },
      },
      expected: [
        "[mcp_servers.context7]",
        'command = "npx"',
        'args = ["-y", "@upstash/context7-mcp@latest"]',
        "",
        "[mcp_servers.context7.env]",
        'API_KEY = "value"',
        "",
      ].join("\n"),
    },
    {
      title: "preserves other sections and appends new server",
      input: ["# header", "[other.section]", "x = 1", ""].join("\n"),
      config: {
        agents: [],
        mcpServers: {
          ctx: { command: "npx", args: [], env: {} },
        },
      },
      expected: [
        "# header",
        "[other.section]",
        "x = 1",
        "",
        "[mcp_servers.ctx]",
        'command = "npx"',
        "args = []",
        "",
      ].join("\n"),
    },
    {
      title: "updates existing server and keeps unknown keys",
      input: [
        "[mcp_servers.context7]",
        'command = "old"',
        'args = ["-x"]',
        'other = "stay"',
        "",
      ].join("\n"),
      config: {
        agents: [],
        mcpServers: {
          context7: { command: "npx", args: ["-y"], env: {} },
        },
      },
      expected: [
        "[mcp_servers.context7]",
        'command = "npx"',
        'args = ["-y"]',
        'other = "stay"',
        "",
      ].join("\n"),
    },
    {
      title: "quoted section names are handled",
      input: ['[mcp_servers."name.with dot"]', 'command = "old"', ""].join(
        "\n",
      ),
      config: {
        agents: [],
        mcpServers: {
          "name.with dot": { command: "new", args: [], env: {} },
        },
      },
      expected: [
        '[mcp_servers."name.with dot"]',
        'command = "new"',
        "args = []",
        "",
      ].join("\n"),
    },
    {
      title: "empty servers results in no change",
      input: "# nothing\n",
      config: { agents: [], mcpServers: {} },
      expected: "# nothing\n",
    },
  ];

  test.each(cases)("%s", ({ title, input, config, expected }) => {
    const out = mergeConfig(input, config);
    expect(out).toEqual(expected);
  });
});
