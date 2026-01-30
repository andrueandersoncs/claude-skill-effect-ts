---
name: effect-check
description: Run Effect-TS compliance checks in parallel across all rule categories
argument-hint: "<file-path>"
allowed-tools:
  - Bash
  - Read
---

# Effect-TS Compliance Checker

Run static analysis to detect Effect-TS anti-patterns using the TypeScript Compiler API.

## Instructions

1. **Get the target file path** from the command argument
2. **Run the detector** using Bash with the detection script
3. **Format and present** the results

## Implementation

### Step 1: Run the Detector

Execute the detection script on the target file:

```bash
cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:all <file-path> --json 2>/dev/null
```

The `detect:all` script runs all category detectors and outputs JSON with:
- `filesAnalyzed`: Number of files checked
- `violations`: Array of violation objects
- `errors`: Any analysis errors

### Step 2: Parse and Format Results

Each violation in the JSON output contains:
- `ruleId`: The specific rule violated
- `category`: Category (async, errors, imperative, etc.)
- `message`: Description of the violation
- `filePath`: File where violation was found
- `line`: Line number
- `column`: Column number
- `snippet`: Code snippet showing the violation
- `severity`: "error" | "warning" | "info"
- `certainty`: "definite" | "potential"
- `suggestion`: How to fix it

### Step 3: Present Report

Format the output as:

```
## Effect-TS Compliance Report

**File:** [FILE_PATH]
**Violations Found:** [COUNT]

---

### ❌ Errors ([COUNT])

[FOR EACH ERROR-SEVERITY VIOLATION]:
**[LINE]:[COLUMN]** `[category/ruleId]` [certainty]
> [message]
```
[snippet]
```
💡 [suggestion]

---

### ⚠️ Warnings ([COUNT])

[FOR EACH WARNING-SEVERITY VIOLATION]:
**[LINE]:[COLUMN]** `[category/ruleId]` [certainty]
> [message]
```
[snippet]
```
💡 [suggestion]

---

### ℹ️ Info ([COUNT])

[FOR EACH INFO-SEVERITY VIOLATION]:
**[LINE]:[COLUMN]** `[category/ruleId]` [certainty]
> [message]
💡 [suggestion]

---

## Summary by Category

| Category | Errors | Warnings | Info |
|----------|--------|----------|------|
| [category] | [count] | [count] | [count] |

## Certainty Breakdown
- **Definite violations:** [COUNT] (must fix)
- **Potential violations:** [COUNT] (review recommended)
```

## Categories Checked

The detector checks 11 categories:

| Category | Detects |
|----------|---------|
| `async` | async/await, Promises, setTimeout/setInterval |
| `code-style` | Non-null assertions, type casts, function keyword |
| `comments` | TODO comments, redundant comments |
| `conditionals` | if/else, switch/case, ternary operators |
| `discriminated-unions` | Direct ._tag access |
| `errors` | try/catch, throw, untyped Error |
| `imperative` | for/while loops, mutation operators |
| `native-apis` | Object.keys, JSON.parse, Array methods |
| `schema` | Interfaces/types without Schema |
| `services` | Direct fetch/fs calls |
| `testing` | Effect.runPromise in tests |

## Severity Levels

- **Error**: Must fix - clearly violates Effect-TS patterns
- **Warning**: Should fix - likely a problem
- **Info**: Consider fixing - suggestions for improvement

## Certainty Levels

- **Definite**: 100% certain violations (e.g., `for` loops, `try/catch`)
- **Potential**: Likely violations that may need context (e.g., interfaces)

## Options

You can filter results by passing additional flags:

```bash
# Only errors, no potential violations
bun run detect -s error --no-potential <file>

# Specific categories only
bun run detect -c imperative,conditionals <file>
```

## Usage

```
/effect-check src/services/UserService.ts
/effect-check src/handlers/api.ts
/effect-check .  # Check entire directory
```
