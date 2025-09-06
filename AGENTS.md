# Repository Guidelines

## Project Structure & Module Layout
- `src/index.ts`: CLI entry point using `commander`.
- `src/commands/*`: Subcommands (`add`, `remove`, `apply`, `agents add/remove`).
- `src/lib/config.ts`: JSON config loader/saver (default path `~/.mmcp.json`).
- `src/lib/agents/*`: Agent adapters (e.g., `claude-code` writes `~/.claude.json`).
- `scripts/build.ts`: Bun build script producing `dist/`.
- `dist/`: Compiled output; do not edit by hand.

## Build, Test, and Local Development
```bash
bun install                 # install dependencies
bun run lint                # Biome lint
bun run fmt                 # Biome format (writes)
bun run typecheck           # TypeScript type check
bun run build               # build CLI to dist/index.js
bun test                    # run tests with Bun
```
CI (GitHub Actions) runs lint, build, typecheck, and tests on PRs and `main`.

## Coding Style & Naming Conventions
- Language: TypeScript with `strict` settings.
- Formatter/Linter: Biome (`biome.json`); double quotes, space indentation; `noUnusedVariables`/`noUnusedImports` are errors.
- Naming: files in kebab-case (e.g., `agents-remove.ts`); classes/types in PascalCase; functions/variables in camelCase.
- Never commit generated artifacts under `dist/`.

## Testing Guidelines
- Runner: `bun test`.
- Naming: use `*.spec.ts`.
- Location: place tests next to the code they exercise.
- Cover boundary/error paths (invalid options, unsupported agents, missing config, etc.).
- No strict coverage threshold in CI; add meaningful tests for public APIs and CLI behavior.

## Commit & Pull Request Guidelines
- Use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, etc.). Releases/CHANGELOG are handled by Release Please.
- Pre-commit runs lint-staged → Biome. Before pushing, ensure the following pass locally:
  `bun run lint && bun run typecheck && bun run build && bun test`
- PRs must include purpose, summary of changes, reproduction/verification steps, and linked issues. Update `README.md` when user‑facing behavior changes.

## Security & Configuration Tips
- `mmcp` writes user config to `~/.mmcp.json`. Do not commit secrets. Pass sensitive values via `--env KEY=VALUE` when adding servers.
- Supported agents: `claude-code`, `codex-cli`. To add an agent, implement an adapter in `src/lib/agents/` and register it in `registry.ts`.
