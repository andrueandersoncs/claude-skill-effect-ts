---
name: effect-check
description: Run Effect-TS compliance checks - diagnose root causes, then fix grouped violations
argument-hint: "<file-path> [--fix]"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
---

# Effect-TS Compliance Checker

Run detectors on TypeScript files and optionally fix violations using the diagnosis-first approach.

## Usage

```
/effect-check <path>           # Report violations only
/effect-check <path> --fix     # Diagnose root causes and fix violations
```

## Detection Mode (no --fix)

Run detectors and report:
```bash
cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:all <path>
```

Report the violations grouped by category and rule.

## Fix Mode (--fix flag)

### Phase 1: Diagnosis

**CRITICAL: Diagnose BEFORE fixing.** Run the diagnosis script to understand root causes:

```bash
bun ${CLAUDE_PLUGIN_ROOT}/scripts/effect-diagnose/diagnose-v0.4.ts <path>
```

This outputs:
- **Root causes** grouped by category (LOCAL_FIX, RESTRUCTURE, EXCEPTION)
- **Fix plan** showing what to do for each root cause
- **Violation counts** per root cause

### Phase 2: Review Diagnosis

Understand the diagnosis output:

| Category | Meaning | Action |
|----------|---------|--------|
| LOCAL_FIX | Can fix without restructuring | Apply the suggested fix |
| RESTRUCTURE | Needs design change | Apply if clear, otherwise ask user |
| EXCEPTION | Cannot be fixed (type predicates, etc.) | Document and skip |

### Phase 3: Apply Fixes

Run with --apply to execute the fixes:

```bash
bun ${CLAUDE_PLUGIN_ROOT}/scripts/effect-diagnose/diagnose-v0.4.ts <path> --apply
```

If the script fails or produces suboptimal results, fall back to manual fixes:
1. Read the file
2. For each ROOT CAUSE (not each violation):
   - Apply the suggested alternative from diagnosis
   - Verify each fix: `cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:all <path>`
3. After all fixes, verify no type errors: `cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run check`

### Phase 4: Report

Show before/after comparison:

```markdown
## Effect-TS Compliance Report

**File:** [path]
**Mode:** Fix (diagnosis-first)

### Diagnosis Summary
- Total violations: N
- Root causes: M
  - LOCAL_FIX: X
  - RESTRUCTURE: Y
  - EXCEPTION: Z

### Fixes Applied
1. Root cause: [title]
   - Violations fixed: [list]
   - Change: [what was done]

### Skipped (EXCEPTION)
1. [title]: [reason - e.g., "type predicate must return boolean"]

### Results
- Violations: N → M (X% reduction)
- Type errors: 0 ✅
- Suppression comments: 0 ✅
```

## Why Diagnosis-First?

The old approach (fix each violation independently) often makes things worse:
- Workers fight each other
- Suppression comments get added
- Duplicate code appears

Diagnosis-first treats **violations as symptoms**, not problems. Multiple violations often share a single root cause. Fixing the root cause fixes all related violations at once.

**Evidence (from experiments):**
| Approach | Violations | Type Errors |
|----------|------------|-------------|
| Per-violation (old) | 20 → 20+ | 3 → 6+ (worse) |
| Diagnosis-first | 20 → 5 | 3 → 0 |

## Constraints

- **No suppression comments** - NEVER add eslint-disable, @ts-ignore, etc.
- **No dangerous assertions** - NEVER use `as any` or `as unknown as X`
- **Delete don't duplicate** - When fixing, remove the old code entirely
- **Document exceptions** - Explain why EXCEPTION patterns can't be fixed
