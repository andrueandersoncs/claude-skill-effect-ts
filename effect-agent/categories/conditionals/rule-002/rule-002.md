# rule-002: schema-conditionals

**Category:** conditionals
**Rule ID:** rule-002

## Rule

Never use imperative conditionals (if/else, switch, ||, &&); define Schema types and use Match.when with Schema.is for declarative pattern matching.

## Description

This rule consolidates multiple related patterns for replacing imperative conditional logic with Effect's declarative approach using Schema definitions and Match:

1. **Literal unions** - Replace `||` chains comparing literals with `Schema.Literal` union
2. **Struct conditions** - Replace `&&` chains checking object properties with `Schema.Struct`
3. **Multi-condition assignment** - Replace `let` + `if/else` reassignment with `Match.value`
4. **Multi-condition matching** - Replace if/else chains with Schema predicates and Match
5. **Numeric classification** - Replace numeric comparisons with Schema filters
6. **Type predicate replacement** - Replace type predicate functions with `Schema.Union`

## Good Patterns

### Literal Union Matching

```typescript
import { Function, Match, Schema } from "effect";

const Weekend = Schema.Literal("Saturday", "Sunday");

const isWeekend = Match.type<string>().pipe(
  Match.when(Schema.is(Weekend), Function.constant(true)),
  Match.orElse(Function.constant(false)),
);
```

### Struct Condition Matching

```typescript
const VerifiedAdmin = Schema.Struct({
  role: Schema.Literal("admin"),
  verified: Schema.Literal(true),
});

const canDelete = Match.type<User>().pipe(
  Match.when(Schema.is(VerifiedAdmin), Function.constant(true)),
  Match.orElse(Function.constant(false)),
);
```

### Multi-Condition Assignment

```typescript
const Condition1Active = Schema.Struct({
  condition1: Schema.Literal(true),
  condition2: Schema.Boolean,
});

const assignmentResult = Match.value({ condition1, condition2 }).pipe(
  Match.when(Schema.is(Condition1Active), Function.constant(value1)),
  Match.when(Schema.is(Condition2Active), Function.constant(value2)),
  Match.orElse(Function.constant(defaultValue)),
);
```

### Numeric Classification

```typescript
const Zero = Schema.Literal(0);
const Negative = Schema.Number.pipe(Schema.negative());
const Positive = Schema.Number.pipe(Schema.positive());

const classify = Match.type<number>().pipe(
  Match.when(Schema.is(Zero), Function.constant("zero")),
  Match.when(Schema.is(Negative), Function.constant("negative")),
  Match.when(Schema.is(Positive), Function.constant("positive")),
  Match.exhaustive,
);
```

### Type Predicate Replacement

```typescript
const FunctionNode = Schema.Union(
  Schema.declare((u): u is ts.FunctionDeclaration => ts.isFunctionDeclaration(u as ts.Node)),
  Schema.declare((u): u is ts.FunctionExpression => ts.isFunctionExpression(u as ts.Node)),
  Schema.declare((u): u is ts.ArrowFunction => ts.isArrowFunction(u as ts.Node)),
);

const handleNode = (node: ts.Node) =>
  Match.value(node).pipe(
    Match.when(Schema.is(FunctionNode), (fn) => `Found function at ${fn.pos}`),
    Match.orElse(() => "Not a function node"),
  );
```

## Bad Patterns

- `if (x === "a" || x === "b")` - Use Schema.Literal union
- `if (obj.prop1 && obj.prop2)` - Use Schema.Struct
- `let result = default; if (cond) result = x;` - Use Match.value
- `if (n > 0) ... else ...` - Use Schema filters with Match
- `const isX = (n): n is A | B => isA(n) || isB(n)` - Use Schema.Union

## Detection

This rule can be detected by the `rule-002.detector.ts` file.
