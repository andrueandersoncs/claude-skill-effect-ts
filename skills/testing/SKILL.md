---
name: Testing
description: This skill should be used when the user asks about "Effect testing", "@effect/vitest", "it.effect", "it.live", "it.scoped", "it.layer", "it.prop", "Schema Arbitrary", "property-based testing", "fast-check", "TestClock", "testing effects", "mocking services", "test layers", "TestContext", "Effect.provide test", "time testing", "Effect test utilities", "unit testing Effect", "generating test data", "flakyTest", or needs to understand how to test Effect-based code.
version: 1.1.0
---

# Testing in Effect

## Overview

Effect testing uses **`@effect/vitest`** as the standard test runner integration. This package provides Effect-aware test functions that handle Effect execution, scoped resources, layer composition, and TestClock injection automatically.

Since every data type should have a Schema, every data type can generate test data via `Arbitrary`. This makes **property-based testing the primary testing approach** in Effect.

**Core testing tools:**

- **@effect/vitest** - Effect-native test runner (`it.effect`, `it.scoped`, `it.live`, `it.layer`, `it.prop`)
- **Schema.Arbitrary** - Generate test data from any Schema (primary approach)
- **Property Testing** - Test invariants with generated data via `it.prop` or fast-check
- **Mock Layers** - Replace services with test doubles via `it.layer`
- **TestClock** - Control time in tests (automatically provided by `it.effect`)

## Setup

Install `@effect/vitest` alongside vitest (v1.6.0+):

```bash
pnpm add -D vitest @effect/vitest
```

Enable Effect-aware equality in your test setup:

```typescript
// vitest.setup.ts (or at top of test files)
import { addEqualityTesters } from "@effect/vitest"

addEqualityTesters()
```

## @effect/vitest - Core Test Functions

### it.effect - Standard Effect Tests

**Use `it.effect` for all Effect tests.** It automatically provides `TestContext` (including `TestClock`) and runs the Effect to completion. No `async`/`await` or `Effect.runPromise` needed.

```typescript
import { it, expect } from "@effect/vitest"
import { Effect } from "effect"

it.effect("should return user", () =>
  Effect.gen(function* () {
    const user = yield* getUser("123")
    expect(user.name).toBe("Alice")
  })
)
```

**NEVER use plain vitest `it` with `Effect.runPromise` when `it.effect` is available:**

```typescript
// ❌ FORBIDDEN: manual Effect.runPromise in async test
import { it, expect } from "vitest"

it("should return user", async () => {
  const result = await Effect.runPromise(getUser("123"))
  expect(result.name).toBe("Alice")
})

// ✅ REQUIRED: it.effect handles execution automatically
import { it, expect } from "@effect/vitest"

it.effect("should return user", () =>
  Effect.gen(function* () {
    const user = yield* getUser("123")
    expect(user.name).toBe("Alice")
  })
)
```

### it.scoped - Tests with Resource Management

Use `it.scoped` when your test needs a `Scope` (e.g., acquireRelease resources). The scope is automatically closed when the test ends.

```typescript
import { it, expect } from "@effect/vitest"
import { Effect } from "effect"

it.scoped("should manage database connection", () =>
  Effect.gen(function* () {
    const conn = yield* acquireDbConnection  // acquireRelease resource
    const result = yield* conn.query("SELECT 1")
    expect(result).toBeDefined()
    // Connection is automatically released when test ends
  })
)
```

### it.live - Tests with Live Environment

Use `it.live` when you need the real runtime environment (real clock, real logger) instead of test services.

```typescript
import { it, expect } from "@effect/vitest"
import { Effect } from "effect"

it.live("should measure real time", () =>
  Effect.gen(function* () {
    const start = Date.now()
    yield* Effect.sleep("10 millis")
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(10)
  })
)
```

- `it.scopedLive` combines scoped resources with the live environment.

### it.layer - Tests with Shared Layers

Use `it.layer` to provide dependencies to a group of tests. The layer is constructed once and shared across all tests in the block.

