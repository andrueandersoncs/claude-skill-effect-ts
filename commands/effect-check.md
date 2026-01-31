---
name: effect-check
description: Run Effect-TS compliance checks
argument-hint: "<file-path> [--fix]"
allowed-tools:
  - Bash
  - Read
  - Write
---

# Effect-TS Compliance Checker

## Without --fix
`cd effect-agent && bun run detect:all <path>`

## With --fix

### Process
1. Run `cd effect-agent && bun run detect:all <path>` to see all violations
2. Read the entire file
3. **Rewrite the entire file once** with all fixable violations addressed
4. Use Write tool to replace the file completely
5. Verify: `cd effect-agent && bun run detect:all <path>`
6. Report before/after counts

### Transformations
- `if (x === null) {...}` → `Option.fromNullable(x).pipe(Option.match({onNone: ..., onSome: ...}))`
- `for (let i = 0; i < n; i++)` → `Array.from({length: n}, (_, i) => i).forEach(...)` or `Effect.forEach`
- `x ? a : b` → `Match.value(x).pipe(Match.when(...), Match.orElse(...))`
- `console.log` → `Effect.log`

### CRITICAL RULES
1. **ONE rewrite only** - Read file, transform all at once, write file. No multiple edits.
2. **Delete old code** - When replacing a pattern, REMOVE the original. Never keep both versions.
3. **Merge imports** - Add Effect imports to existing import statements. Don't duplicate.
4. **No suppressions** - NEVER add eslint-disable, @ts-ignore, etc.
5. **Preserve functionality** - Transformed code must do the same thing as original.
6. **Skip unfixable** - Some patterns can't be converted. Skip these and list them.
7. **Report what was fixed** - List each fix applied with line numbers.

### Unfixable Patterns (skip these, don't attempt to fix)
- Type predicates (`function isFoo(x): x is Foo`) - must return boolean synchronously
- `Schema.declare` callbacks - must be synchronous
- CLI tool fs operations that need sync behavior for exit codes
- Type guards in conditionals where caller expects sync boolean
- Test setup/teardown that needs sync behavior

When you encounter unfixable patterns:
- Leave the code UNCHANGED
- Document why in your report (e.g., "Line 45: Type predicate must return boolean, skipped")

### Example

Before:
```typescript
const x = getValue();
if (x === null) {
  console.log("error");
}
```

After (CORRECT - old code removed):
```typescript
import { Effect, Option } from "effect";

const x = getValue();
Option.fromNullable(x).pipe(
  Option.match({
    onNone: () => Effect.log("error"),
    onSome: () => Effect.void
  })
);
```

WRONG (keeping both):
```typescript
if (x === null) { ... }  // DO NOT KEEP THIS
Option.fromNullable(x)... // alongside this
```

### Report Format

```markdown
## Effect-TS Compliance Report

**File:** [path]
**Mode:** Fix

### Before
- Total violations: N
- By category: ...

### Fixes Applied
1. Line X: [what was changed]
2. Line Y: [what was changed]

### Skipped (Unfixable)
1. Line Z: [reason - e.g., "type predicate"]

### After
- Total violations: M
- Change: N → M (X fixed)

### Verification
- Suppression comments: 0 ✅
- Type errors introduced: 0 ✅
```
