---
name: effect-check
description: Run Effect-TS compliance checks - detectors flag issues, then LLM agents analyze/fix violations in parallel
argument-hint: "<file-path> [--fix]"
allowed-tools:
  - Bash
  - Read
  - Task
  - TaskCreate
  - TaskUpdate
  - TaskList
---

# Effect-TS Compliance Checker

Two-phase analysis: fast AST-based detection followed by LLM-powered analysis.

## ⛔⛔⛔ FIX MODE INVARIANTS - THESE MUST ALWAYS BE TRUE ⛔⛔⛔

A successful fix run MUST satisfy ALL of these invariants:

1. **Violation count MUST decrease** (M < N where N=before, M=after)
2. **ZERO suppression comments** (no eslint-disable, @ts-ignore, biome-ignore, etc.)
3. **ZERO new type errors** (bun run check must not show new errors)
4. **All 5 phases MUST complete** (Detection → Tasks → Workers → Tournament Merge → Verification)

**If ANY invariant is violated, the fix FAILED and changes MUST be reverted.**

## ⛔⛔⛔ THE GOLDEN RULE: UNFIXABLE ≠ SUPPRESS ⛔⛔⛔

**If code cannot be converted to Effect patterns, the ONLY valid action is NO CHANGE.**

| Scenario | CORRECT Action | WRONG Action |
|----------|----------------|--------------|
| Type predicate `x is Foo` | Leave unchanged, commit UNFIXABLE | Add @ts-ignore |
| Schema.declare callback | Leave unchanged, commit UNFIXABLE | Add as any |
| Sync code with sync caller | Leave unchanged, commit UNFIXABLE | Wrap in Effect |
| Cannot determine fix | Leave unchanged, commit UNFIXABLE | Add suppression |

**Suppression comments are ALWAYS wrong. "Do nothing" is sometimes correct.**

## Modes

- **Analyze mode** (default): Spawns `category-checker` agents to analyze violations and provide recommendations
- **Fix mode** (`--fix`): Spawns `task-worker` agents in isolated git worktrees to automatically apply fixes

## Process Overview

1. **Phase 1: Detection** - Run AST-based detectors to flag violations (fast)
2. **Phase 2: Task Creation** - Create one task per violation for tracking
3. **Phase 3: Analysis/Fix** - Spawn agents in parallel (one per EVERY violation)
4. **Phase 4: Report/Merge** - ⛔ MANDATORY - Aggregate results; if fix mode, run tournament merge
5. **Phase 5: Verification** - ⛔ MANDATORY - Re-run detectors, check for suppression comments, verify type safety

**Always use task lists.** Create specific, independent tasks to maximize parallelization.

## ⛔ CRITICAL: YOU MUST COMPLETE ALL 5 PHASES

**Phase 4 AND Phase 5 are NOT optional.** After all task-worker agents return in Phase 3:
- You MUST immediately proceed to Phase 4
- You MUST NOT stop after receiving task worker results
- You MUST run the tournament merge (fix mode) or aggregate results (analyze mode)
- You MUST output the final report

**FORBIDDEN: Stopping after Phase 3.** The workflow is incomplete without Phase 4.

**MANDATORY: Investigate EVERY violation.** Do NOT filter, skip, or prioritize. Spawn an agent for EVERY error, warning, AND info violation found. No exceptions.

## ⛔⛔⛔ CRITICAL: NO EXCUSES - SPAWN TASK-WORKERS FOR ALL VIOLATIONS ⛔⛔⛔

**YOU (the primary agent) do NOT decide what can or cannot be fixed. Task-workers decide.**

### FORBIDDEN - Primary Agent MUST NOT:

- ❌ Classify violations as "false positives" without spawning task-workers
- ❌ Decide that a pattern "cannot use Effect" (e.g., "type predicates can't be Effect")
- ❌ Skip violations because you think they're unfixable
- ❌ Say "No fixes applied" without spawning task-workers first
- ❌ Make ANY fix/skip decisions - that is the task-worker's job
- ❌ Reason about whether code CAN be converted to Effect patterns
- ❌ Filter out violations based on your own analysis
- ❌ Report violations as "acknowledged but not fixable"

### REQUIRED - Primary Agent MUST:

- ✅ Spawn a task-worker for EVERY violation - NO EXCEPTIONS
- ✅ Let task-workers evaluate each violation individually
- ✅ Only report "unfixable" if a task-worker explicitly documents WHY with code-level justification
- ✅ Trust the detector - if it flagged something, it needs a task-worker to evaluate it

### WHY THIS MATTERS

The detector flagged 20 violations. You classified all 20 as "false positives" and said "No fixes applied." This is WRONG because:

1. **You didn't spawn task-workers** - You made the decision yourself instead of delegating
2. **You assumed limitations** - "Type predicates can't use Effect" is an assumption, not a fact
3. **You provided ZERO value** - The user ran `--fix` and got nothing

### CORRECT WORKFLOW