```typescript
import { it, expect, layer } from "@effect/vitest"
import { Effect, Layer, Context } from "effect"

class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  {
    readonly findById: (id: string) => Effect.Effect<User, UserNotFound>
    readonly save: (user: User) => Effect.Effect<void>
  }
>() {}

const TestUserRepo = Layer.succeed(UserRepository, {
  findById: (id) =>
    id === "123"
      ? Effect.succeed(new User({ id: "123", name: "Alice", email: "alice@test.com" }))
      : Effect.fail(new UserNotFound({ userId: id })),
  save: () => Effect.void
})

// Top-level layer wrapping a describe block
layer(TestUserRepo)("UserService", (it) => {
  it.effect("should find user by id", () =>
    Effect.gen(function* () {
      const repo = yield* UserRepository
      const user = yield* repo.findById("123")
      expect(user.name).toBe("Alice")
    })
  )

  it.effect("should fail for missing user", () =>
    Effect.gen(function* () {
      const repo = yield* UserRepository
      const exit = yield* Effect.exit(repo.findById("unknown"))
      expect(exit._tag).toBe("Failure")
    })
  )
})

// Nested layers for composing dependencies
layer(TestUserRepo)("nested layers", (it) => {
  it.layer(AnotherLayer)((it) => {
    it.effect("has both dependencies", () =>
      Effect.gen(function* () {
        const repo = yield* UserRepository
        const other = yield* AnotherService
        // Both available
      })
    )
  })
})
```

### Test Modifiers

All test variants support standard Vitest modifiers:

```typescript
it.effect.skip("temporarily disabled", () => Effect.sync(() => {}))
it.effect.only("run only this test", () => Effect.sync(() => {}))
it.effect.fails("expected to fail", () => Effect.fail(new Error("expected")))

// Conditional execution
it.effect.skipIf(process.env.CI)("skip on CI", () => Effect.sync(() => {}))
it.effect.runIf(process.env.CI)("only on CI", () => Effect.sync(() => {}))

// Parameterized tests
it.effect.each([1, 2, 3])("processes %d", (num) =>
  Effect.gen(function* () {
    const result = yield* processNumber(num)
    expect(result).toBeGreaterThan(0)
  })
)
```

### it.flakyTest - Retry Flaky Tests

Use `it.flakyTest` for tests that may not succeed on the first attempt due to timing, external dependencies, or randomness:

```typescript
import { it } from "@effect/vitest"
import { Effect } from "effect"

it.effect("should eventually succeed", () =>
  it.flakyTest(
    unreliableExternalCall(),
    "5 seconds"  // Max retry duration
  )
)
```

## Property-Based Testing

### it.prop - Schema-Aware Property Tests

`it.prop` integrates property-based testing directly into `@effect/vitest`. It accepts Schema types or fast-check Arbitraries.

```typescript
import { it, expect } from "@effect/vitest"
import { Schema } from "effect"

// Array form with positional arguments
it.prop("addition is commutative", [Schema.Int, Schema.Int], ([a, b]) => {
  expect(a + b).toBe(b + a)
})

// Object form with named arguments
it.prop(
  "validates user fields",
  {
    name: Schema.NonEmptyString,
    age: Schema.Number.pipe(Schema.int(), Schema.between(0, 150))
  },
  ({ name, age }) => {
    expect(name.length).toBeGreaterThan(0)
    expect(age).toBeGreaterThanOrEqual(0)
  }
)

// Effect-based property test
it.effect.prop(
  "async property",
  [Schema.String],
  ([input]) =>
    Effect.gen(function* () {
      const result = yield* processInput(input)
      expect(result).toBeDefined()
    })
)

// With fast-check options
it.prop(
  "with custom runs",
  [Schema.Int],
  ([n]) => { expect(n + 0).toBe(n) },
  { fastCheck: { numRuns: 1000 } }
)
```

### Schema.Arbitrary - Generating Test Data

Every Schema can generate random valid test data. This is the foundation of Effect testing.

```typescript
import { Schema, Arbitrary } from "effect"
import * as fc from "fast-check"

// Define your schema (you should already have this)
class User extends Schema.Class<User>("User")({
  id: Schema.String.pipe(Schema.minLength(1)),
  name: Schema.String.pipe(Schema.minLength(1)),
  email: Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/)),
  age: Schema.Number.pipe(Schema.int(), Schema.between(0, 150))
}) {}

// Create an arbitrary from the schema
const UserArbitrary = Arbitrary.make(User)

// Generate test data
fc.sample(UserArbitrary(fc), 3)
// => [
//   User { id: "a", name: "xyz", email: "foo@bar.com", age: 42 },
//   User { id: "test", name: "b", email: "x@y.z", age: 0 },
//   ...
// ]
```

### With Schema.TaggedClass (Discriminated Unions)

