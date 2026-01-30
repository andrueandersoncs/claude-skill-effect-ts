---
name: effect-check
description: Run Effect-TS compliance checks in parallel across all rule categories
argument-hint: "<file-path>"
allowed-tools:
  - Task
  - Read
  - Glob
---

# Parallel Effect-TS Compliance Checker

Run all Effect-TS rule categories as checks **in parallel** against a specified file. Each category spawns as a separate agent, checking rules concurrently for fast feedback.

## Instructions

1. **Read the target file** specified in the argument
2. **Discover all category files** from `${CLAUDE_PLUGIN_ROOT}/effect-agent/categories/*.json`
3. **Spawn parallel Task agents** - one per category - to check the file
4. **Aggregate results** and present a unified report

## Implementation

### Step 1: Get the file path from arguments

The user provides a file path like `/effect-check src/UserService.ts`

### Step 2: Read all category JSON files

Use Glob to find all category files:
- `${CLAUDE_PLUGIN_ROOT}/effect-agent/categories/*.json`

### Step 3: Launch parallel checks

For EACH category file, spawn a Task agent **in the same message** (parallel execution):

```
Task(
  subagent_type: "general-purpose",
  model: "haiku",  // Fast model for each check
  prompt: "Check this code against the '[CATEGORY_NAME]' Effect-TS rules.

## Category: [NAME]
[CATEGORY_DESCRIPTION]

## Rules to Check
[FOR EACH RULE IN CATEGORY]:
### Rule: [RULE_TEXT]
Bad pattern:
```typescript
[BAD_EXAMPLE]
```
Good pattern:
```typescript
[GOOD_EXAMPLE]
```

## Code to Analyze
File: [FILE_PATH]
```typescript
[FILE_CONTENTS]
```

## Task
1. Check the code against EACH rule in this category
2. For violations found, report:
   - Rule violated
   - Line number(s)
   - Code snippet showing violation
   - Suggested fix based on the 'good' pattern
3. If no violations for a rule, skip it
4. Return results in this format:

### [CATEGORY_NAME] Results
**Violations: [COUNT]**

[FOR EACH VIOLATION]:
#### Rule: [RULE_TEXT]
- **Line(s):** [LINE_NUMBERS]
- **Violation:** [DESCRIPTION]
- **Code:** `[SNIPPET]`
- **Fix:** [SUGGESTED_FIX]

If no violations in this category, return:
### [CATEGORY_NAME] Results
**Violations: 0** - All checks passed!
",
  description: "Check [CATEGORY_NAME] rules"
)
```

### Step 4: Aggregate and Report

After all parallel tasks complete, aggregate into a single report:

```
## Effect-TS Compliance Report

**File:** [FILE_PATH]
**Categories Checked:** [COUNT]
**Total Violations:** [SUM]

---

[INCLUDE RESULTS FROM EACH CATEGORY TASK]

---

## Summary
- Categories with violations: [LIST]
- Categories passed: [LIST]
- Priority fixes: [TOP 3 MOST CRITICAL VIOLATIONS]
```

## Important Notes

1. **MUST spawn all category checks in a single message** - this enables true parallel execution
2. **Use haiku model** for individual checks (fast, cheap)
3. **Read category JSON** and extract: `id`, `name`, `description`, `rules[]` (each with `rule`, `example.bad`, `example.good`)
4. **Include both bad AND good examples** in each prompt so the agent understands the pattern

## Usage

```
/effect-check src/services/UserService.ts
/effect-check src/handlers/api.ts
```
