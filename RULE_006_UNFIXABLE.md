# Rule-006 Violation: UNFIXABLE

## Location
File: effect-agent/categories/async/rule-001/rule-001.detector.ts
Line: 119
Rule: conditionals/rule-006

## Violation
Null/undefined checks should use Option.match:
```typescript
if (typeof u !== "object" || u === null || !("kind" in u)) {
    return false;
}
```

## Why This Is Unfixable

The code appears in a TypeScript type predicate function:
```typescript
Schema.declare((u): u is ts.FunctionExpression => {
    // This must return boolean, not an Option
    if (typeof u !== "object" || u === null || !("kind" in u)) {
        return false;
    }
    return ts.isFunctionExpression(u as ts.Node);
})
```

### Technical Constraint
- Type predicates have signature: `(value: unknown): value is T`
- They MUST return `boolean` (true or false)
- `Option.match()` does NOT return boolean - it returns the handler result type
- Using `Option.match` would break TypeScript's type narrowing semantics

### Why Option.match Cannot Work Here
1. `Option.match` is designed for effectful handling: `Option.match(opt, { onSome: fn, onNone: fn })`
2. It returns whatever the handler functions return
3. If we tried to use it: `Option.match(someOption, { onSome: () => true, onNone: () => false })`
4. This still works syntactically but VIOLATES the purpose of the rule
5. The rule wants nullable handling through Option-based pipelines, not boolean returns

## Conclusion
This violation cannot be fixed without:
- Removing the type predicate signature (breaking schema validation)
- Or using option.match in a way that defeats the rule's intent
- Or restructuring the entire function type

The current implementation is correct for TypeScript type predicates and should remain unchanged.
