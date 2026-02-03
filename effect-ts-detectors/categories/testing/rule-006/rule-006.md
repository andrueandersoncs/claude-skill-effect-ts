# rule-006: property-based-testing

**Category:** testing
**Rule ID:** rule-006

## Rule

Use property-based testing with Schema: it.prop, it.effect.prop, and Arbitrary.make

## Description

Property-based testing in Effect-TS should leverage Schema types for generating test data. This provides:
- Type-safe test data generation from your existing schemas
- Automatic edge case discovery
- Better test coverage than hardcoded values
- Integration with Effect's test utilities

### Anti-Patterns Detected

1. **Stubbed methods as "not implemented"** - Use Arbitrary-generated responses instead
2. **Hardcoded values in test layers** - Generate values with Arbitrary.make(Schema)
3. **Raw fast-check arbitraries (fc.integer, fc.string)** - Use Schema types with it.prop
4. **Manual fc.assert/fc.property usage** - Use it.effect.prop from @effect/vitest
5. **layer() without property-based tests** - Combine with it.effect.prop for full coverage
6. **Hardcoded test data arrays** - Use Schema-based generation

## Good Patterns

### 1. Test Layer with Arbitrary-Generated Responses

```typescript
import { Arbitrary, Array, Context, Effect, Layer, Option, pipe } from "effect";
import * as fc from "effect/FastCheck";
import { User, type UserId } from "./schemas.js";

const TestLayer = Layer.effect(
  MyService,
  Effect.sync(() => {
    const UserArb = Arbitrary.make(User);
    return {
      getUser: (_id: UserId) =>
        Effect.succeed(
          pipe(fc.sample(UserArb, 1), Array.head, Option.getOrThrow)
        ),
      updateUser: (_user: User) => Effect.void,
    };
  })
);
```

### 2. Property-Based Tests with Schema

```typescript
import { expect, it } from "@effect/vitest";
import { Schema } from "effect";

// Use Schema types directly as arbitraries
it.prop(
  "should be commutative",
  { a: Schema.Int, b: Schema.Int },
  ({ a, b }) => {
    expect(a + b).toBe(b + a);
  }
);
```

### 3. Effect Property Tests

```typescript
import { expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { Order, processOrder } from "./schemas.js";

it.effect.prop(
  "should process any valid order",
  { order: Order },
  ({ order }) =>
    Effect.gen(function* () {
      const result = yield* processOrder(order);
      expect(result.status).toBe("completed");
    })
);
```

### 4. Combining layer() with Property-Based Tests

```typescript
import { expect, layer } from "@effect/vitest";
import { Effect } from "effect";
import { Order } from "./schemas.js";

layer(TestEnv)("Order Processing", (it) => {
  it.effect.prop(
    "should process any valid order",
    { order: Order },
    ({ order }) =>
      Effect.gen(function* () {
        const result = yield* processOrder(order);
        expect(result.status).toBe("completed");
      })
  );
});
```

## Detection

This rule detects:
- `throw new Error("not implemented")` and similar stubs in test files
- `Effect.die/fail` with "not implemented" messages
- Raw fast-check arbitraries: `fc.integer()`, `fc.string()`, etc.
- Manual `fc.assert()` and `fc.property()` usage
- `Layer.succeed` with hardcoded object literals in test files
- `layer()` usage without corresponding property-based tests
- Large hardcoded test data arrays

See `rule-006.detector.ts` for the implementation.
