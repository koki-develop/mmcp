import { describe, expect, test } from "bun:test";
import type { Config } from "../config";
import type { ClaudeCodeConfig } from "./claude-code";
import { mergeConfig } from "./claude-code";

describe("mergeConfig (claude-code)", () => {
  type Case = [
    title: string,
    agentConfig: ClaudeCodeConfig,
    mmcp: Config,
    expected: ClaudeCodeConfig,
  ];

  const cases: Case[] = [
    [
      "inserts new server into empty agent config",
      {},
      {
        agents: ["claude-code"],
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
      "overwrites existing server and drops unknown keys under that server",
      {
        mcpServers: {
          context7: { command: "old", args: ["-x"], env: {}, other: "stay" },
        },
      },
      {
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
      "supports names with dot and space",
      { mcpServers: {} },
      {
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
  ];

  test.each(cases)("%s", (_title, agentConfig, mmcp, expected) => {
    const out = mergeConfig(structuredClone(agentConfig), mmcp);
    expect(out).toEqual(expected);
  });
});
