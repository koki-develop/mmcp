import { describe, expect, test } from "bun:test";
import type { Config } from "../config";
import { type GitHubCopilotCliConfig, mergeConfig } from "./github-copilot-cli";

describe("mergeConfig", () => {
  type Case = [
    title: string,
    agentConfig: GitHubCopilotCliConfig,
    config: Config,
    expected: GitHubCopilotCliConfig,
  ];

  const cases: Case[] = [
    [
      "should merge servers correctly",
      {
        mcpServers: {
          server1: {
            command: "cmd1",
            type: "local",
            tools: ["*"],
            args: [],
            env: {},
          },
        },
        otherProp: "value",
      },
      {
        agents: [],
        mcpServers: {
          server2: { command: "cmd2", env: {} },
        },
      },
      {
        mcpServers: {
          server1: {
            command: "cmd1",
            type: "local",
            tools: ["*"],
            args: [],
            env: {},
          },
          server2: {
            type: "local",
            tools: ["*"],
            command: "cmd2",
            env: {},
          },
        },
        otherProp: "value",
      },
    ],
    [
      "should handle empty servers",
      { otherProp: "value" },
      { agents: [], mcpServers: {} },
      { otherProp: "value" },
    ],
    [
      "should create mcpServers property if it doesn't exist",
      {},
      {
        agents: [],
        mcpServers: {
          server1: { command: "cmd1", env: {} },
        },
      },
      {
        mcpServers: {
          server1: {
            type: "local",
            tools: ["*"],
            command: "cmd1",
            env: {},
          },
        },
      },
    ],
    [
      "should merge server properties",
      {
        mcpServers: {
          server1: {
            type: "local",
            tools: ["*"],
            command: "cmd1",
            existing: true,
          },
        },
      },
      {
        agents: [],
        mcpServers: {
          server1: { args: ["--new"], command: "new-cmd", env: {} },
        },
      },
      {
        mcpServers: {
          server1: {
            existing: true,
            type: "local",
            tools: ["*"],
            args: ["--new"],
            command: "new-cmd",
            env: {},
          },
        },
      },
    ],
  ];

  test.each(cases)("%s", (_title, agentConfig, config, expected) => {
    const result = mergeConfig(structuredClone(agentConfig), config);
    expect(result).toEqual(expected);
  });
});