```typescript
import { Schema, Arbitrary, Match } from "effect"
import * as fc from "fast-check"

class Pending extends Schema.TaggedClass<Pending>()("Pending", {
  orderId: Schema.String,
  items: Schema.Array(Schema.String)
}) {}

class Shipped extends Schema.TaggedClass<Shipped>()("Shipped", {
  orderId: Schema.String,
  items: Schema.Array(Schema.String),
  trackingNumber: Schema.String
}) {}

class Delivered extends Schema.TaggedClass<Delivered>()("Delivered", {
  orderId: Schema.String,
  items: Schema.Array(Schema.String),
  deliveredAt: Schema.Date
}) {}

const Order = Schema.Union(Pending, Shipped, Delivered)
type Order = Schema.Schema.Type<typeof Order>

// Arbitrary for the entire union - generates all variants
const OrderArbitrary = Arbitrary.make(Order)

// Arbitrary for specific variants
const PendingArbitrary = Arbitrary.make(Pending)
const ShippedArbitrary = Arbitrary.make(Shipped)
```

### Customizing Arbitrary Generation

Use `Schema.annotations` to control generated values:

```typescript
const Email = Schema.String.pipe(
  Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/),
  Schema.annotations({
    arbitrary: () => (fc) =>
      fc.emailAddress()  // Use fast-check's email generator
  })
)

const UserId = Schema.String.pipe(
  Schema.minLength(1),
  Schema.annotations({
    arbitrary: () => (fc) =>
      fc.uuid()  // Generate UUIDs
  })
)

const Age = Schema.Number.pipe(
  Schema.int(),
  Schema.between(18, 100),
  Schema.annotations({
    arbitrary: () => (fc) =>
      fc.integer({ min: 18, max: 100 })
  })
)
```

## Property-Based Testing Patterns

### Round-Trip Testing (Encode/Decode)

Every Schema should pass round-trip testing:

```typescript
import { it, expect } from "@effect/vitest"
import { Schema, Arbitrary } from "effect"
import * as fc from "fast-check"

describe("User schema", () => {
  const UserArbitrary = Arbitrary.make(User)

  it.prop("should survive encode/decode round-trip", [UserArbitrary], ([user]) => {
    const encoded = Schema.encodeSync(User)(user)
    const decoded = Schema.decodeUnknownSync(User)(encoded)

    // Verify structural equality
    expect(decoded).toEqual(user)

    // Verify it's still a User instance
    expect(decoded).toBeInstanceOf(User)
  })
})
```

### Testing Discriminated Unions Exhaustively

```typescript
describe("Order processing", () => {
  it.prop("should handle all order states", [Arbitrary.make(Order)], ([order]) => {
    // This must handle ALL variants - Match.exhaustive ensures it
    const result = Match.value(order).pipe(
      Match.when(Schema.is(Pending), (o) => `Pending: ${o.orderId}`),
      Match.when(Schema.is(Shipped), (o) => `Shipped: ${o.trackingNumber}`),
      Match.when(Schema.is(Delivered), (o) => `Delivered: ${o.deliveredAt}`),
      Match.exhaustive
    )

    expect(typeof result).toBe("string")
  })
})
```

### Testing Invariants

```typescript
class BankAccount extends Schema.Class<BankAccount>("BankAccount")({
  id: Schema.String,
  balance: Schema.Number.pipe(Schema.nonNegative()),
  transactions: Schema.Array(Schema.Number)
}) {
  get computedBalance() {
    return this.transactions.reduce((sum, t) => sum + t, 0)
  }
}

describe("BankAccount invariants", () => {
  it.prop("should never have negative balance", [Arbitrary.make(BankAccount)], ([account]) => {
    expect(account.balance).toBeGreaterThanOrEqual(0)
  })
})
```

### Testing Transformations

```typescript
const MoneyFromCents = Schema.transform(
  Schema.Number.pipe(Schema.int()),
  Schema.Number,
  {
    decode: (cents) => cents / 100,
    encode: (dollars) => Math.round(dollars * 100)
  }
)

describe("Money transformation", () => {
  it.prop("should preserve value through transform", [Schema.Int.pipe(Schema.between(0, 1000000))], ([cents]) => {
    const dollars = Schema.decodeSync(MoneyFromCents)(cents)
    const backToCents = Schema.encodeSync(MoneyFromCents)(dollars)

    // Allow for floating point rounding
    expect(backToCents).toBe(cents)
  })
})
```

