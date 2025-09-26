import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Config } from "../config";
import { CopilotCliAgent, mergeConfig } from "./copilot-cli";

describe("CopilotCliAgent", () => {
  let tempDir: string;
  let agent: CopilotCliAgent;
  let originalHome: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mmcp-test-"));
    originalHome = process.env.HOME || os.homedir();
    // Mock os.homedir() to return our temp directory by setting HOME env var
    process.env.HOME = tempDir;

    agent = new CopilotCliAgent();
  });

  afterEach(() => {
    process.env.HOME = originalHome;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test("id should be copilot-cli", () => {
    expect(agent.id).toBe("copilot-cli");
  });

  test("configPath should return correct path", () => {
    const configPath = agent.configPath();
    expect(configPath).toEndWith(".copilot/mcp-config.json");
  });

  test("applyConfig should create config file if it doesn't exist", () => {
    const config: Config = {
      agents: [],
      mcpServers: {
        "test-server": {
          command: "test-command",
          args: ["--test"],
          env: {},
        },
      },
    };

    agent.applyConfig(config);

    const configPath = agent.configPath();
    expect(fs.existsSync(configPath)).toBe(true);

    const content = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(content);
    expect(parsed.mcpServers["test-server"]).toEqual({
      type: "local",
      tools: ["*"],
      args: ["--test"],
      command: "test-command",
      env: {},
    });
  });

  test("applyConfig should merge with existing config", () => {
    const configPath = agent.configPath();
    const dir = path.dirname(configPath);
    fs.mkdirSync(dir, { recursive: true });

    const existingConfig = {
      mcpServers: {
        "existing-server": {
          command: "existing-command",
        },
      },
      otherProperty: "value",
    };
    fs.writeFileSync(configPath, JSON.stringify(existingConfig), "utf-8");

    const config: Config = {
      agents: [],
      mcpServers: {
        "new-server": {
          command: "new-command",
          args: ["--new"],
          env: {},
        },
      },
    };

    agent.applyConfig(config);

    const content = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(content);
    expect(parsed.mcpServers["existing-server"]).toEqual({
      command: "existing-command",
      type: "local",
      tools: ["*"],
      args: [],
      env: {},
    });
    expect(parsed.mcpServers["new-server"]).toEqual({
      type: "local",
      tools: ["*"],
      args: ["--new"],
      command: "new-command",
      env: {},
    });
    expect(parsed.otherProperty).toBe("value");
  });
});

describe("mergeConfig", () => {
  test("should merge servers correctly", () => {
    const agentConfig = {
      mcpServers: {
        server1: { command: "cmd1" },
      },
      otherProp: "value",
    };

    const config: Config = {
      agents: [],
      mcpServers: {
        server2: { command: "cmd2", env: {} },
      },
    };

    const result = mergeConfig(agentConfig, config);

    expect(result.mcpServers?.server1).toEqual({
      command: "cmd1",
      type: "local",
      tools: ["*"],
      args: [],
      env: {},
    });
    expect(result.mcpServers?.server2).toEqual({
      type: "local",
      tools: ["*"],
      args: [],
      command: "cmd2",
      env: {},
    });
    expect(result.otherProp).toBe("value");
  });

  test("should handle empty servers", () => {
    const agentConfig = { otherProp: "value" };
    const config: Config = { agents: [], mcpServers: {} };

    const result = mergeConfig(agentConfig, config);

    expect(result).toEqual({ otherProp: "value", mcpServers: {} });
  });

  test("should create mcpServers property if it doesn't exist", () => {
    const agentConfig = {};
    const config: Config = {
      agents: [],
      mcpServers: {
        server1: { command: "cmd1", env: {} },
      },
    };

    const result = mergeConfig(agentConfig, config);

    expect(result.mcpServers?.server1).toEqual({
      type: "local",
      tools: ["*"],
      args: [],
      command: "cmd1",
      env: {},
    });
  });

  test("should merge server properties", () => {
    const agentConfig = {
      mcpServers: {
        server1: { command: "cmd1", existing: true },
      },
    };

    const config: Config = {
      agents: [],
      mcpServers: {
        server1: { args: ["--new"], command: "new-cmd", env: {} },
      },
    };

    const result = mergeConfig(agentConfig, config);

    expect(result.mcpServers?.server1).toEqual({
      existing: true,
      type: "local",
      tools: ["*"],
      args: ["--new"],
      command: "new-cmd",
      env: {},
    });
  });

  test("should fix incomplete existing servers", () => {
    const agentConfig = {
      mcpServers: {
        incomplete: { command: "incomplete-cmd" },
        partial: { command: "partial-cmd", type: "local" as const },
      },
    };

    const config: Config = {
      agents: [],
      mcpServers: {},
    };

    const result = mergeConfig(agentConfig, config);

    expect(result.mcpServers?.incomplete).toEqual({
      command: "incomplete-cmd",
      type: "local",
      tools: ["*"],
      args: [],
      env: {},
    });

    expect(result.mcpServers?.partial).toEqual({
      command: "partial-cmd",
      type: "local",
      tools: ["*"],
      args: [],
      env: {},
    });
  });
});
