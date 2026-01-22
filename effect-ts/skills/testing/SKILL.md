---
name: Testing
description: This skill should be used when the user asks about "Effect testing", "TestClock", "testing effects", "mocking services", "test layers", "TestContext", "Effect.provide test", "time testing", "Effect test utilities", "unit testing Effect", or needs to understand how to test Effect-based code.
version: 1.0.0
---

# Testing in Effect

## Overview

Effect provides powerful testing utilities:

- **TestClock** - Control time in tests
- **Mock Layers** - Replace services with test doubles
- **Test Context** - Isolated test environments
- **Property Testing** - With Schema.Arbitrary

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
import { Effect, Exit } from "effect"

it("should fail with specific error", async () => {
  const program = Effect.fail(new UserNotFound({ id: "123" }))
  const exit = await Effect.runPromiseExit(program)

  expect(Exit.isFailure(exit)).toBe(true)
  if (Exit.isFailure(exit)) {
    const error = Cause.failureOption(exit.cause)
    expect(Option.isSome(error)).toBe(true)
    expect(Option.getOrThrow(error)._tag).toBe("UserNotFound")
  }
})
```

## Mocking Services with Layers

### Creating Test Layers

```typescript
import { Layer, Effect } from "effect"

// Production service
class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  {
    readonly findById: (id: string) => Effect.Effect<User, UserNotFound>
    readonly save: (user: User) => Effect.Effect<void>
  }
>() {}

// Test implementation
const UserRepositoryTest = Layer.succeed(
  UserRepository,
  {
    findById: (id) =>
      id === "1"
        ? Effect.succeed({ id: "1", name: "Test User" })
        : Effect.fail(new UserNotFound({ id })),
    save: () => Effect.void
  }
)

// Test
it("should find user", async () => {
  const program = Effect.gen(function* () {
    const repo = yield* UserRepository
    return yield* repo.findById("1")
  })

  const result = await Effect.runPromise(
    program.pipe(Effect.provide(UserRepositoryTest))
  )

  expect(result.name).toBe("Test User")
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
    // Fork a long-running task
    const fiber = yield* Effect.fork(
      Effect.sleep("1 hour").pipe(Effect.as("completed"))
    )

    // Advance time
    yield* TestClock.adjust("1 hour")

    // Task should now be complete
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

    // Advance through retries
    yield* TestClock.adjust("1 second")
    yield* TestClock.adjust("1 second")
    yield* TestClock.adjust("1 second")

    yield* Fiber.join(fiber).pipe(Effect.ignore)
  })

  await Effect.runPromise(program.pipe(Effect.provide(TestClock.layer)))

  expect(attempts).toBe(4) // Initial + 3 retries
})
```

### Testing Timeouts

```typescript
it("should fail on timeout", async () => {
  const program = Effect.gen(function* () {
    const fiber = yield* Effect.fork(
      Effect.sleep("10 seconds").pipe(
        Effect.timeout("5 seconds")
      )
    )

    // Advance past timeout
    yield* TestClock.adjust("5 seconds")

    return yield* Fiber.join(fiber)
  })

  const result = await Effect.runPromise(
    program.pipe(Effect.provide(TestClock.layer))
  )

  expect(Option.isNone(result)).toBe(true)
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

## Property-Based Testing

### With Schema.Arbitrary

```typescript
import { Schema, Arbitrary } from "effect"
import * as fc from "fast-check"

const User = Schema.Struct({
  id: Schema.Number.pipe(Schema.positive()),
  name: Schema.String.pipe(Schema.minLength(1)),
  email: Schema.String
})

const userArbitrary = Arbitrary.make(User)

describe("User validation", () => {
  it("should encode and decode without loss", () => {
    fc.assert(
      fc.property(userArbitrary(fc), (user) => {
        const encoded = Schema.encodeSync(User)(user)
        const decoded = Schema.decodeUnknownSync(User)(encoded)
        return JSON.stringify(decoded) === JSON.stringify(user)
      })
    )
  })
})
```

## Integration Testing

### Testing with Real Services

```typescript
const IntegrationTestLive = Layer.mergeAll(
  // Real implementations
  DatabaseLive,
  HttpClientLive
).pipe(
  Layer.provide(TestConfigLive)
)

describe("Integration", () => {
  it("should create and retrieve user", async () => {
    const program = Effect.gen(function* () {
      const userService = yield* UserService

      const created = yield* userService.create({
        name: "Integration Test User"
      })

      const retrieved = yield* userService.findById(created.id)

      return { created, retrieved }
    })

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(IntegrationTestLive),
        Effect.scoped
      )
    )

    expect(result.created.id).toBe(result.retrieved.id)
  })
})
```

## Test Patterns

### Arrange-Act-Assert

```typescript
it("should update user email", async () => {
  // Arrange
  const initialUser = { id: "1", name: "Alice", email: "old@example.com" }
  const TestLayer = Layer.succeed(UserRepository, {
    findById: () => Effect.succeed(initialUser),
    save: () => Effect.void
  })

  // Act
  const program = updateUserEmail("1", "new@example.com")
  const result = await Effect.runPromise(
    program.pipe(Effect.provide(TestLayer))
  )

  // Assert
  expect(result.email).toBe("new@example.com")
})
```

### Testing Error Paths

```typescript
it("should handle repository failure", async () => {
  const FailingRepo = Layer.succeed(UserRepository, {
    findById: () => Effect.fail(new DatabaseError()),
    save: () => Effect.fail(new DatabaseError())
  })

  const program = getUser("1")
  const exit = await Effect.runPromiseExit(
    program.pipe(Effect.provide(FailingRepo))
  )

  expect(Exit.isFailure(exit)).toBe(true)
})
```

## Best Practices

1. **Use Layer.succeed for simple mocks** - Quick test doubles
2. **Use TestClock for time-dependent code** - Deterministic tests
3. **Test error paths** - Use Effect.runPromiseExit
4. **Isolate with test layers** - No shared state
5. **Use property testing** - Schema.Arbitrary for data generation

## Additional Resources

For comprehensive testing documentation, consult `${CLAUDE_PLUGIN_ROOT}/references/llms-full.txt`.

Search for these sections:
- "TestClock" for time control
- "Testability" for testing patterns
- "Mocking Configurations in Tests" for config testing
