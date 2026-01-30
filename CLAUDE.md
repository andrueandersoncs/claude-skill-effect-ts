# Effect-TS Plugin

## Task Management

**Always use tasks.** For every user request, create a task list to track progress.

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

## Refactoring Guidelines

When reorganizing or refactoring code:
- **Extract before deleting** - Copy working code to new location first, verify it works, then delete original
- **Test after each change** - Run `bun run detect:all <file> --json` to verify detectors still work
- **Recover deleted code** - Use `git show HEAD~N:<path>` to recover accidentally deleted files
- **Simple over complex** - Prefer direct copy/extraction over elaborate migration scripts

## Communication

- When asked a question, answer it before taking action
- Reflect on mistakes when asked, don't immediately start fixing
