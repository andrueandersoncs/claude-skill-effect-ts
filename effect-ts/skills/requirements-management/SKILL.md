---
name: Requirements Management
description: This skill should be used when the user asks about "Effect services", "dependency injection", "Effect.Tag", "Context.Tag", "Layer", "Effect.provide", "Effect.provideService", "service implementation", "managing dependencies", "Layer.succeed", "Layer.effect", "Layer.scoped", "composing layers", "Layer.merge", "Layer.provide", "default services", "layer memoization", or needs to understand how Effect handles the Requirements (R) type parameter.
version: 1.0.0
---

# Requirements Management in Effect

## Overview

The third type parameter in `Effect<A, E, R>` represents **requirements** - services and dependencies the effect needs to run:

```typescript
Effect<Success, Error, Requirements>
//                     ^^^^^^^^^^^^ Services needed
```

Effect uses a powerful dependency injection system based on `Context` and `Layer`.

## Defining Services

### Using Effect.Tag (Recommended)

```typescript
import { Effect, Context } from "effect"

// Define service interface and tag together
class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  {
    readonly findById: (id: string) => Effect.Effect<User, UserNotFound>
    readonly save: (user: User) => Effect.Effect<void>
  }
>() {}

// Using the service
const program = Effect.gen(function* () {
  const repo = yield* UserRepository
  const user = yield* repo.findById("123")
  return user
})
// Type: Effect<User, UserNotFound, UserRepository>
```

### Alternative: Context.Tag Directly

```typescript
interface UserRepository {
  readonly findById: (id: string) => Effect.Effect<User, UserNotFound>
}

const UserRepository = Context.Tag<UserRepository>("UserRepository")
```

## Using Services

```typescript
const program = Effect.gen(function* () {
  // Access service from context
  const userRepo = yield* UserRepository
  const emailService = yield* EmailService

  const user = yield* userRepo.findById(userId)
  yield* emailService.send(user.email, "Welcome!")
})
```

## Creating Layers

Layers are recipes for building services:

### Layer.succeed - Simple Value

```typescript
const LoggerLive = Layer.succeed(
  Logger,
  {
    log: (msg) => Effect.sync(() => console.log(msg))
  }
)
```

### Layer.effect - Effect-Based Construction

```typescript
const ConfigLive = Layer.effect(
  Config,
  Effect.gen(function* () {
    const env = yield* Effect.sync(() => process.env)
    return {
      apiUrl: env.API_URL ?? "http://localhost:3000",
      debug: env.DEBUG === "true"
    }
  })
)
```

### Layer.scoped - Resource with Lifecycle

```typescript
const DatabaseLive = Layer.scoped(
  Database,
  Effect.gen(function* () {
    const pool = yield* Effect.acquireRelease(
      createPool(),
      (pool) => Effect.promise(() => pool.end())
    )
    return {
      query: (sql) => Effect.promise(() => pool.query(sql))
    }
  })
)
```

### Layer.function - From Function

```typescript
const HttpClientLive = Layer.function(
  HttpClient,
  (baseUrl: string) => ({
    get: (path) => Effect.tryPromise(() => fetch(baseUrl + path))
  })
)
```

## Providing Dependencies

### Effect.provide - Provide Layer

```typescript
const program = getUserById("123")

// Provide all dependencies
const runnable = program.pipe(
  Effect.provide(AppLive)
)

// Type: Effect<User, UserNotFound, never>
await Effect.runPromise(runnable)
```

### Effect.provideService - Provide Single Service

```typescript
const runnable = program.pipe(
  Effect.provideService(UserRepository, {
    findById: (id) => Effect.succeed(mockUser),
    save: (user) => Effect.void
  })
)
```

## Composing Layers

### Layer.merge - Combine Independent Layers

```typescript
const InfraLive = Layer.merge(
  DatabaseLive,
  LoggerLive
)
// Provides: Database | Logger
```

### Layer.provide - Layer Dependencies

```typescript
// UserRepositoryLive depends on Database
const UserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* Database
    return {
      findById: (id) => db.query(`SELECT * FROM users WHERE id = ${id}`)
    }
  })
)

// Satisfy the dependency
const FullUserRepo = UserRepositoryLive.pipe(
  Layer.provide(DatabaseLive)
)
```

### Layer.provideMerge - Provide and Keep

```typescript
// Provides UserRepository AND keeps Database available
const Combined = UserRepositoryLive.pipe(
  Layer.provideMerge(DatabaseLive)
)
```

## Building Application Layers

### Typical Pattern

```typescript
// Infrastructure layer
const InfraLive = Layer.mergeAll(
  DatabaseLive,
  LoggerLive,
  HttpClientLive
)

// Repository layer (depends on infra)
const RepositoryLive = Layer.mergeAll(
  UserRepositoryLive,
  OrderRepositoryLive
).pipe(Layer.provide(InfraLive))

// Service layer (depends on repositories)
const ServiceLive = Layer.mergeAll(
  UserServiceLive,
  OrderServiceLive
).pipe(Layer.provide(RepositoryLive))

// Full application layer
const AppLive = ServiceLive.pipe(
  Layer.provide(InfraLive)
)
```

## Layer Memoization

Layers are memoized by default - each service is created once:

```typescript
// Both UserService and OrderService share the same Database instance
const AppLive = Layer.mergeAll(
  UserServiceLive,   // uses Database
  OrderServiceLive   // uses same Database
).pipe(Layer.provide(DatabaseLive))
```

### Fresh Layers (No Memoization)

```typescript
const FreshDatabase = Layer.fresh(DatabaseLive)
// Creates new Database for each dependent
```

## Default Services

Effect provides default implementations for common services:

```typescript
// These are provided automatically:
// - Clock
// - Random
// - Tracer
// - Console

const program = Effect.gen(function* () {
  const now = yield* Clock.currentTimeMillis
  const random = yield* Random.next
})
// No requirements needed - defaults provided
```

### Overriding Defaults

```typescript
import { TestClock } from "effect"

const testProgram = program.pipe(
  Effect.provide(TestClock.layer)
)
```

## Testing with Services

```typescript
// Test implementation
const UserRepositoryTest = Layer.succeed(
  UserRepository,
  {
    findById: (id) => Effect.succeed({ id, name: "Test User" }),
    save: () => Effect.void
  }
)

// Run with test layer
const result = await Effect.runPromise(
  program.pipe(Effect.provide(UserRepositoryTest))
)
```

## Best Practices

1. **Define service interface with Tag** - Keeps interface and tag together
2. **Use Layer.scoped for resources** - Ensures proper cleanup
3. **Compose layers bottom-up** - Infrastructure → Repositories → Services
4. **Keep layers focused** - One service per layer typically
5. **Test with mock layers** - Easy to swap implementations

## Additional Resources

For comprehensive requirements management documentation, consult `${CLAUDE_PLUGIN_ROOT}/references/llms-full.txt`.

Search for these sections:
- "Managing Services" for service patterns
- "Managing Layers" for layer composition
- "Layer Memoization" for sharing services
- "Default Services" for built-in services
