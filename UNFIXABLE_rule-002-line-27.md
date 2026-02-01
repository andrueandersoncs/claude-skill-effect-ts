# UNFIXABLE: conditionals/rule-002 at line 27

## Issue
File: `effect-agent/categories/async/rule-002/rule-002.detector.ts`
Line: 27
Violation: Negated condition `!ts.isCallExpression(node)`
Rule: conditionals/rule-002 (schema-conditionals)

## Why This Cannot Be Fixed

The violation occurs in a **TypeScript type predicate function**:

```typescript
const isEffectGenCall = (node: ts.Node): node is ts.CallExpression => {
  if (!ts.isCallExpression(node)) return false;
  // ...
};
```

### TypeScript Constraint

Type predicates (functions with `X is Y` return type) have a **hard TypeScript requirement**: they MUST return a `boolean`, not an `Effect<boolean>` or any other type.

The `is` keyword performs **type narrowing** - it tells TypeScript to narrow the type of the parameter based on the boolean result. This is purely a compile-time type system feature that cannot be delayed or wrapped in an Effect.

### Why Match/Schema Won't Work

The rule suggests replacing with Schema.Union and Match:

```typescript
const FunctionNode = Schema.Union(
  Schema.declare((u): u is ts.FunctionDeclaration => ts.isFunctionDeclaration(u as ts.Node)),
  // ...
);

const handleNode = (node: ts.Node) =>
  Match.value(node).pipe(
    Match.when(Schema.is(FunctionNode), (fn) => `Found function`),
    Match.orElse(() => "Not a function node"),
  );
```

However, this:
1. Returns `Effect<string>`, not `Effect<CallExpression>`
2. Changes the function from a synchronous type guard to an asynchronous Effect pipeline
3. Breaks all 3 call sites that expect a boolean type predicate
4. Is impossible to retrofit without changing function signatures throughout the module

### Call Sites Affected

The `isEffectGenCall` function is used as a type guard at:
- Line 78: `if (isEffectGenCall(node)) { ... }`

This usage depends on the type narrowing behavior - after this check, TypeScript must know that `node` is a `CallExpression`.

## Architectural Reality

This is a fundamental incompatibility between:
1. **TypeScript's type system** (requires boolean for type predicates)
2. **Effect's philosophy** (Effects for all effectful operations)

A detector function for the AST that determines node types MUST be a synchronous type predicate. Converting it to Match would require restructuring the entire visitor pattern, which is an architectural change beyond the scope of rule-002.

## Conclusion

This violation cannot be fixed without breaking TypeScript's type system or redesigning the function's fundamental role as a type guard. This is an **UNFIXABLE** case where the rule's intent (use Match for conditionals) conflicts with unavoidable architectural constraints.
