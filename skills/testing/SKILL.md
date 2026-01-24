---
name: Testing
description: This skill should be used when the user asks about "Effect testing", "Schema Arbitrary", "property-based testing", "fast-check", "TestClock", "testing effects", "mocking services", "test layers", "TestContext", "Effect.provide test", "time testing", "Effect test utilities", "unit testing Effect", "generating test data", or needs to understand how to test Effect-based code.
version: 1.0.0
---

# Testing in Effect

## Overview

Since every data type should have a Schema, every data type can generate test data via `Arbitrary`. This makes **property-based testing the primary testing approach** in Effect.

**Core testing tools:**

- **Schema.Arbitrary** - Generate test data from any Schema (primary approach)
- **Property Testing** - Test invariants with generated data
- **Mock Layers** - Replace services with test doubles
- **TestClock** - Control time in tests

## Schema.Arbitrary - Generating Test Data

Every Schema can generate random valid test data. This is the foundation of Effect testing.

### Basic Usage

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
import { Schema, Arbitrary } from "effect"
import * as fc from "fast-check"
import { describe, it, expect } from "vitest"

describe("User schema", () => {
  const UserArbitrary = Arbitrary.make(User)

  it("should survive encode/decode round-trip", () => {
    fc.assert(
      fc.property(UserArbitrary(fc), (user) => {
        const encoded = Schema.encodeSync(User)(user)
        const decoded = Schema.decodeUnknownSync(User)(encoded)

        // Verify structural equality
        expect(decoded).toEqual(user)

        // Verify it's still a User instance
        expect(decoded).toBeInstanceOf(User)
      })
    )
  })
})
```

### Testing Discriminated Unions Exhaustively

```typescript
describe("Order processing", () => {
  const OrderArbitrary = Arbitrary.make(Order)

  it("should handle all order states", () => {
    fc.assert(
      fc.property(OrderArbitrary(fc), (order) => {
        // This must handle ALL variants - Match.exhaustive ensures it
        const result = Match.value(order).pipe(
          Match.when(Schema.is(Pending), (o) => `Pending: ${o.orderId}`),
          Match.when(Schema.is(Shipped), (o) => `Shipped: ${o.trackingNumber}`),
          Match.when(Schema.is(Delivered), (o) => `Delivered: ${o.deliveredAt}`),
          Match.exhaustive
        )

        expect(typeof result).toBe("string")
      })
    )
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
  const AccountArbitrary = Arbitrary.make(BankAccount)

  it("should never have negative balance", () => {
    fc.assert(
      fc.property(AccountArbitrary(fc), (account) => {
        expect(account.balance).toBeGreaterThanOrEqual(0)
      })
    )
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
  it("should preserve value through transform", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000000 }), (cents) => {
        const dollars = Schema.decodeSync(MoneyFromCents)(cents)
        const backToCents = Schema.encodeSync(MoneyFromCents)(dollars)

        // Allow for floating point rounding
        expect(backToCents).toBe(cents)
      })
    )
  })
})
```

### Testing Idempotency

```typescript
describe("Normalization is idempotent", () => {
  const EmailArbitrary = Arbitrary.make(Email)

  it("normalizing twice equals normalizing once", () => {
    fc.assert(
      fc.property(EmailArbitrary(fc), (email) => {
        const once = normalizeEmail(email)
        const twice = normalizeEmail(normalizeEmail(email))
        expect(twice).toBe(once)
      })
    )
  })
})
```

### Testing Commutativity

```typescript
describe("Order total calculation", () => {
  const ItemArbitrary = Arbitrary.make(OrderItem)

  it("total is independent of item order", () => {
    fc.assert(
      fc.property(fc.array(ItemArbitrary(fc)), (items) => {
        const total1 = calculateTotal(items)
        const total2 = calculateTotal([...items].reverse())
        expect(total1).toBe(total2)
      })
    )
  })
})
```

## Testing Services with Generated Data

Combine Arbitrary with mock layers:

```typescript
class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  {
    readonly save: (user: User) => Effect.Effect<void>
    readonly findById: (id: string) => Effect.Effect<User, UserNotFound>
  }
>() {}

describe("UserService", () => {
  const UserArbitrary = Arbitrary.make(User)

  it("should save and retrieve any valid user", () => {
    fc.assert(
      fc.asyncProperty(UserArbitrary(fc), async (user) => {
        const storage = new Map<string, User>()

        const TestRepo = Layer.succeed(UserRepository, {
          save: (u) => Effect.sync(() => { storage.set(u.id, u) }),
          findById: (id) =>
            Option.fromNullable(storage.get(id)).pipe(
              Option.match({
                onNone: () => Effect.fail(new UserNotFound({ id })),
                onSome: Effect.succeed
              })
            )
        })

        const program = Effect.gen(function* () {
          const repo = yield* UserRepository
          yield* repo.save(user)
          return yield* repo.findById(user.id)
        })

        const result = await Effect.runPromise(
          program.pipe(Effect.provide(TestRepo))
        )

        expect(result).toEqual(user)
      })
    )
  })
})
```

## Testing Error Handling with Arbitrary

```typescript
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
  const ErrorArbitrary = Arbitrary.make(AppError)

  it("should handle all error types", () => {
    fc.assert(
      fc.property(ErrorArbitrary(fc), (error) => {
        const message = Match.value(error).pipe(
          Match.tag("ValidationError", (e) => `Validation: ${e.field}`),
          Match.tag("NotFoundError", (e) => `Not found: ${e.resourceId}`),
          Match.exhaustive
        )

        expect(typeof message).toBe("string")
      })
    )
  })
})
```

## Basic Testing Setup

### With Vitest/Jest

```typescript
import { Effect } from "effect"
import { describe, it, expect } from "vitest"

