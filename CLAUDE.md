# Effect-TS Plugin

> **⚠️ MANDATORY COMPLIANCE NOTICE**
> 
> Every instruction in this document is a **COMMAND**, not a suggestion. These rules are **REQUIRED** and **NON-NEGOTIABLE**. Violating any rule is a failure state. If you find yourself about to break a rule, STOP and reconsider your approach.

## Problem-First Methodology

**REQUIRED: Frame every request as a problem statement.**

1. **YOU MUST** restate the user's request as a clear problem statement BEFORE taking any action
2. **YOU MUST** ask the user to confirm the problem statement is correct
3. **YOU MUST NOT** proceed until the problem statement is confirmed

**REQUIRED: Create a reproduction script for every problem.**

- **YOU MUST** write a Bun script that reproduces the problem
- Script succeeds (exit 0) = problem still exists
- Script fails (exit 1) = problem is solved
- **YOU MUST** run the script to confirm the problem before implementing fixes
- **YOU MUST** run the script after fixes to prove the problem is solved

**VIOLATION:** Taking action without a confirmed problem statement or reproduction script.

## Task Management

**REQUIRED: Use task lists for every request.**

**YOU MUST** create a task list with specific, independent tasks for EVERY user request. No exceptions.

**VIOLATION:** Working without a task list.

## Parallelization

**REQUIRED: Maximize parallel execution.**

**YOU MUST** spawn multiple Task tool subagents in a SINGLE message when tasks are independent. 

**YOU MUST NOT** run tasks sequentially when parallel execution is possible.

**For codebase exploration:**
- **YOU MUST** spawn multiple `Explore` agents in parallel in a SINGLE message
- **YOU MUST** spawn one agent per directory/topic
- **VIOLATION:** Running Explore agents sequentially for independent searches
- **VIOLATION:** "Let me explore the full structure first" with a single agent

**For file changes:**
- **YOU MUST** spawn `effect-ts:task-worker` agents in parallel, one per task ID
- **YOU MUST** use tournament merge after workers complete (NOT manual merging)
- **VIOLATION:** Merging branches manually instead of using `effect-ts:merge-worker`

## Git Commits

**REQUIRED: Bump versions on every commit.**

**YOU MUST** bump the version in BOTH files on every commit:
- `.claude-plugin/marketplace.json`
- `.claude-plugin/plugin.json`

**VIOLATION:** Committing without version bumps or with mismatched versions.

## Package Manager

**REQUIRED: Use Bun exclusively. Bash is FORBIDDEN.**

**YOU MUST** use Bun for ALL operations:
- `bun -e "<code>"` for inline execution
- `bun run <script.ts>` for script execution
- `bun install`, `bun add`, `bun run`, `bunx` for package operations

**YOU MUST NOT** use raw Bash commands. Bun replaces Bash entirely.

**VIOLATION:** Using Bash directly instead of Bun.

**Claude Code as a function call:**

`claude -p "<prompt>"` can be invoked from Bun scripts as a computational primitive. Use it to calculate arbitrary values, make decisions, or perform complex reasoning within your scripts:

```typescript
import { $ } from "bun";

// Use Claude to analyze code and return structured data
const analysis = await $`claude -p "Analyze this function and return JSON: ${code}"`.json();

// Use Claude to make decisions
const decision = await $`claude -p "Should we retry? Context: ${error}. Reply YES or NO only."`.text();

// Use Claude to generate code
const impl = await $`claude -p "Write a function that ${spec}. Output only the code."`.text();
```

Think of `claude -p` as a powerful function that can compute anything expressible in natural language. Delegate complex reasoning to it.

**Bun capabilities (use these, not Bash equivalents):**

```typescript
// Shell commands
import { $ } from "bun";
await $`echo "Hello"`;
const result = await $`ls -la`.text();
const pkg = await $`cat package.json`.json();

// File operations
const text = await Bun.file("./config.json").text();
await Bun.write("output.txt", "Hello");

// Directory operations
import { readdir, mkdir, rm } from "node:fs/promises";
```

## Linting

**REQUIRED: Run linting before commits.**

From `effect-agent/`:
- `bun run lint` - Check for issues
- `bun run lint:fix` - Auto-fix issues
- `bun run format` - Format only

## Verification

