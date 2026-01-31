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

## Modes

- **Analyze mode** (default): Spawns `category-checker` agents to analyze violations and provide recommendations
- **Fix mode** (`--fix`): Spawns `task-worker` agents in isolated git worktrees to automatically apply fixes

## Process Overview

1. **Phase 1: Detection** - Run AST-based detectors to flag violations (fast)
2. **Phase 2: Task Creation** - Create one task per violation for tracking
3. **Phase 3: Analysis/Fix** - Spawn agents in parallel (one per EVERY violation)
4. **Phase 4: Report/Merge** - Aggregate results; if fix mode, merge branches and cleanup worktrees

**Always use task lists.** Create specific, independent tasks to maximize parallelization.

**MANDATORY: Investigate EVERY violation.** Do NOT filter, skip, or prioritize. Spawn an agent for EVERY error, warning, AND info violation found. No exceptions.

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

**NO FILTERING. NO EXCEPTIONS. NO PRIORITIZATION.**

- Spawn an agent for EVERY violation found
- Do NOT skip info-level violations
- Do NOT skip "less important" violations
- Do NOT reduce the number of agents for performance reasons
- Investigate ALL violations equally

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
5. Mark the task complete

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

Apply the idiomatic Effect-TS fix in your worktree. Commit to your task branch.
```

### Phase 4: Parallel Tournament Merge

#### Analyze Mode

Collect results from all category-checker agents and present a unified report. Mark tasks as completed as agents finish.

#### Fix Mode: Tournament Merge

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

    Merge branch_b INTO branch_a. Keep ALL fixes from BOTH.
    Clean up branch_b's worktree and delete branch_b after success.
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

## Usage

```
/effect-check src/services/UserService.ts           # Analyze only
/effect-check src/services/UserService.ts --fix     # Auto-fix with worktrees
/effect-check .                                      # Check entire directory
/effect-check . --fix                                # Fix entire directory
```
