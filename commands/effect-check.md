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
2. **Discover all category directories** from `${CLAUDE_PLUGIN_ROOT}/effect-agent/categories/*/`
3. **For each category**, read the README.md and all .ts rule files
4. **Spawn parallel Task agents** - one per category - to check the file
5. **Aggregate results** and present a unified report

## Implementation

### Step 1: Get the file path from arguments

The user provides a file path like `/effect-check src/UserService.ts`

### Step 2: Discover categories

Use Glob to find all category directories:
- `${CLAUDE_PLUGIN_ROOT}/effect-agent/categories/*/README.md`

Each directory name is a category (e.g., `async`, `errors`, `schema`).

### Step 3: For each category, gather rules

For each category directory:
1. Read `README.md` for category description
2. Glob for `*.ts` files (excluding `_fixtures.ts`)
3. Each `.ts` file represents a rule:
   - First two comment lines contain the rule and example description
   - Code shows the "good" pattern (lines marked with `// ✅ Good:`)
   - Some files may also show "bad" patterns (lines marked with `// ❌ Bad:`)

### Step 4: Launch parallel checks

For EACH category, spawn a Task agent **in the same message** (parallel execution):

```
Task(
  subagent_type: "general-purpose",
  model: "haiku",  // Fast model for each check
  prompt: "Check this code against the '[CATEGORY_NAME]' Effect-TS rules.

## Category: [NAME]
[README_CONTENT]

## Rules to Check
[FOR EACH .TS FILE IN CATEGORY]:
### Rule File: [FILENAME]
Rule: [FIRST_COMMENT_LINE - the rule]
Description: [SECOND_COMMENT_LINE - example description]

Good pattern:
```typescript
[GOOD_EXAMPLE_CODE from the file]
```

[IF BAD PATTERN EXISTS]:
Bad pattern (what to look for):
```typescript
[BAD_EXAMPLE_CODE from the file]
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

### Step 5: Aggregate and Report

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
3. **Read category README.md** for the category philosophy/description
4. **Parse rule .ts files** to extract:
   - Rule (first `// Rule:` comment)
   - Description (second `// Example:` comment)
   - Good pattern (code after `// ✅ Good:`)
   - Bad pattern (code after `// ❌ Bad:` if present)
5. **Not all rules have bad examples** - some only show the correct pattern

## Example Rule File Format

```typescript
// Rule: Never use throw statements; use Effect.fail()
// Example: Conditional throw based on state

import { Effect, Match } from "effect"

// ❌ Bad: Direct throw (may not be present in all files)
const badExample = () => {
  throw new Error("Something went wrong")
}

// ✅ Good: Effect.fail with typed error
const goodExample = Effect.fail(new MyTypedError({ ... }))

export { badExample, goodExample }
```

## Usage

```
/effect-check src/services/UserService.ts
/effect-check src/handlers/api.ts
```