describe("MyService", () => {
  it("should return user", async () => {
    const program = Effect.succeed({ id: 1, name: "Alice" })
    const result = await Effect.runPromise(program)

    expect(result).toEqual({ id: 1, name: "Alice" })
  })

  it("should handle errors", async () => {
    const program = Effect.fail(new Error("Not found"))

    await expect(Effect.runPromise(program)).rejects.toThrow("Not found")
  })
})
```

### Testing with Exit

```typescript
import { Effect, Exit, Cause, Option, Match } from "effect"

it("should fail with specific error", async () => {
  const program = Effect.fail(new UserNotFound({ id: "123" }))
  const exit = await Effect.runPromiseExit(program)

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
```

## Mocking Services with Layers

### Creating Test Layers

```typescript
import { Layer, Effect, Context } from "effect"

// Production service
class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  {
    readonly findById: (id: string) => Effect.Effect<User, UserNotFound>
    readonly save: (user: User) => Effect.Effect<void>
  }
>() {}

// Test implementation using Arbitrary for test data
const testUser = fc.sample(Arbitrary.make(User)(fc), 1)[0]

const UserRepositoryTest = Layer.succeed(
  UserRepository,
  {
    findById: (id) =>
      id === testUser.id
        ? Effect.succeed(testUser)
        : Effect.fail(new UserNotFound({ id })),
    save: () => Effect.void
  }
)

// Test
it("should find user", async () => {
  const program = Effect.gen(function* () {
    const repo = yield* UserRepository
    return yield* repo.findById(testUser.id)
  })

  const result = await Effect.runPromise(
    program.pipe(Effect.provide(UserRepositoryTest))
  )

  expect(result.name).toBe(testUser.name)
})
```

### Stateful Test Services

```typescript
import { Ref, Layer, Effect } from "effect"

const makeTestUserRepository = Effect.gen(function* () {
  const usersRef = yield* Ref.make<Map<string, User>>(new Map())

  return {
    findById: (id: string) =>
      Effect.gen(function* () {
        const users = yield* Ref.get(usersRef)
        const user = users.get(id)
        return user
          ? Effect.succeed(user)
          : Effect.fail(new UserNotFound({ id }))
      }).pipe(Effect.flatten),

    save: (user: User) =>
      Ref.update(usersRef, (users) => new Map(users).set(user.id, user)),

    // Test helper
    _addUser: (user: User) =>
      Ref.update(usersRef, (users) => new Map(users).set(user.id, user))
  }
})

const UserRepositoryTest = Layer.effect(UserRepository, makeTestUserRepository)
```

## TestClock - Controlling Time

### Basic Time Control

```typescript
import { Effect, TestClock, Fiber } from "effect"

it("should timeout after delay", async () => {
  const program = Effect.gen(function* () {
    const fiber = yield* Effect.fork(
      Effect.sleep("1 hour").pipe(Effect.as("completed"))
    )

    yield* TestClock.adjust("1 hour")

    return yield* Fiber.join(fiber)
  })

  const result = await Effect.runPromise(
    program.pipe(Effect.provide(TestClock.layer))
  )

  expect(result).toBe("completed")
})
```

### Testing Scheduled Operations

```typescript
it("should retry 3 times", async () => {
  let attempts = 0

  const program = Effect.gen(function* () {
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
  })

  await Effect.runPromise(program.pipe(Effect.provide(TestClock.layer)))

  expect(attempts).toBe(4) // Initial + 3 retries
})
```

## Testing Configuration

```typescript
import { Config, ConfigProvider, Layer } from "effect"

const TestConfigProvider = ConfigProvider.fromMap(
  new Map([
    ["DATABASE_URL", "postgres://test:test@localhost/test"],
    ["API_KEY", "test-api-key"],
    ["DEBUG", "true"]
  ])
)

const TestConfig = Layer.setConfigProvider(TestConfigProvider)

it("should use test configuration", async () => {
  const program = Effect.gen(function* () {
    const dbUrl = yield* Config.string("DATABASE_URL")
    const debug = yield* Config.boolean("DEBUG")
    return { dbUrl, debug }
  })

  const result = await Effect.runPromise(
    program.pipe(Effect.provide(TestConfig))
  )

  expect(result.dbUrl).toContain("localhost/test")
  expect(result.debug).toBe(true)
})
```

## Best Practices

### Do

1. **Use Arbitrary for ALL test data** - Never hand-craft test objects
2. **Test round-trips for every Schema** - Encode/decode should be lossless
3. **Test all union variants** - Use Match.exhaustive to ensure coverage
4. **Test invariants with properties** - Not just specific examples
5. **Generate errors too** - Use Arbitrary on error schemas
6. **Use TestClock for time** - Deterministic, fast tests

### Don't

1. **Don't hard-code test data** - Use Arbitrary.make(YourSchema)
2. **Don't test just "happy path"** - Generate edge cases automatically
3. **Don't use `._tag` in tests** - Use Schema.is() or Match.tag
4. **Don't skip round-trip tests** - They catch serialization bugs

## Additional Resources

For comprehensive testing documentation, consult `${CLAUDE_PLUGIN_ROOT}/references/llms-full.txt`.

Search for these sections:
- "Arbitrary" for test data generation
- "TestClock" for time control
- "Testability" for testing patterns