### Testing Idempotency

```typescript
describe("Normalization is idempotent", () => {
  it.prop("normalizing twice equals normalizing once", [Arbitrary.make(Email)], ([email]) => {
    const once = normalizeEmail(email)
    const twice = normalizeEmail(normalizeEmail(email))
    expect(twice).toBe(once)
  })
})
```

### Testing Commutativity

```typescript
describe("Order total calculation", () => {
  it.prop("total is independent of item order", { items: Schema.Array(OrderItem) }, ({ items }) => {
    const total1 = calculateTotal(items)
    const total2 = calculateTotal([...items].reverse())
    expect(total1).toBe(total2)
  })
})
```

## Testing Services with Layers

Combine `it.layer` with Arbitrary for service-level testing:

```typescript
import { it, expect, layer } from "@effect/vitest"
import { Effect, Layer, Context, Ref, Option } from "effect"

class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  {
    readonly save: (user: User) => Effect.Effect<void>
    readonly findById: (id: string) => Effect.Effect<User, UserNotFound>
  }
>() {}

// Stateful test layer
const TestUserRepo = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const usersRef = yield* Ref.make<Map<string, User>>(new Map())

    return {
      save: (user: User) =>
        Ref.update(usersRef, (users) => new Map(users).set(user.id, user)),

      findById: (id: string) =>
        Effect.gen(function* () {
          const users = yield* Ref.get(usersRef)
          const user = users.get(id)
          return yield* Option.match(Option.fromNullable(user), {
            onNone: () => Effect.fail(new UserNotFound({ userId: id })),
            onSome: Effect.succeed
          })
        }).pipe(Effect.flatten)
    }
  })
)

layer(TestUserRepo)("UserService", (it) => {
  it.effect("should save and retrieve user", () =>
    Effect.gen(function* () {
      const repo = yield* UserRepository
      const user = new User({ id: "1", name: "Alice", email: "alice@test.com", age: 30 })
      yield* repo.save(user)
      const found = yield* repo.findById("1")
      expect(found).toEqual(user)
    })
  )

  it.effect("should fail for missing user", () =>
    Effect.gen(function* () {
      const repo = yield* UserRepository
      const exit = yield* Effect.exit(repo.findById("missing"))
      expect(exit._tag).toBe("Failure")
    })
  )
})
```

## Testing Error Handling

```typescript
import { it, expect } from "@effect/vitest"
import { Effect, Schema, Match, Arbitrary } from "effect"

class ValidationError extends Schema.TaggedError<ValidationError>()(
  "ValidationError",
  { field: Schema.String, message: Schema.String }
) {}

class NotFoundError extends Schema.TaggedError<NotFoundError>()(
  "NotFoundError",
  { resourceId: Schema.String }
) {}

const AppError = Schema.Union(ValidationError, NotFoundError)
type AppError = Schema.Schema.Type<typeof AppError>

describe("Error handling", () => {
  it.prop("should handle all error types", [Arbitrary.make(AppError)], ([error]) => {
    const message = Match.value(error).pipe(
      Match.tag("ValidationError", (e) => `Validation: ${e.field}`),
      Match.tag("NotFoundError", (e) => `Not found: ${e.resourceId}`),
      Match.exhaustive
    )

    expect(typeof message).toBe("string")
  })
})
```

## Testing with Exit

Use `Effect.exit` within `it.effect` to inspect success/failure outcomes:

```typescript
import { it, expect } from "@effect/vitest"
import { Effect, Exit, Cause, Option } from "effect"

it.effect("should fail with specific error", () =>
  Effect.gen(function* () {
    const exit = yield* Effect.exit(
      Effect.fail(new UserNotFound({ userId: "123" }))
    )

    expect(Exit.isFailure(exit)).toBe(true)

    Exit.match(exit, {
      onFailure: (cause) => {
        const error = Cause.failureOption(cause)
        expect(Option.isSome(error)).toBe(true)
        expect(Schema.is(UserNotFound)(Option.getOrThrow(error))).toBe(true)
      },
      onSuccess: () => {
        throw new Error("Expected failure")
      }
    })
  })
)
```

## TestClock - Controlling Time

`it.effect` automatically provides `TestClock`. No need to manually provide `TestClock.layer`.

### Basic Time Control

