import { describe, expect, test } from "bun:test";
import type { Config } from "../config";
import type { ClaudeDesktopConfig } from "./claude-desktop";
import { mergeConfig } from "./claude-desktop";

describe("mergeConfig (claude-desktop)", () => {
  type Case = [
    title: string,
    agentConfig: ClaudeDesktopConfig,
    mmcp: Config,
    expected: ClaudeDesktopConfig,
  ];

  const cases: Case[] = [
    [
      "inserts new server into empty agent config",
      {},
      {
        mode: "merge",
        agents: ["claude-desktop"],
        mcpServers: {
          context7: {
            command: "npx",
            args: ["-y", "@upstash/context7-mcp@latest"],
            env: {},
          },
        },
      },
      {
        mcpServers: {
          context7: {
            command: "npx",
            args: ["-y", "@upstash/context7-mcp@latest"],
            env: {},
          },
        },
      },
    ],
    [
      "preserves other top-level keys and existing servers",
      {
        theme: "dark",
        mcpServers: {
          foo: { command: "node", args: ["foo.js"], env: { A: "1" } },
        },
      },
      {
        mode: "merge",
        agents: [],
        mcpServers: {
          ctx: { command: "npx", args: [], env: {} },
        },
      },
      {
        theme: "dark",
        mcpServers: {
          foo: { command: "node", args: ["foo.js"], env: { A: "1" } },
          ctx: { command: "npx", args: [], env: {} },
        },
      },
    ],
    [
      "overwrites existing server and keeps unknown keys under that server",
      {
        mcpServers: {
          context7: { command: "old", args: ["-x"], env: {}, other: "stay" },
        },
      },
      {
        mode: "merge",
        agents: [],
        mcpServers: {
          context7: { command: "npx", args: ["-y"], env: {} },
        },
      },
      {
        mcpServers: {
          context7: { command: "npx", args: ["-y"], env: {}, other: "stay" },
        },
      },
    ],
    [
      "supports names with dot and space",
      { mcpServers: {} },
      {
        mode: "merge",
        agents: [],
        mcpServers: {
          "name.with dot": { command: "npx", args: [], env: { K: "V" } },
        },
      },
      {
        mcpServers: {
          "name.with dot": { command: "npx", args: [], env: { K: "V" } },
        },
      },
    ],
    [
      "empty mmcp servers results in no change",
      { mcpServers: { keep: { command: "x", args: [], env: {} } } },
      { mode: "merge", agents: [], mcpServers: {} },
      { mcpServers: { keep: { command: "x", args: [], env: {} } } },
    ],
    [
      "replaces all servers in replace mode",
      {
        mcpServers: {
          foo: { command: "node", args: ["foo.js"], env: { A: "1" } },
          bar: { command: "node", args: ["bar.js"], env: {} },
        },
      },
      {
        mode: "replace",
        agents: [],
        mcpServers: {
          context7: { command: "npx", args: ["-y"], env: {} },
        },
      },
      {
        mcpServers: {
          context7: { command: "npx", args: ["-y"], env: {} },
        },
      },
    ],
    [
      "preserves other top-level keys in replace mode",
      {
        theme: "dark",
        mcpServers: {
          foo: { command: "node", args: ["foo.js"], env: { A: "1" } },
        },
      },
      {
        mode: "replace",
        agents: [],
        mcpServers: {
          context7: { command: "npx", args: ["-y"], env: {} },
        },
      },
      {
        theme: "dark",
        mcpServers: {
          context7: { command: "npx", args: ["-y"], env: {} },
        },
      },
    ],
  ];

  test.each(cases)("%s", (_title, agentConfig, mmcp, expected) => {
    const out = mergeConfig(structuredClone(agentConfig), mmcp);
    expect(out).toEqual(expected);
  });
});
