---
name: effect-check
description: Run Effect-TS compliance checks - detectors flag issues, then LLM agents analyze violations in parallel
argument-hint: "<file-path>"
allowed-tools:
  - Bash
  - Read
  - Task
---

# Effect-TS Compliance Checker

Two-phase analysis: fast AST-based detection followed by LLM-powered analysis.

## Process Overview

1. **Phase 1: Detection** - Run AST-based detectors to flag violations (fast)
2. **Phase 2: Task Creation** - Create one task per violation for tracking
3. **Phase 3: Analysis** - Spawn category-checker agents in parallel (one per violation)
4. **Phase 4: Report** - Aggregate and present results

**Always use task lists.** Create specific, independent tasks to maximize parallelization.

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
- Subject: "Analyze [category]/[ruleId] at [file]:[line]"
- Description: Include violation details (message, snippet, severity)
```

This provides visibility into progress and enables parallel execution tracking.

### Phase 3: Spawn Violation Analyzers

For EACH violation, spawn a `category-checker` agent. **Maximize parallelism - no grouping.**

```
For EACH violation, use Task tool with:
- subagent_type: "effect-ts:category-checker"
- model: "haiku" (fast, cost-effective)
- prompt: Include the single violation details
```

**CRITICAL**: Spawn ALL agents in a SINGLE message. One agent per violation = maximum parallelism.

Example prompt for each agent:
```
Analyze this [CATEGORY] violation:

File: [FILE_PATH]
Line: [LINE]:[COLUMN]
Rule: [ruleId]
Message: [message]
Snippet: [snippet]
Severity: [severity]
Certainty: [certainty]

Read the source file, understand the context, and provide:
1. Why this pattern is problematic in Effect-TS
2. Idiomatic Effect-TS fix (copy-paste ready)
```

### Phase 4: Aggregate Results

Collect results from all category-checker agents and present a unified report. Mark tasks as completed as agents finish.

## Output Format

```markdown
## Effect-TS Compliance Report

**File:** [FILE_PATH]
**Files Analyzed:** [COUNT]

---

## Phase 1: Detector Summary

| Category | Errors | Warnings | Info |
|----------|--------|----------|------|
| [category] | [count] | [count] | [count] |

**Total:** [X] errors, [Y] warnings, [Z] info

---

## Phase 3: Detailed Analysis

[INCLUDE EACH CATEGORY-CHECKER AGENT'S OUTPUT]

---

## Action Items

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
/effect-check src/services/UserService.ts
/effect-check src/handlers/api.ts
/effect-check .  # Check entire directory
```