```
Detector found 20 violations
  ↓
PRIMARY AGENT: "Spawning 20 task-workers"  ← YOU ARE HERE
  ↓
[20 Task tool calls in ONE message]
  ↓
Each task-worker evaluates ONE violation:
  - CAN fix → Apply fix, commit
  - CANNOT fix → Document WHY with specific code (not "type predicates can't use Effect")
  ↓
Tournament merge all branches
  ↓
Report: "15 fixed, 5 unfixable (with justification from task-workers)"
```

### WRONG WORKFLOW (WHAT YOU DID)

```
Detector found 20 violations
  ↓
PRIMARY AGENT: "These look like false positives"  ← FORBIDDEN
PRIMARY AGENT: "Type predicates can't use Effect"  ← FORBIDDEN
PRIMARY AGENT: "No fixes applied"  ← FORBIDDEN
  ↓
[0 task-workers spawned]  ← FAILURE
  ↓
User gets NOTHING
```

### ONLY TASK-WORKERS CAN SAY "UNFIXABLE"

If a violation truly cannot be fixed, the task-worker must document:

1. **The specific code** that cannot be changed
2. **The technical reason** (not "Effect doesn't support this" - be specific)
3. **What they tried** and why it failed
4. **Evidence** (type error messages, test failures, etc.)

Without this documentation FROM A TASK-WORKER, assume it CAN be fixed.

## ⛔⛔⛔ CRITICAL: UNFIXABLE ≠ ADD SUPPRESSION COMMENTS ⛔⛔⛔

**When a violation is truly unfixable, task-workers MUST:**
- ✅ Leave the original code UNCHANGED
- ✅ Commit with message "UNFIXABLE: [reason]"
- ✅ Document why in the commit message

**When a violation is truly unfixable, task-workers MUST NOT:**
- ❌ Add `// @ts-ignore` or `// @ts-expect-error`
- ❌ Add `// eslint-disable` comments
- ❌ Add any suppression comments
- ❌ Add type assertions like `as any` or `as unknown`
- ❌ Wrap synchronous code in Effect when the caller expects sync return

**UNFIXABLE means "leave it alone", NOT "suppress the error".**

### Type Predicates and Schema Callbacks Are Special

Some violations occur in code that CANNOT be converted to Effect:
- **Type predicates** (`function isFoo(x): x is Foo`) - TypeScript requires boolean return
- **Schema.declare callbacks** - Must be synchronous
- **Type guard functions** - Caller expects boolean, not Effect

**For these patterns:**
1. DO NOT wrap in Effect.gen (breaks caller contract)
2. DO NOT add @ts-ignore (hides the problem)
3. DO leave the code as-is
4. DO commit with "UNFIXABLE: TypeScript type predicate requires boolean return, cannot return Effect"

**The correct action for truly unfixable code is NO ACTION, not suppression.**

**TL;DR: If detector found N violations, you MUST spawn N task-workers. Period.**

## STRICT REQUIREMENTS - DO NOT DEVIATE

**Every violation gets a task. Every task gets a parallel agent. No exceptions.**

- 100 violations = 100 tasks = 100 parallel agents
- 500 violations = 500 tasks = 500 parallel agents
- The numbers MUST match. Period.

FORBIDDEN:
- ❌ Creating fewer tasks than violations
- ❌ Spawning fewer agents than tasks
- ❌ "Applying fixes directly" instead of spawning agents
- ❌ Batching, grouping, or consolidating violations
- ❌ Any reasoning about efficiency, conflicts, or optimization
- ❌ Asking the user how to proceed when many violations exist
- ❌ Warning about "merge hell", "merge conflicts", or similar concerns
- ❌ Expressing concern about multiple violations in the same file
- ❌ Using `run_in_background: true` for ANY Task tool call
- ❌ Reading background agent output files
- ❌ Spawning agents "in batches to avoid overwhelming the system"
- ❌ Any reasoning about system resources, limits, or throttling
- ❌ **Classifying violations as "false positives" without spawning task-workers**
- ❌ **Saying "No fixes applied" without spawning task-workers first**
- ❌ **Deciding that code "cannot use Effect patterns"**
- ❌ **Making ANY fix/skip decision yourself (task-workers do this)**
- ❌ **Reasoning about what can/cannot be converted to Effect**

**THE SYSTEM IS DESIGNED FOR THIS.** Each task-worker creates an isolated worktree branch. Phase 4's tournament merge algorithm handles all conflicts by keeping fixes from both sides. Even 100+ violations in one file will be correctly merged. This is not your concern—just spawn the agents.

## ⛔ CRITICAL: SUBAGENTS, NOT BACKGROUND AGENTS

**NEVER use `run_in_background: true` for Task tool calls.**

These are **subagents** that work autonomously and return results. They are NOT background agents whose output you read later. The distinction matters:

| Subagent (CORRECT) | Background Agent (WRONG) |
|-------------------|-------------------------|
| Spawned without `run_in_background` | Spawned with `run_in_background: true` |
| Returns result directly | Requires reading output file |
| Delegates context to subagent | YOU consume context reading output |
| Scales to 100+ agents | Context explodes with many agents |

