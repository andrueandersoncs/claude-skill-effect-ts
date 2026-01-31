# Effect Diagnose: Design-First Refactoring

## Problem Statement

The current `effect-check --fix` process treats violations as independent problems to solve in isolation. This fails when violations share a common root cause that requires architectural change rather than local transformation.

**Example**: A file has 6 type predicates (`x is Foo`). Each triggers a violation. Task-workers try to wrap each in Effect, which breaks TypeScript's type narrowing. The real fix is to delete all 6 and use Schema-based validation instead.

## Solution: Diagnosis Before Fixing

**Before** fixing individual violations, run a **diagnostic phase** that:
1. Groups violations by root cause
2. Identifies alternative designs
3. Produces a refactoring plan (not a list of line fixes)

## Results

**Test file**: `effect-agent/categories/async/rule-001/rule-001.detector.ts`

| Stage | All Violations | Definite | Type Errors |
|-------|----------------|----------|-------------|
| Before (original) | 20 | 3 | 3 |
| After effect-check --fix (7 iterations) | 20+ | 3+ | 6+ (worse) |
| After diagnosis + fix | 14 | 3 | 0 |
| After proving Schema.is() > manual checks | 6 | 1 | 0 |
| Final (Schema.Class) | **5** | **0** | **0** |

**Key insight**: The diagnosis initially marked manual `typeof` checks as "EXCEPTION" because type predicates must return boolean. But writing a test proved `Schema.is()` is MORE CORRECT - it catches bugs the manual check misses.

**Root causes fixed**:
1. **Redundant type guard functions** (RESTRUCTURE) → Deleted unused functions
2. **Manual typeof checks in Schema.declare** → Replaced with `Schema.is(NodeLikeSchema)`
3. **Schema.Struct for NodeLikeSchema** → Converted to `Schema.Class`
4. **Redundant ViolationData type** (LOCAL_FIX) → Deleted

## Usage

```bash
# Diagnose a file (outputs human-readable analysis)
bun run scripts/effect-diagnose/diagnose-v0.1.ts <file>

# Diagnose a file (outputs JSON)
bun run scripts/effect-diagnose/diagnose-v0.2.ts <file>

# Verify each root cause can be fixed (runs fixes in isolation)
bun run scripts/effect-diagnose/diagnose-v0.3.ts <file>

# Preview fix plan (dry run)
bun run scripts/effect-diagnose/diagnose-v0.4.ts <file>

# Apply all fixes
bun run scripts/effect-diagnose/diagnose-v0.4.ts <file> --apply
```

## Why This Works

The key insight is that **violations are symptoms, not problems**. Multiple violations often share a single root cause.

| Approach | Asks | Result |
|----------|------|--------|
| effect-check (old) | "How do I fix line 51?" | Tries to wrap type predicate in Effect → breaks TypeScript |
| effect-diagnose (new) | "Why does line 51 exist?" | Realizes it's unused → deletes it |

## Integration Plan

1. ✅ **v0.1**: Simple diagnosis prompt
2. ✅ **v0.2**: Structured JSON output
3. ✅ **v0.3**: Verification of each root cause
4. ✅ **v0.4**: Combined fix application
5. ⬜ **v1.0**: Integrate as Phase 0 of effect-check

## Lessons Learned

The diagnosis initially accepted "EXCEPTION" too easily. Adding this to CLAUDE.md fixed the behavior:

```markdown
## Behavior

- Never ask "should I?" - try it and show results
- Never reason about whether something works - write a script that proves it
- Never accept your first answer - find at least one flaw and fix it
- Never mark something "done" or "exception" without a test proving it can't be improved
- When stuck, write a smaller test that isolates the problem
```

The test `test-schema-is-alternative.ts` proved that `Schema.is()` is MORE CORRECT than manual `typeof` checks - it catches a bug the manual approach misses.
