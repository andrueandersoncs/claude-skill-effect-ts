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

**You MUST follow this process exactly. Do NOT "optimize" or skip steps.**

FORBIDDEN actions:
- ❌ Creating fewer tasks than violations found
- ❌ Deciding to "apply fixes directly" instead of spawning agents
- ❌ Reasoning that worktrees will conflict (they are isolated by design)
- ❌ Batching multiple violations into a single task
- ❌ Skipping task creation or agent spawning for "efficiency"
- ❌ Any deviation from: 1 violation = 1 task = 1 agent

The worktree approach EXISTS to handle overlapping violations. Each agent works in complete isolation. Merge conflicts are resolved in Phase 4, not avoided by skipping parallelization.

If you find yourself thinking "it would be more efficient to..." - STOP. Follow the process exactly as written.

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

**VERIFY: Number of Task tool calls MUST equal number of violations.** If 97 violations, spawn exactly 97 agents in one message. Do NOT reason about efficiency, conflicts, or batching.

#### Analyze Mode (default)

Spawn `category-checker` agents for analysis only:

```
For EVERY violation, use Task tool with:
- subagent_type: "effect-ts:category-checker"
- model: "haiku"
- prompt: Include the single violation details and task ID
```

#### Fix Mode (--fix)

Spawn `task-worker` agents with worktree isolation:

```
For EVERY violation, use Task tool with:
- subagent_type: "effect-ts:task-worker"
- model: "haiku"
- prompt: Include task ID, violation details, and rule documentation path
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

Fix this [CATEGORY] violation:

File: [FILE_PATH]
Line: [LINE]:[COLUMN]
Rule: [ruleId]
Message: [message]
Snippet: [snippet]

Rule documentation: ${CLAUDE_PLUGIN_ROOT}/effect-agent/categories/[category]/rule-NNN/rule-NNN.md

Apply the idiomatic Effect-TS fix in your worktree.
```

### Phase 4: Aggregate Results / Merge Branches

#### Analyze Mode
Collect results from all category-checker agents and present a unified report. Mark tasks as completed as agents finish.

#### Fix Mode
After all task-workers complete:
1. Merge each branch into the current branch:
   ```bash
   git merge task-<task-id> --no-edit
   ```
2. Remove worktrees and branches:
   ```bash
   git worktree remove ../worktree-task-<task-id>
   git branch -d task-<task-id>
   ```
3. Present summary of all fixes applied

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
