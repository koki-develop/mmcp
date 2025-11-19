# Repository Guidelines

## Project Overview

mmcp is a CLI tool to manage MCP (Model Context Protocol) server definitions in one centralized config (`~/.mmcp.json`) and apply them to various agent configs (Claude Code, Claude Desktop, Cursor, Codex CLI, Gemini CLI, GitHub Copilot CLI).

## Essential Commands

```bash
# Development workflow
bun install                 # Install dependencies
bun run lint                # Run Biome linter (read-only)
bun run fmt                 # Format and fix with Biome (writes changes)
bun run typecheck           # TypeScript type checking
bun run build               # Build CLI to dist/index.js
bun test                    # Run all tests
bun test <file>             # Run specific test file

# Pre-commit check (same as CI)
bun run lint && bun run typecheck && bun run build && bun test
```

## Architecture

### Agent Adapter Pattern

The core architecture uses an **adapter pattern** for supporting multiple agents. Each agent has different config formats (JSON, TOML) and locations:

- **`src/lib/agents/adapter.ts`**: Defines `AgentAdapter` interface with `id`, `applyConfig()`, and `configPath()` methods
- **`src/lib/agents/registry.ts`**: Central registry of all agent adapters; use `getAgentById()` to retrieve adapters
- **Individual adapters** (`claude-code.ts`, `codex-cli.ts`, etc.): Implement agent-specific logic:
  - JSON-based agents (Claude Code, Claude Desktop, Cursor, Gemini CLI, GitHub Copilot CLI) merge MCP servers into existing JSON configs
  - TOML-based agents (Codex CLI) use `@shopify/toml-patch` to patch TOML content

**Adding a new agent:**
1. Create adapter class in `src/lib/agents/<agent-name>.ts` implementing `AgentAdapter`
2. Implement `applyConfig()` to merge mmcp's `Config` into agent's config file
3. Register in `src/lib/agents/registry.ts`
4. Update README.md supported agents table

### Config Management

- **`src/lib/config.ts`**: Manages `~/.mmcp.json` with Zod schema validation
- Config schema: `{ agents: string[], mcpServers: Record<string, MCPServer> }`
- `MCPServer` schema allows `url`, `command`, `args`, and `env` (all optional/partial)

### Command Structure

- **`src/index.ts`**: CLI entry point using `commander.js`
- **`src/commands/*.ts`**: Individual command implementations
  - `add.ts`: Add MCP server to mmcp config
  - `remove.ts`: Remove MCP server from mmcp config
  - `apply.ts`: Apply mmcp config to registered agents
  - `list.ts`: List configured MCP servers
  - `agents-{add,remove,list}.ts`: Manage target agents list

### Build Process

**`scripts/build.ts`** uses Bun's bundler to:
1. Clean `dist/` directory
2. Bundle `src/index.ts` with shebang (`#!/usr/bin/env node`)
3. Output to `dist/index.js` with external packages
4. Make executable with `chmod +x`

## Code Conventions

- **TypeScript**: Strict mode enabled
- **Formatting/Linting**: Biome (config in `biome.json`)
  - Double quotes
  - Space indentation
  - `noUnusedVariables` and `noUnusedImports` are errors
  - Organize imports on save
- **Naming**:
  - Files: `kebab-case` (e.g., `agents-remove.ts`)
  - Classes/Types: `PascalCase`
  - Functions/Variables: `camelCase`
- **Tests**: Place `*.spec.ts` files next to implementation; Bun test runner

## Pre-commit Hooks

Husky runs `lint-staged` which executes:
```bash
biome check --write --no-errors-on-unmatched --files-ignore-unknown=true
```

This auto-formats and fixes linting issues on staged files.

## Release Process

- Uses **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc.)
- **Release Please** automates versioning and CHANGELOG generation
- Never commit generated files in `dist/` (created during build)