**WHY THIS MATTERS:** If you spawn 97 background agents, you must read 97 output files to see results. That consumes YOUR context—the exact thing we're trying to avoid by delegating to subagents. Subagents handle everything autonomously; you just wait for their completion and get a summary.

**CORRECT:** `Task tool with subagent_type, NO run_in_background parameter`
**WRONG:** `Task tool with run_in_background: true`

## Implementation

### Phase 1: Run Detectors

Execute the detection script:

```bash
cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:all <file-path> --json 2>/dev/null
```

Parse the JSON output to get:
- `filesAnalyzed`: Number of files checked
- `violations`: Array of violation objects
- `errors`: Any analysis errors

### Phase 2: Create Task List

Create one task per violation for tracking progress:

```
For EACH violation, create a task:
- Subject: "Fix [category]/[ruleId] at [file]:[line]"
- Description: Include violation details (message, snippet, severity)
```

**VERIFY: Number of tasks created MUST equal number of violations found.** If detector found 97 violations, you must create exactly 97 tasks. No exceptions.

This provides visibility into progress and enables parallel execution tracking.

### Phase 3: Spawn Agents

**NO FILTERING. NO EXCEPTIONS. NO PRIORITIZATION. NO EXCUSES.**

- Spawn an agent for EVERY violation found
- Do NOT skip info-level violations
- Do NOT skip "less important" violations
- Do NOT reduce the number of agents for performance reasons
- Investigate ALL violations equally
- **Do NOT classify violations as "false positives" - task-workers evaluate that**
- **Do NOT decide what "can't be fixed" - task-workers decide that**
- **Do NOT make ANY fix/skip decisions yourself**

**CRITICAL**: Spawn ALL agents in a SINGLE message. One agent per violation = maximum parallelism.

**NO BATCHING. The system CANNOT be overwhelmed.**
- 97 violations = 97 Task tool calls in ONE message
- 500 violations = 500 Task tool calls in ONE message
- Do NOT split into batches "to avoid overwhelming the system"
- Do NOT reason about system resources, limits, or throttling

**VERIFY: Number of Task tool calls MUST equal number of violations.** If 97 violations, spawn exactly 97 agents in one message. Do NOT reason about efficiency, conflicts, or batching.

**DO NOT ASK THE USER.** If you're thinking "this file has X violations, spawning X agents will cause merge conflicts"—stop. That concern is already handled. Worktrees are isolated. Tournament merge resolves conflicts. Just spawn the agents.

#### Analyze Mode (default)

Spawn `category-checker` agents for analysis only:

```
For EVERY violation, use Task tool with:
- subagent_type: "effect-ts:category-checker"
- model: "haiku"
- prompt: Include the single violation details and task ID
- ⛔ DO NOT set run_in_background (subagents, not background agents)
```

#### Fix Mode (--fix)

Spawn `task-worker` agents with worktree isolation:

```
For EVERY violation, use Task tool with:
- subagent_type: "effect-ts:task-worker"
- model: "haiku"
- prompt: Include task ID, violation details, and rule documentation path
- ⛔ DO NOT set run_in_background (subagents, not background agents)
```

Each task-worker will:
1. Create its own worktree and branch
2. Read the source file and rule documentation
3. Apply the idiomatic fix
4. Commit the change
5. **DO NOT clean up the worktree** - leave it for the merge-worker
6. Mark the task complete

## ⛔⛔⛔ CRITICAL: REAL FIXES ONLY - NO SUPPRESSION COMMENTS ⛔⛔⛔

**Task-workers MUST fix the actual code. Suppression comments are FORBIDDEN.**

### FORBIDDEN - These are NOT fixes (ANY OF THESE = AUTOMATIC REJECTION):

- ❌ `// eslint-disable-next-line` - **FORBIDDEN**
- ❌ `// @ts-ignore` - **FORBIDDEN**
- ❌ `// @ts-expect-error` - **FORBIDDEN**
- ❌ `/* eslint-disable */` - **FORBIDDEN**
- ❌ `// biome-ignore` - **FORBIDDEN**
- ❌ `// prettier-ignore` - **FORBIDDEN**
- ❌ `// @ts-nocheck` - **FORBIDDEN**
- ❌ `// type-coverage:ignore-next-line` - **FORBIDDEN**
- ❌ Any comment that suppresses, ignores, or disables a rule - **FORBIDDEN**
- ❌ Wrapping code in `try/catch` without fixing the underlying issue - **FORBIDDEN**
- ❌ Adding `as any` or `as unknown` type assertions to hide errors - **FORBIDDEN**
- ❌ Deleting the violating code without replacement - **FORBIDDEN**
- ❌ Adding empty catch blocks `catch {}` or `catch (e) {}` - **FORBIDDEN**
- ❌ Using `Function`, `Object`, or `any` types to escape type checking - **FORBIDDEN**

