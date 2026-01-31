# Effect-TS Plugin

## Problem-First Methodology

**Always frame requests as problems.** Before taking action, explicitly restate or reframe the user's request as a clear problem statement. **Ask the user to confirm the problem statement is correct before proceeding.**

**Always create a reproduction script.** For every confirmed problem, write a Bun script that reproduces it:
- Script succeeds (exit 0) = problem still exists
- Script fails (exit 1) = problem is solved
- Must be runnable with `bun run <script>` or `bun -e "<code>"`

**Example workflow:**
1. User: "The detector isn't catching X pattern"
2. Problem statement: "Detector should output violation for X pattern, but outputs nothing"
3. **Ask user to confirm problem statement**
4. Reproduction script: Creates test file with X, runs detector, exits 0 if no violation found
5. Run script → exits 0 (problem confirmed)
6. Implement fix
7. Run script → exits 1 (problem no longer reproduces = solved)

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

Always use **Bun** for all operations. Never use Bash.

**Bun replaces Bash entirely.** Bun is a Turing-complete runtime with built-in modules for shell commands, file system, network, and everything else needed to control a computer.

**Inline code execution:**
```bash
bun -e "console.log('Hello, world!')"
bun -e "import { $ } from 'bun'; console.log(await $\`ls -la\`.text())"
```

**Shell commands via `$` template literal:**
```typescript
import { $ } from "bun";

await $`echo "Hello World!"`;                    // Run command
const result = await $`ls -la`.text();           // Capture output as string
const pkg = await $`cat package.json`.json();    // Parse JSON output
await $`pwd`.cwd("/tmp");                        // Change working directory
const { exitCode } = await $`cmd`.nothrow();     // Don't throw on error
```

**File operations via `Bun.file()` and `Bun.write()`:**
```typescript
const file = Bun.file("./config.json");
const text = await file.text();                  // Read as string
const json = await file.json();                  // Read and parse JSON
const exists = await file.exists();              // Check existence

await Bun.write("output.txt", "Hello");          // Write string
await Bun.write("data.json", JSON.stringify(x)); // Write JSON
await Bun.write("copy.txt", Bun.file("src.txt"));// Copy file
```

**Directory operations via `node:fs`:**
```typescript
import { readdir, mkdir, rm } from "node:fs/promises";
const files = await readdir(".");                // List directory
await mkdir("newdir", { recursive: true });      // Create directory
await rm("file.txt");                            // Delete file
```

**Package management:**
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

## Complex Code Guidelines

When writing complex logic (multi-step pipelines, nested transformations, intricate conditionals):

**Decompose and verify:**
- Break into small, independently testable functions
- Test each function in isolation before composing them
- Name intermediate steps - extract and name transformations for clarity and testability

**State assumptions and failure modes explicitly:**
- Document what inputs are expected and what guarantees the code provides
- Identify edge cases (empty arrays, null values, concurrent access, etc.)
- Handle each failure mode intentionally - don't let errors fall through silently

**Mental simulation before coding:**
- Walk through the logic step-by-step with concrete example inputs
- Trace edge cases mentally: What happens with empty input? Malformed data? Partial failures?
- Predict intermediate values at each step - if you can't, the logic is too complex
- Ask: "What assumptions am I making? What if they're wrong?"

## Communication

- When asked a question, answer it before taking action
- Reflect on mistakes when asked, don't immediately start fixing
