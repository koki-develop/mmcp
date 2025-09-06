import { describe, expect, test } from "bun:test";
import type { Config } from "../config";
import { mergeConfig } from "./codex-cli";

describe("mergeConfig", () => {
  type Case = [title: string, input: string, config: Config, expected: string];

  const cases: Case[] = [
    [
      "insert into empty file (with env)",
      "",
      {
        agents: ["codex-cli"],
        mcpServers: {
          context7: {
            command: "npx",
            args: ["-y", "@upstash/context7-mcp@latest"],
            env: { API_KEY: "value" },
          },
        },
      },
      [
        "[mcp_servers.context7]",
        'command = "npx"',
        'args = ["-y", "@upstash/context7-mcp@latest"]',
        "",
        "[mcp_servers.context7.env]",
        'API_KEY = "value"',
        "",
      ].join("\n"),
    ],
    [
      "preserves other sections and appends new server",
      ["# header", "[other.section]", "x = 1", ""].join("\n"),
      {
        agents: [],
        mcpServers: {
          ctx: { command: "npx", args: [], env: {} },
        },
      },
      [
        "# header",
        "[other.section]",
        "x = 1",
        "",
        "[mcp_servers.ctx]",
        'command = "npx"',
        "args = []",
        "",
      ].join("\n"),
    ],
    [
      "updates existing server and keeps unknown keys",
      [
        "[mcp_servers.context7]",
        'command = "old"',
        'args = ["-x"]',
        'other = "stay"',
        "",
      ].join("\n"),
      {
        agents: [],
        mcpServers: {
          context7: { command: "npx", args: ["-y"], env: {} },
        },
      },
      [
        "[mcp_servers.context7]",
        'command = "npx"',
        'args = ["-y"]',
        'other = "stay"',
        "",
      ].join("\n"),
    ],
    [
      "quoted section names are handled",
      ['[mcp_servers."name.with dot"]', 'command = "old"', ""].join("\n"),
      {
        agents: [],
        mcpServers: {
          "name.with dot": { command: "new", args: [], env: {} },
        },
      },
      [
        '[mcp_servers."name.with dot"]',
        'command = "new"',
        "args = []",
        "",
      ].join("\n"),
    ],
    [
      "empty servers results in no change",
      "# nothing\n",
      { agents: [], mcpServers: {} },
      "# nothing\n",
    ],
  ];

  test.each(cases)("%s", (title, input, config, expected) => {
    const out = mergeConfig(input, config);
    expect(out).toEqual(expected);
  });
});
