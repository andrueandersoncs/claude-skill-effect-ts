# rule-011: type-predicate-union-schema

**Category:** conditionals
**Rule ID:** rule-011

## Rule

Never use type predicate functions with || chains; define a Schema.Union and use Match.when with Schema.is

## Description

Type predicate functions that use chains of type guards with `||` operators should be replaced with Schema unions and pattern matching. This provides better composability, type inference, and aligns with Effect's declarative approach.

## Bad Pattern

```typescript
// Type predicate with || chain
const isFunctionNode = (node: ts.Node): node is ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction =>
  ts.isFunctionDeclaration(node) ||
  ts.isFunctionExpression(node) ||
  ts.isArrowFunction(node);

// Usage requires manual type narrowing
if (isFunctionNode(node)) {
  // handle function node
}
```

## Good Pattern

```typescript
import { Schema, Match } from "effect";

// Define union schema with type refinements
const FunctionNode = Schema.Union(
  Schema.declare((u): u is ts.FunctionDeclaration => ts.isFunctionDeclaration(u as ts.Node)),
  Schema.declare((u): u is ts.FunctionExpression => ts.isFunctionExpression(u as ts.Node)),
  Schema.declare((u): u is ts.ArrowFunction => ts.isArrowFunction(u as ts.Node))
);

// Use pattern matching for exhaustive handling
const handleNode = (node: ts.Node) =>
  Match.value(node).pipe(
    Match.when(Schema.is(FunctionNode), (fn) => /* handle function */),
    Match.orElse(() => /* handle other nodes */)
  );
```

## Detection

This rule can be detected by the `rule-011.detector.ts` file.