### ⛔ MERGE-WORKERS MUST REJECT SUPPRESSION COMMENTS

**Merge-workers: Before merging ANY branch, you MUST check for suppression comments:**

```bash
git diff branch_a...branch_b | grep -E "(eslint-disable|@ts-ignore|@ts-expect-error|biome-ignore|prettier-ignore|@ts-nocheck)"
```

**If suppression comments are found:**
1. **DO NOT MERGE that branch**
2. Report: "REJECTED branch [name]: Contains suppression comments instead of real fixes"
3. Delete the branch and its worktree
4. The fix is INVALID - it does not count as a fix

### REQUIRED - What "fixing" means:

- ✅ Rewrite the code to follow the Effect-TS pattern
- ✅ Use the correct Effect-TS idiom shown in rule documentation
- ✅ Transform imperative code to functional Effect code
- ✅ Replace non-Effect patterns with Effect equivalents
- ✅ The fixed code MUST pass the detector without violations

### Example:

**WRONG (suppression):**
```typescript
// eslint-disable-next-line effect/no-promise
const result = await fetch(url);
```

**CORRECT (actual fix):**
```typescript
const result = yield* Effect.tryPromise(() => fetch(url));
```

### VERIFICATION REQUIREMENT

After applying a fix, the task-worker MUST run:
```bash
cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:all <file-path> --json 2>/dev/null | jq '.violations[] | select(.line == LINE_NUMBER)'
```

If the violation still appears, the fix is INCOMPLETE. Try again with a real fix.

### ⛔ TASK-WORKER SELF-VERIFICATION BEFORE COMMITTING

**EVERY task-worker MUST run these checks BEFORE committing:**

```bash
# 1. Check for suppression comments (FORBIDDEN)
grep -n "eslint-disable\|@ts-ignore\|@ts-expect-error\|biome-ignore\|prettier-ignore\|@ts-nocheck" <file>
# If ANY output: YOUR FIX IS INVALID. Remove and fix properly, or report UNFIXABLE.

# 2. Check for type errors (FORBIDDEN)
cd <project-root> && bun run check 2>&1 | grep -A2 "<file>"
# If errors: YOUR FIX INTRODUCED TYPE ERRORS. Revert and fix properly, or report UNFIXABLE.

# 3. Check for dangerous type assertions (FORBIDDEN)
grep -n "as any\|as unknown" <file>
# If ANY new assertions added: YOUR FIX IS INVALID. Remove and fix properly.
```

**If ANY check fails, the task-worker MUST:**
1. Revert the changes: `git checkout -- <file>`
2. Report the violation as UNFIXABLE (with specific reason)
3. Commit the UNCHANGED file with UNFIXABLE message

**A fix that introduces type errors or suppression is WORSE than no fix.**

### WHY THIS MATTERS

Suppression comments hide problems without solving them. The user ran `--fix` expecting their code to be transformed to idiomatic Effect-TS. If workers add suppression comments:
- The code still has issues
- Type safety is compromised
- The violation will reappear when comments are removed
- The user gets ZERO value from running `--fix`

**A suppression comment is NOT a fix. It is a FAILURE.**

**⛔ AFTER ALL TASK-WORKERS RETURN: GO TO PHASE 4 IMMEDIATELY. DO NOT STOP.**