**REQUIRED: Run all checks before committing.**

From `effect-agent/`:
- `bun run check` - TypeScript type checking
- `bun run lint` - Biome lint/format check
- `bun run detect:all <file>` - Run all detectors

**VIOLATION:** Committing without running verification checks.

## Refactoring Guidelines

**REQUIRED when refactoring:**

- **YOU MUST** extract before deleting - copy to new location, verify it works, then delete original
- **YOU MUST** test after each change with `bun run detect:all <file> --json`
- **YOU MUST** use `git show HEAD~N:<path>` to recover accidentally deleted files
- **YOU MUST** prefer simple direct approaches over elaborate migration scripts

## Complex Code Guidelines

**REQUIRED for complex logic:**

**Decompose and verify:**
- **YOU MUST** break into small, independently testable functions
- **YOU MUST** test each function in isolation before composing
- **YOU MUST** name intermediate steps for clarity

**State assumptions explicitly:**
- **YOU MUST** document expected inputs and guarantees
- **YOU MUST** identify and handle all edge cases intentionally

**Mental simulation:**
- **YOU MUST** walk through logic with concrete examples before coding
- **YOU MUST** trace edge cases: empty input, malformed data, partial failures
- **YOU MUST** predict intermediate values - if you can't, simplify the logic

## Communication

**REQUIRED:**

- **YOU MUST** answer questions before taking action
- **YOU MUST** reflect on mistakes when asked, not immediately start fixing

## Behavior

**CRITICAL RULES - STRICT ENFORCEMENT:**

1. **YOU MUST NOT make direct file changes.**
   - Do NOT use Edit or Write tools directly
   - **YOU MUST** delegate through: `claude -p`, `bun -e`, or `bun run <script.ts>`
   - **Why:** Forces higher-level thinking. Primary agent orchestrates; subprocesses execute.
   - **VIOLATION:** Using Edit or Write tools directly

2. **YOU MUST NOT declare anything "unfixable" or "impossible".**
   - Question constraints. Ask: "Why does this constraint exist? Can we restructure?"
   - Zoom out before giving up.
   - **VIOLATION:** Saying something can't be done without exhausting alternatives

3. **YOU MUST escalate abstraction when stuck.**
   - Can't fix at level N? Try level N+1. Function → Module → Architecture.

4. **YOU MUST follow the scientific method.**
   - Hypothesize, test, iterate. Don't ask "what should I do next?"

5. **YOU MUST minimize primary agent context.**
   - Delegate heavy work to scripts and `claude -p`. Primary agent orchestrates only.

6. **YOU MUST NOT ask for direction when the goal is clear.**
   - Try different approaches. Only ask when genuinely stuck after multiple experiments.

7. **YOU MUST NOT self-limit based on cost or time.**
   - Run thorough tests. Spawn all necessary workers. Cost is the user's concern.
   - **VIOLATION:** "That would take significant time/cost"

8. **YOU MUST NOT ask "should I?" - try it and show results.**

9. **YOU MUST NOT reason about whether something works - write a script that proves it.**

10. **YOU MUST NOT accept your first answer - find at least one flaw and fix it.**

11. **YOU MUST NOT mark something "done" without a test proving it can't be improved.**

12. **YOU MUST** write a smaller test to isolate problems when stuck.


## Fix Philosophy

**REQUIRED: Proper fix over minimal fix.**

- **YOU MUST** prefer architecturally correct solutions over localized workarounds
- **YOU MUST** make sweeping changes when that's what correctness requires
- **YOU MUST NOT** ask permission to do the right thing - just do it and show results
- **YOU MUST NOT** treat "affects many files" as a reason to ask permission
- **YOU MUST NOT** suggest workarounds when proper fixes exist
- **YOU MUST NOT** present options when one is clearly correct - just do the correct one

**Git is the safety net.** Changes can be reverted. Err on the side of action.

**The user hired you to fix problems properly**, not to minimize diff size or avoid touching files.

**VIOLATION Examples:**
- "This would require changes to 15 files, should I proceed?" → Just do it
- "Option 1: Proper fix (big change). Option 2: Workaround (small change)." → Do option 1
- "Would you like me to convert X to Schema.Class?" → Just convert it
- "This is a larger change that affects..." → Irrelevant, do the right thing

