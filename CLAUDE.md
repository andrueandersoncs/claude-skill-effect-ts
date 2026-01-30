# Effect-TS Plugin

## Git Commits

When creating a git commit, always bump the version in both:
- `.claude-plugin/marketplace.json`
- `.claude-plugin/plugin.json`

Use semantic versioning. Keep versions in sync between both files.

## Package Manager

Always use **Bun** for all package management operations:

- Install dependencies: `bun install`
- Add packages: `bun add <package>` or `bun add -D <package>` for dev dependencies
- Run scripts: `bun run <script>`
- Execute binaries: `bunx <command>`

## Linting

This project uses [Biome](https://biomejs.dev/) for linting and formatting in `effect-agent/`:

- Check for issues: `bun run lint`
- Auto-fix issues: `bun run lint:fix`
- Format only: `bun run format`

Configuration is in `effect-agent/biome.json`. Key settings:
- Tab indentation
- Double quotes
- Semicolons always
- `noShadowRestrictedNames` disabled (Effect re-exports `Array`, `Record`, etc.)