Example prompt for task-worker:
```
Task ID: [TASK_ID]
Project root: [PROJECT_ROOT]

⛔ MANDATORY: Create worktree FIRST, before reading ANY files:
  cd [PROJECT_ROOT]
  git worktree add ../worktree-task-[TASK_ID] -b task-[TASK_ID]

⛔ ALL file paths MUST use worktree: ../worktree-task-[TASK_ID]/
  ✅ CORRECT: Read ../worktree-task-[TASK_ID]/[FILE_PATH]
  ❌ WRONG: Read [FILE_PATH]

Fix this [CATEGORY] violation:

File: [FILE_PATH]
Line: [LINE]:[COLUMN]
Rule: [ruleId]
Message: [message]
Snippet: [snippet]

To see good/bad examples for this rule:
  cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:examples [category]/[ruleId]

Rule documentation: ${CLAUDE_PLUGIN_ROOT}/effect-agent/categories/[category]/rule-NNN/rule-NNN.md

⛔⛔⛔ CRITICAL: REAL FIXES ONLY ⛔⛔⛔
You MUST rewrite the code to follow Effect-TS patterns.

FORBIDDEN (these are NOT fixes - using any of these is a FAILURE):
- eslint-disable comments
- @ts-ignore or @ts-expect-error
- biome-ignore or prettier-ignore
- Any suppression/ignore comment
- Adding "as any" or "as unknown" type casts
- Deleting code without proper replacement

REQUIRED (what a real fix looks like):
- Transform the code to use Effect-TS idioms
- Follow the pattern shown in rule documentation
- The fixed code must pass the detector

Apply the idiomatic Effect-TS fix in your worktree. Commit to your task branch.

⛔ BEFORE COMMITTING - MANDATORY SELF-CHECK (ALL 3 MUST PASS):

   1. Suppression check:
      Run: grep -n "eslint-disable\|@ts-ignore\|@ts-expect-error\|biome-ignore\|@ts-nocheck" <your-file>
      If ANY matches: YOUR FIX IS INVALID. Remove suppression comments and fix properly OR report UNFIXABLE.

   2. Type error check:
      Run: cd <project-root> && bun run check 2>&1 | grep -A2 "<your-file>"
      If ANY errors: YOUR FIX INTRODUCED TYPE ERRORS. Revert changes and report UNFIXABLE.

   3. Type assertion check:
      Run: git diff HEAD -- <your-file> | grep -E "^\+.*as (any|unknown)"
      If ANY new assertions: YOUR FIX IS INVALID. Remove type casts and fix properly OR report UNFIXABLE.

   ⛔ IF ANY CHECK FAILS:
      - Run: git checkout -- <your-file>
      - Report as UNFIXABLE with the specific failure reason
      - Do NOT commit broken code

⛔ DO NOT remove the worktree or delete the branch after committing.
   Leave them intact - they will be merged by merge-workers in Phase 4.

⛔ IF YOU CANNOT FIX THIS VIOLATION:
   **DO NOT add suppression comments. DO NOT add type assertions. LEAVE THE CODE UNCHANGED.**

   Commit with message: "UNFIXABLE: [ruleId] at [file]:[line] - [specific technical reason]"

   ⛔⛔⛔ CRITICAL: "UNFIXABLE" means LEAVE THE CODE AS-IS ⛔⛔⛔
   - ✅ CORRECT: Commit original code unchanged with UNFIXABLE message
   - ❌ WRONG: Add @ts-ignore and commit
   - ❌ WRONG: Add eslint-disable and commit
   - ❌ WRONG: Add "as any" type assertion and commit
   - ❌ WRONG: Wrap sync code in Effect when caller expects sync

   The commit message MUST include:
   1. The specific code construct that prevents fixing
   2. What you tried and why it failed
   3. Type error messages or test failures as evidence

   FORBIDDEN justifications (too vague):
   - "Type predicates can't use Effect"
   - "This pattern doesn't work with Effect"
   - "Effect doesn't support this"

   REQUIRED justifications (specific):
   - "TypeScript requires type predicates to return boolean, but Effect.gen returns Effect<boolean>"
   - "Cannot wrap in Effect because caller expects synchronous return at call site X:Y"
   - "Type error: 'Type Effect<A> is not assignable to type A' at line Z"

   ⛔ SPECIAL CASE: Type predicates, Schema callbacks, and type guards
   These are SYNCHRONOUS by TypeScript contract. If the violation is in:
   - A function returning `x is Type` (type predicate)
   - A Schema.declare callback
   - A type guard function

   Then the ONLY valid action is to leave the code UNCHANGED and report UNFIXABLE.
   Wrapping in Effect will introduce type errors. Suppression comments hide bugs.
   **DO NOTHING is the correct fix for synchronous contract violations.**
```

---

## ⛔⛔⛔ END OF PHASE 3 - PHASE 4 IS NEXT ⛔⛔⛔

**YOU ARE HERE:** Task-workers have returned. Fixes are on branches. **THE WORK IS NOT DONE.**

**YOUR NEXT STEP:** Run `git branch | grep task-` and begin tournament merge.

**DO NOT:** Stop, summarize, or report. **DO:** Continue to Phase 4.

### ⛔⛔⛔ STOP! READ THIS BEFORE CONTINUING ⛔⛔⛔

## MANDATORY PHASE 4 TRANSITION - YOU ARE NOT DONE AFTER PHASE 3

**WHEN ALL TASK-WORKERS RETURN, PHASE 3 IS COMPLETE. PHASE 4 MUST START IMMEDIATELY.**

**YOU ARE ONLY 75% DONE WHEN PHASE 3 COMPLETES.**

The task-workers have created branches with fixes. Those fixes are NOT in main. The user's code is UNCHANGED until you complete Phase 4. If you stop now, you have done NOTHING useful.

### REQUIRED: Immediate Transition to Phase 4

When all task-worker agents have returned their results, you MUST:

1. **IMMEDIATELY run:** `git branch | grep task-` to list all task branches
2. **Count the branches** - This determines how many tournament rounds you need
3. **Begin tournament merge IMMEDIATELY** - Spawn merge-workers for all pairs

### FORBIDDEN BEHAVIORS - YOU WILL FAIL IF YOU DO ANY OF THESE

After Phase 3 completes, the following will cause workflow failure:

- ❌ **FORBIDDEN:** Saying "all fixes have been applied" - THEY ARE NOT APPLIED, they are on branches!
- ❌ **FORBIDDEN:** Asking the user "should I merge?" - YOU MUST MERGE, NO QUESTION
- ❌ **FORBIDDEN:** Providing a "summary" without starting Phase 4
- ❌ **FORBIDDEN:** Stopping to wait for user input
- ❌ **FORBIDDEN:** Any message that doesn't include `git branch | grep task-` command
- ❌ **FORBIDDEN:** Outputting a "final report" before tournament merge completes
- ❌ **FORBIDDEN:** Treating Phase 3 completion as workflow completion

