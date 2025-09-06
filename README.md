# mmcp

[![NPM Version](https://img.shields.io/npm/v/mmcp)](https://www.npmjs.com/package/mmcp)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/koki-develop/mmcp/release-please.yml)](https://github.com/koki-develop/mmcp/actions/workflows/release-please.yml)
[![GitHub License](https://img.shields.io/github/license/koki-develop/mmcp)](./LICENSE)

Manage your MCP (Model Context Protocol) server definitions in one place and apply them to supported agents.

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
```

Adds the MCP server definition into `~/.mmcp.json`.

### 2. Choose target agents

Set which agents to apply to (e.g. `claude-code`).

```bash
$ mmcp agents add|remove [--config <path>] <name...>

# e.g.
$ mmcp agents add claude-code
```

### 3. Apply your mmcp config to the agents

```bash
$ mmcp apply
```

That’s it. Your MCP servers from `~/.mmcp.json` will be written into the agent’s config (e.g. `~/.claude.json` for Claude Code).

## Configuration

mmcp stores configuration as JSON. Default location is `~/.mmcp.json`.

Example:

```json
{
  "agents": ["claude-code"],
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "env": {}
    }
  }
}
```

## Supported Agents

- `claude-code`: writes MCP servers into `~/.claude.json`
- `codex-cli`: writes MCP servers into `~/.codex/config.toml`

More agents may be added in the future.

## License

[MIT](./LICENSE)