```typescript
import { it, expect } from "@effect/vitest"
import { Effect, TestClock, Fiber } from "effect"

it.effect("should complete after simulated delay", () =>
  Effect.gen(function* () {
    const fiber = yield* Effect.fork(
      Effect.sleep("1 hour").pipe(Effect.as("completed"))
    )

    yield* TestClock.adjust("1 hour")

    const result = yield* Fiber.join(fiber)
    expect(result).toBe("completed")
  })
)
```

### Testing Scheduled Operations

```typescript
it.effect("should retry 3 times", () =>
  Effect.gen(function* () {
    let attempts = 0

    const fiber = yield* Effect.fork(
      Effect.sync(() => { attempts++ }).pipe(
        Effect.flatMap(() => Effect.fail("error")),
        Effect.retry(Schedule.spaced("1 second").pipe(Schedule.recurs(3)))
      )
    )

    yield* TestClock.adjust("1 second")
    yield* TestClock.adjust("1 second")
    yield* TestClock.adjust("1 second")

    yield* Fiber.join(fiber).pipe(Effect.ignore)

    expect(attempts).toBe(4) // Initial + 3 retries
  })
)
```

## Testing Configuration

```typescript
import { it, expect } from "@effect/vitest"
import { Effect, Config, ConfigProvider, Layer } from "effect"

const TestConfigProvider = ConfigProvider.fromMap(
  new Map([
    ["DATABASE_URL", "postgres://test:test@localhost/test"],
    ["API_KEY", "test-api-key"],
    ["DEBUG", "true"]
  ])
)

const TestConfig = Layer.setConfigProvider(TestConfigProvider)

it.effect("should use test configuration", () =>
  Effect.gen(function* () {
    const dbUrl = yield* Config.string("DATABASE_URL")
    const debug = yield* Config.boolean("DEBUG")
    expect(dbUrl).toContain("localhost/test")
    expect(debug).toBe(true)
  }).pipe(Effect.provide(TestConfig))
)
```

## @effect/vitest Quick Reference

| Function | Environment | Scope | Use Case |
|---|---|---|---|
| `it.effect` | Test (TestClock, etc.) | No | Most common; deterministic tests |
| `it.live` | Live (real clock) | No | Tests needing real environment |
| `it.scoped` | Test | Auto-cleanup | Tests with acquireRelease resources |
| `it.scopedLive` | Live | Auto-cleanup | Resources + real environment |
| `it.layer` | Test | Shared layer | Providing dependencies to test groups |
| `it.prop` | Sync | No | Property-based testing with Schema/Arbitrary |
| `it.effect.prop` | Test | No | Effect-based property testing |
| `it.flakyTest` | Test | No | Retry flaky tests with timeout |

## Best Practices

### Do

1. **Use `@effect/vitest` for ALL Effect tests** - Never use plain vitest `it` with `Effect.runPromise`
2. **Use `it.effect` as the default** - It provides TestContext automatically
3. **Use `it.layer` for service tests** - Share layers across test blocks
4. **Use `it.prop` or `it.effect.prop` for property tests** - Prefer over manual `fc.assert`/`fc.property`
5. **Use Arbitrary for ALL test data** - Never hand-craft test objects
6. **Test round-trips for every Schema** - Encode/decode should be lossless
7. **Test all union variants** - Use Match.exhaustive to ensure coverage
8. **Test invariants with properties** - Not just specific examples
9. **Generate errors too** - Use Arbitrary on error schemas
10. **Use TestClock for time** - Deterministic, fast tests (automatic in `it.effect`)
11. **Call `addEqualityTesters()`** - For proper Effect type equality in assertions

### Don't

1. **Don't use `Effect.runPromise` in tests** - Use `it.effect` instead
2. **Don't import `it` from `vitest`** - Import from `@effect/vitest`
3. **Don't hard-code test data** - Use Arbitrary.make(YourSchema) or `it.prop`
4. **Don't test just "happy path"** - Generate edge cases automatically
5. **Don't use `._tag` directly** - Use Match.tag or Schema.is() (for Schema types only)
6. **Don't skip round-trip tests** - They catch serialization bugs
7. **Don't manually provide TestClock** - `it.effect` does this automatically

## Additional Resources

For comprehensive testing documentation, consult `${CLAUDE_PLUGIN_ROOT}/references/llms-full.txt`.

Search for these sections:
- "Arbitrary" for test data generation
- "TestClock" for time control
- "Testability" for testing patterns