### REQUIRED: Your Next Message After Phase 3

After all task-workers return, your VERY NEXT action must be:

```
Phase 3 complete. [N] task-workers finished. Beginning Phase 4: Tournament Merge.

[Run: git branch | grep task-]
```

Then list the branches and spawn merge-workers. **NO OTHER RESPONSE IS ACCEPTABLE.**

### WHY THIS MATTERS

- Fixes on branches are INVISIBLE to the user
- The user ran `--fix` expecting their code to be fixed
- If you stop at Phase 3, the user's files are UNCHANGED
- Only Phase 4 completion actually modifies the user's code
- **Phase 3 without Phase 4 = WORKFLOW FAILURE**

---

### Phase 4: Parallel Tournament Merge

#### Analyze Mode

Collect results from all category-checker agents and present a unified report. Mark tasks as completed as agents finish.

#### Fix Mode: Tournament Merge (MANDATORY)

## ⚠️ CRITICAL: MANDATORY PARALLEL TOURNAMENT MERGE ⚠️

**YOU MUST USE TOURNAMENT-STYLE PARALLEL MERGING. SEQUENTIAL MERGING IS FORBIDDEN.**

**DO NOT:**
- ❌ Merge branches one at a time
- ❌ Use a single general-purpose agent to merge sequentially
- ❌ Skip the tournament algorithm
- ❌ "Simplify" by merging directly
- ❌ Reason about "it's easier to just merge sequentially"

**YOU MUST:**
- ✅ Spawn `merge-worker` agents IN PARALLEL for EVERY pair
- ✅ Execute MULTIPLE ROUNDS until one branch remains
- ✅ Spawn ALL merge-workers for a round in a SINGLE message
- ✅ Wait for round to complete before starting next round

---

### Tournament Algorithm

```
Given branches: [task-1, task-2, task-3, ..., task-n]

REPEAT until only 1 branch remains:
  1. Pair branches: (task-1, task-2), (task-3, task-4), ...
  2. If odd count, last branch gets "bye" to next round
  3. Spawn merge-worker agents IN PARALLEL (one per pair)
  4. WAIT for ALL merges in this round to complete
  5. Surviving branches continue to next round

FINAL: Merge the single surviving branch into main
```

**Time complexity**: O(log n) rounds instead of O(n) sequential merges.

| Branches | Sequential | Tournament Rounds |
|----------|------------|-------------------|
| 8        | 8 merges   | 3 rounds          |
| 50       | 50 merges  | 6 rounds          |
| 97       | 97 merges  | 7 rounds          |
| 100      | 100 merges | 7 rounds          |

---

### MANDATORY: Spawning Merge Workers

**FOR EACH ROUND, YOU MUST SPAWN ALL MERGE-WORKERS IN A SINGLE MESSAGE.**

**NO BATCHING. NO EXCEPTIONS.**
- 48 pairs = 48 Task tool calls in ONE message
- 100 pairs = 100 Task tool calls in ONE message
- The system CANNOT be overwhelmed. Do NOT reason about system resources.

**FORBIDDEN REASONING:**
- ❌ "I'll do this in batches to avoid overwhelming the system"
- ❌ "Let me spawn these in groups of 10"
- ❌ "To be safe, I'll limit concurrent agents"
- ❌ ANY mention of batching, throttling, or system limits

**VERIFY BEFORE EACH ROUND:**
- Count the pairs: floor(branches / 2)
- You MUST spawn EXACTLY that many merge-worker agents
- 8 branches = 4 merge-workers in round 1
- 4 branches = 2 merge-workers in round 2
- 2 branches = 1 merge-worker in round 3

**THE NUMBER OF Task TOOL CALLS MUST EQUAL THE NUMBER OF PAIRS. NO EXCEPTIONS.**

For each pair (branch_a, branch_b), use Task tool with:
```
- subagent_type: "effect-ts:merge-worker"
- model: "haiku"
- ⛔ DO NOT set run_in_background (subagents, not background agents)
- prompt: |
    Project root: [PROJECT_ROOT]

    Merge these branches:
    - branch_a (survives): [BRANCH_A]
    - branch_b (consumed): [BRANCH_B]

    ⛔ BEFORE MERGING - CHECK FOR SUPPRESSION COMMENTS:
    ```bash
    git diff main...branch_b | grep -E "(eslint-disable|@ts-ignore|@ts-expect-error|biome-ignore|prettier-ignore|@ts-nocheck)"
    ```

    ⛔ BEFORE MERGING - VALIDATE BOTH BRANCHES:

    For EACH branch (branch_a AND branch_b), check:
    ```bash
    # Check for suppression comments
    git diff main...<branch> | grep -E "(eslint-disable|@ts-ignore|@ts-expect-error|biome-ignore|prettier-ignore|@ts-nocheck)"

    # Check for type assertions added
    git diff main...<branch> | grep -E "^\+.*as (any|unknown)"
    ```

    If suppression comments OR dangerous type assertions found:
    - DO NOT merge that branch
    - Delete the branch and its worktree
    - Report: "REJECTED [BRANCH]: Contains suppression comments or unsafe type casts"
    - Continue with the other branch (or neither if both invalid)

    If BOTH branches are invalid:
    - Report: "BOTH BRANCHES REJECTED: Neither contains valid fixes"
    - Clean up both worktrees and branches
    - Return with no surviving branch

    If no issues found:
    - Merge branch_b INTO branch_a. Keep ALL fixes from BOTH.
    - Clean up branch_b's worktree and delete branch_b after success.
```

