import { describe, expect, test } from "bun:test";
import type { Config } from "../config";
import type { CursorMcpConfig } from "./cursor";
import { mergeConfig } from "./cursor";

describe("mergeConfig (cursor)", () => {
  type Case = [
    title: string,
    agentConfig: CursorMcpConfig,
    mmcp: Config,
    expected: CursorMcpConfig,
  ];

  const cases: Case[] = [
    [
      "inserts new server into empty agent config",
      {},
      {
        mode: "merge",
        agents: ["cursor"],
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
          context7: {
            command: "old",
            args: ["-x"],
            env: {},
            trust: "all",
            headers: { X: "1" },
          },
        },
      },
      {
        mode: "merge",
        agents: [],
        mcpServers: {
          context7: { command: "npx", args: ["-y"], env: { K: "V" } },
        },
      },
      {
        mcpServers: {
          context7: {
            command: "npx",
            args: ["-y"],
            env: { K: "V" },
            trust: "all",
            headers: { X: "1" },
          },
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
          "with space": { command: "node", args: ["a.js"], env: {} },
        },
      },
      {
        mcpServers: {
          "name.with dot": { command: "npx", args: [], env: { K: "V" } },
          "with space": { command: "node", args: ["a.js"], env: {} },
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
