# Effect-TS Plugin

## Task Management

**Always use tasks.** For every user request, create a task list with specific tasks that are as independent as possible so they can be parallelized across subagents.

## Parallelization

**Maximize subagent parallelism.** Always spawn multiple Task tool subagents in a single message when tasks can run independently. Never work sequentially when parallel execution is possible.

**For codebase exploration:** When searching for multiple things or exploring different aspects of the codebase, spawn multiple `Explore` agents in parallel **in a single message**. Never run Explore agents sequentially when the searches are independent.

- **One agent per directory/topic** - If analyzing N directories or N topics, spawn N agents
- **Anti-pattern:** "Let me explore the full structure first" with a single agent
- **Correct pattern:** Spawn one Explore agent per category/directory/topic simultaneously

**For tasks requiring file changes:** Spawn `effect-ts:task-worker` agents in parallel (use fully qualified name with `subagent_type="effect-ts:task-worker"`), one per task ID. Each worker creates its own worktree/branch.

**After all workers complete, use tournament merge (NOT manual merging):**
- Pair branches and spawn `effect-ts:merge-worker` agents in parallel (one per pair)
- Each merge-worker merges branch_b INTO branch_a, keeps fixes from BOTH, deletes branch_b
- Repeat rounds until one branch remains, then merge that into main
- **Never merge manually** - it wastes primary agent context. O(log n) parallel rounds vs O(n) sequential.

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

## Verification

Before committing, run these checks from `effect-agent/`:

- `bun run check` - TypeScript type checking (tsc --noEmit)
- `bun run lint` - Biome lint/format check
- `bun run detect:all <file>` - Run all detectors on a file
- `bun run detect:errors <file>` - Show only definite errors (no potential issues)
- `bun run detect:json <file>` - JSON output for programmatic use

## Refactoring Guidelines

When reorganizing or refactoring code:
- **Extract before deleting** - Copy working code to new location first, verify it works, then delete original
- **Test after each change** - Run `bun run detect:all <file> --json` to verify detectors still work
- **Recover deleted code** - Use `git show HEAD~N:<path>` to recover accidentally deleted files
- **Simple over complex** - Prefer direct copy/extraction over elaborate migration scripts

## Communication

- When asked a question, answer it before taking action
- Reflect on mistakes when asked, don't immediately start fixing