---

### Example: 8 branches (3 rounds)

**Round 1: Spawn 4 merge-workers IN PARALLEL (single message with 4 Task calls)**
```
Pair 1: task-1 + task-2 → task-1 survives
Pair 2: task-3 + task-4 → task-3 survives
Pair 3: task-5 + task-6 → task-5 survives
Pair 4: task-7 + task-8 → task-7 survives
```
WAIT for all 4 to complete. Surviving: [task-1, task-3, task-5, task-7]

**Round 2: Spawn 2 merge-workers IN PARALLEL (single message with 2 Task calls)**
```
Pair 1: task-1 + task-3 → task-1 survives
Pair 2: task-5 + task-7 → task-5 survives
```
WAIT for both to complete. Surviving: [task-1, task-5]

**Round 3: Spawn 1 merge-worker (single message with 1 Task call)**
```
Pair 1: task-1 + task-5 → task-1 survives
```
WAIT for it to complete. Surviving: [task-1]

**Final: Merge task-1 into main**

---

### Handling Odd Counts

If odd number of branches, the LAST branch passes to next round unchanged (gets a "bye"):
- `[task-1, task-2, task-3]` → merge (task-1, task-2), task-3 passes through
- Result after round: `[task-1, task-3]`

---

### Final Merge to Main

After tournament completes (exactly ONE branch remains):

```bash
cd <project_root>
git checkout main
git merge <surviving-branch> --no-edit
git worktree remove ../worktree-<surviving-branch> --force
git branch -d <surviving-branch>
```

---

## FORBIDDEN BEHAVIORS IN PHASE 4

- ❌ Merging branches sequentially one at a time
- ❌ Using a general-purpose agent to do sequential merges
- ❌ Skipping rounds or "optimizing" the tournament
- ❌ Spawning fewer merge-workers than pairs in a round
- ❌ Reasoning about "efficiency" to avoid parallel spawning
- ❌ Saying "I'll merge these directly" instead of spawning agents
- ❌ Any deviation from the tournament algorithm
- ❌ Using `run_in_background: true` for merge-worker agents

## REQUIRED BEHAVIORS IN PHASE 4

- ✅ Calculate pairs for each round: floor(branches / 2)
- ✅ Spawn EXACTLY that many merge-worker agents per round
- ✅ Use a SINGLE message with MULTIPLE Task tool calls per round
- ✅ WAIT for all agents in a round to complete before next round
- ✅ Continue rounds until exactly 1 branch remains
- ✅ Only then merge the final branch into main

## Output Format

```markdown
## Effect-TS Compliance Report

**File:** [FILE_PATH]
**Files Analyzed:** [COUNT]
**Mode:** [Analyze | Fix]

---

## Phase 1: Detector Summary

| Category | Errors | Warnings | Info |
|----------|--------|----------|------|
| [category] | [count] | [count] | [count] |

**Total:** [X] errors, [Y] warnings, [Z] info

---

## Phase 3: Detailed Analysis/Fixes

[INCLUDE EACH AGENT'S OUTPUT]

---

## Action Items (Analyze Mode) / Applied Fixes (Fix Mode)

### Must Fix (Errors)
1. [file:line] - [brief description]
2. ...

### Should Fix (Warnings)
1. [file:line] - [brief description]
2. ...

### Consider (Info)
1. [file:line] - [brief description]
2. ...
```

## Rule Documentation

Each rule has documentation at:
```
${CLAUDE_PLUGIN_ROOT}/effect-agent/categories/<category>/rule-NNN/rule-NNN.md
```

Category READMEs at:
```
${CLAUDE_PLUGIN_ROOT}/effect-agent/categories/<category>/README.md
```

### Looking Up Examples

To see good/bad examples for any rule, agents should use:
```bash
cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:examples <category/rule-id>
```

Example:
```bash
bun run detect:examples code-style/rule-002
bun run detect:examples schema/rule-010
```

This shows the full bad example (anti-pattern) and good example (idiomatic Effect-TS) for the rule.

## Quick Mode

For quick detection without LLM analysis, run the detector directly:

```bash
cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:errors <file>
```

## ⛔ COMPLETION CHECKLIST (Fix Mode)

