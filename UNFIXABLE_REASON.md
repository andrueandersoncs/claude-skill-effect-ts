# Unfixable Violation: code-style/rule-005 at Line 79

## Location
File: `effect-agent/categories/async/rule-001/rule-001.detector.ts`
Line: 79:8
Rule: rule-005
Message: Plain function 'isNodeLike'; consider Effect.fn() for traceability

## Code in Question
```typescript
const isNodeLike = (val: unknown): val is object =>
  typeof val === "object" && val !== null && "kind" in val;
```

## Why This Is Unfixable

This function is a **TypeScript type predicate**. Type predicates are a language feature that require:
1. **Return type must be `boolean`** - This is a TypeScript language requirement for type guards
2. **Return value must be a boolean expression** - Not wrapped in any Effect or other data structure

The rule-005 guidance to use `Effect.fn()` is incompatible with type predicates because:
- `Effect.fn()` wraps functions to return `Effect<T, E, R>` for traceability
- Type predicates must return exactly `boolean`, not `Effect<boolean>`
- There is no way to wrap a type predicate in Effect.fn() without breaking its type-guard functionality

## Existing Documentation
The code already acknowledges this limitation in comments:
- **Lines 42-43**: "Type predicates cannot use Effect.fn() as they must return boolean, not Effect."
- **Lines 92-93**: "Type guards cannot be wrapped in Effect.fn() as they must return boolean, not Effect"

## Recommendation
This is a necessary exception to rule-005. The code is correct as written, and the type predicate should remain a plain function. Consider suppressing this violation with `// eslint-disable-next-line @effect-ts/rule-005` if the linting tool supports it.
