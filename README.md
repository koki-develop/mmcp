# mmcp

[![NPM Version](https://img.shields.io/npm/v/mmcp)](https://www.npmjs.com/package/mmcp)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/koki-develop/mmcp/release-please.yml)](https://github.com/koki-develop/mmcp/actions/workflows/release-please.yml)
[![GitHub License](https://img.shields.io/github/license/koki-develop/mmcp)](./LICENSE)

Manage your MCP (Model Context Protocol) server definitions in one place and apply them to supported agents.

## Supported Agents

| Agent | id | Config Path |
| --- | --- | --- |
| [Claude Code](https://www.anthropic.com/claude-code) | `claude-code` | `~/.claude.json` |
| [Claude Desktop](https://claude.ai/download) | `claude-desktop` | macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`<br>Windows: `%APPDATA%\Claude\claude_desktop_config.json`<br>Linux: `~/.config/Claude/claude_desktop_config.json` |
| [Codex CLI](https://developers.openai.com/codex/cli) | `codex-cli` | `~/.codex/config.toml` |

More agents may be added in the future.

## Installation

```bash
npm install -g mmcp
```

## Getting Started

### 1. Add an MCP server to mmcp config

```bash
$ mmcp add [--env KEY=VALUE ...] [--config <path>] [--force] -- <name> <command> [args...]

# e.g.
$ mmcp add -- context7 npx -y @upstash/context7-mcp@latest
$ mmcp add -- everything npx -y @modelcontextprotocol/server-everything@latest
```

Adds the MCP server definition into `~/.mmcp.json`.

You can check configured servers anytime:

```console
$ mmcp list [--config <path>]
context7: npx -y @upstash/context7-mcp@latest
everything: npx -y @modelcontextprotocol/server-everything@latest
```

### 2. Choose target agents

Set which agents to apply to (e.g. `claude-code`).

```bash
$ mmcp agents add [--config <path>] <name...>

# e.g.
$ mmcp agents add claude-code
$ mmcp agents add codex-cli
```

List registered agents:

```console
$ mmcp agents list [--config <path>]
claude-code
codex-cli
```

### 3. Apply your mmcp config to the agents

```console
$ mmcp apply
```

That’s it. Your MCP servers from `~/.mmcp.json` will be written into the agent’s config (e.g. `~/.claude.json` for Claude Code).


## Configuration

mmcp stores configuration as JSON. Default location is `~/.mmcp.json`.

Example:

```json
{
  "agents": [
    "claude-code",
    "codex-cli"
  ],
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "@upstash/context7-mcp@latest"
      ],
      "env": {}
    },
    "everything": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-everything@latest"
      ],
      "env": {}
    }
  }
}
```

## License

[MIT](./LICENSE)