Before reporting completion, verify ALL of these:

- [ ] Phase 1: Detectors ran and produced violations (record count: N)
- [ ] Phase 2: Created exactly N tasks for N violations
- [ ] Phase 3: Spawned exactly N task-workers for N violations
- [ ] Phase 3: All task-workers returned (wait for ALL of them)
- [ ] **Phase 4: Listed all task-* branches with `git branch | grep task-`**
- [ ] **Phase 4: Merge-workers checked each branch for suppression comments BEFORE merging**
- [ ] **Phase 4: Rejected any branches containing suppression comments**
- [ ] **Phase 4: Ran tournament merge rounds until 1 branch remained**
- [ ] **Phase 4: Merged final branch into main**
- [ ] **Phase 4: Cleaned up all worktrees and task branches**
- [ ] **Phase 5: VERIFICATION - Re-run detectors on fixed file (record count: M)**
- [ ] **Phase 5: Verify M < N (violation count DECREASED)**
- [ ] **Phase 5: Check for suppression comments - if found, FIX FAILED**
- [ ] **Phase 5: Run type check - if errors introduced, FIX FAILED**
- [ ] **Phase 5: If FIX FAILED, REVERT changes and restore original code**
- [ ] Output: Presented final compliance report WITH verification results

**If ANY checkbox is not complete, the workflow is INCOMPLETE. Continue working.**

**If verification fails (suppression comments, type errors, or increased violations), REVERT and report failure.**

## ⛔ MANDATORY PHASE 5: VERIFICATION

After Phase 4 merges all fixes into main, you MUST verify the fixes worked:

### Step 1: Re-run detectors
```bash
cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:all <file-path> --json 2>/dev/null
```

### Step 2: Check for suppression comments
```bash
grep -n "eslint-disable\|@ts-ignore\|@ts-expect-error\|biome-ignore\|prettier-ignore\|@ts-nocheck" <file-path>
```

### Step 3: Run type check
```bash
cd <project-root> && bun run check 2>&1 | grep -A2 "<file-path>"
```

### Step 4: Compare violation counts
```
Original violations: N (from Phase 1)
Current violations: M (from Step 1 re-run)

If M > N: FIX FAILED - violation count INCREASED
If M == N: FIX FAILED - nothing was fixed
If M < N: Partial or full success
If M == 0: Full success (if no suppression comments or type errors)
```

### Verification Outcomes:

**SUCCESS:** Zero violations AND zero suppression comments AND no type errors AND violation count decreased
- Report: "✅ All N violations fixed. File is now compliant."

**PARTIAL SUCCESS:** Some violations fixed, some remain, no regressions
- Report: "⚠️ X of N violations fixed. Y violations remain."
- List the remaining violations

**TOTAL FAILURE - SUPPRESSION COMMENTS:** Suppression comments were added instead of fixes
- Report: "❌ FIX FAILED: Workers added suppression comments instead of fixing code."
- This is a BUG in the workflow - the user got ZERO value
- List the suppression comments found
- **YOU MUST REVERT THE CHANGES** - the "fix" made things worse

**TOTAL FAILURE - TYPE ERRORS INTRODUCED:** Fixes broke type safety
- Report: "❌ FIX FAILED: Workers introduced N type errors."
- List the type errors
- **YOU MUST REVERT THE CHANGES** - the "fix" made things worse

**TOTAL FAILURE - VIOLATION COUNT INCREASED:** More violations after "fix" than before
- Report: "❌ FIX FAILED: Violation count increased from N to M."
- This means fixes were WRONG - they created new problems
- **YOU MUST REVERT THE CHANGES** - the "fix" made things worse

**NEVER report success if:**
- Suppression comments exist - They are evidence of failure
- Type errors were introduced - The code is now broken
- Violation count increased - The "fix" created more problems than it solved

### ⛔ MANDATORY REVERT ON FAILURE

If Phase 5 verification shows ANY of:
- Suppression comments added
- Type errors introduced
- Violation count increased

**YOU MUST:**
```bash
git log --oneline -5  # Find the commit before task-workers started
git reset --hard <commit-before-fixes>
```

Report: "❌ Fixes reverted. Original code restored. Fix attempt failed because: [reason]"

**The user is better off with their original code than with broken "fixes".**

### ⛔ PHASE 4 IS NOT OPTIONAL

The most common failure mode is stopping after Phase 3. Check yourself:

- Did you run `git branch | grep task-`? **If NO, you skipped Phase 4.**
- Did you spawn merge-worker agents? **If NO, you skipped Phase 4.**
- Did you see "Merged ... into main" message? **If NO, fixes are NOT applied.**

**Stopping after Phase 3 means the user's code is UNCHANGED. This is a FAILURE.**

## Usage

```
/effect-check src/services/UserService.ts           # Analyze only
/effect-check src/services/UserService.ts --fix     # Auto-fix with worktrees
/effect-check .                                      # Check entire directory
/effect-check . --fix                                # Fix entire directory
```
