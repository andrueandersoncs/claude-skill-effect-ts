---
name: Code Style
description: This skill should be used when the user asks about "Effect best practices", "Effect code style", "idiomatic Effect", "Schema-first", "Match-first", "when to use Schema", "when to use Match", "branded types", "dual APIs", "Effect guidelines", "do notation", "Effect.gen", "pipe vs method chaining", "Effect naming conventions", "Effect project structure", "data modeling in Effect", or needs to understand idiomatic Effect-TS patterns and conventions.
version: 1.0.0
---

# Code Style in Effect

## Overview

Effect's idiomatic style centers on two core principles:

1. **Schema-First Data Modeling** - Define ALL data structures as Effect Schemas
2. **Match-First Control Flow** - Define ALL conditional logic using Effect Match

Additional patterns include:

- **Branded types** - Nominal typing for primitives (built into Schema)
- **Dual APIs** - Both data-first and data-last
- **Generator syntax** - Effect.gen for readability
- **Project organization** - Layers, services, domains

## Core Principles

### 1. Schema-First Data Modeling

**Define ALL data structures as Effect Schemas.** This is the foundation of type-safe Effect code.

```typescript
import { Schema } from "effect"

// Domain entities - ALWAYS use Schema
const User = Schema.Struct({
  id: Schema.String.pipe(Schema.brand("UserId")),
  email: Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/)),
  name: Schema.String.pipe(Schema.nonEmptyString()),
  role: Schema.Literal("admin", "user", "guest"),
  createdAt: Schema.Date
})
type User = Schema.Schema.Type<typeof User>

// API request/response - ALWAYS use Schema
const CreateUserRequest = Schema.Struct({
  email: Schema.String,
  name: Schema.String,
  role: Schema.optional(Schema.Literal("admin", "user", "guest"))
})

// Configuration - use Schema
const AppConfig = Schema.Struct({
  port: Schema.Number.pipe(Schema.between(1, 65535)),
  host: Schema.String,
  debug: Schema.Boolean
})

// Events - use Schema
const UserCreatedEvent = Schema.Struct({
  _tag: Schema.Literal("UserCreated"),
  userId: Schema.String,
  timestamp: Schema.Date
})
```

**Why Schema for everything:**
- Runtime validation at system boundaries
- Automatic type inference (no duplicate type definitions)
- Encode/decode for serialization
- JSON Schema generation for API docs
- Branded types built-in
- Composable transformations

### 2. Match-First Control Flow

**Define ALL conditional logic and algorithms using Effect Match.** Replace if/else chains, switch statements, and ternaries with exhaustive pattern matching.

```typescript
import { Match } from "effect"

// Process by discriminated union - use Match
const handleEvent = Match.type<AppEvent>().pipe(
  Match.tag("UserCreated", (event) => notifyAdmin(event.userId)),
  Match.tag("UserDeleted", (event) => cleanupData(event.userId)),
  Match.tag("OrderPlaced", (event) => processOrder(event.orderId)),
  Match.exhaustive
)

// Transform values - use Match
const toHttpStatus = Match.type<AppError>().pipe(
  Match.tag("NotFound", () => 404),
  Match.tag("Unauthorized", () => 401),
  Match.tag("ValidationError", () => 400),
  Match.tag("InternalError", () => 500),
  Match.exhaustive
)

// Handle options/results - use Match
const displayUser = Match.type<Option<User>>().pipe(
  Match.tag("Some", ({ value }) => `Welcome, ${value.name}`),
  Match.tag("None", () => "Guest user"),
  Match.exhaustive
)

// Multi-condition logic - use Match.when
const calculateDiscount = (order: Order) => Match.value(order).pipe(
  Match.when({ total: (t) => t > 1000, isPremium: true }, () => 0.25),
  Match.when({ total: (t) => t > 1000 }, () => 0.15),
  Match.when({ isPremium: true }, () => 0.10),
  Match.when({ itemCount: (c) => c > 10 }, () => 0.05),
  Match.orElse(() => 0)
)
```

**Why Match for everything:**
- Exhaustive checking catches missing cases at compile time
- Self-documenting code structure
- No forgotten else branches
- Easy to extend with new cases
- Works perfectly with Schema discriminated unions

### 3. Schema + Match Together

The most powerful pattern: Schema for data, Match for logic.

```typescript
// Define all variants with Schema
const PaymentMethod = Schema.Union(
  Schema.Struct({ _tag: Schema.Literal("CreditCard"), last4: Schema.String }),
  Schema.Struct({ _tag: Schema.Literal("BankTransfer"), accountId: Schema.String }),
  Schema.Struct({ _tag: Schema.Literal("Crypto"), walletAddress: Schema.String })
)
type PaymentMethod = Schema.Schema.Type<typeof PaymentMethod>

// Process all variants with Match
const processPayment = (method: PaymentMethod, amount: number) =>
  Match.value(method).pipe(
    Match.tag("CreditCard", (m) => chargeCard(m.last4, amount)),
    Match.tag("BankTransfer", (m) => initiateBankTransfer(m.accountId, amount)),
    Match.tag("Crypto", (m) => sendCrypto(m.walletAddress, amount)),
    Match.exhaustive
  )
```

## Branded Types

Prevent mixing up values of the same underlying type:

```typescript
import { Brand } from "effect"

// Define branded types
type UserId = string & Brand.Brand<"UserId">
type OrderId = string & Brand.Brand<"OrderId">

// Constructors
const UserId = Brand.nominal<UserId>()
const OrderId = Brand.nominal<OrderId>()

// Usage
const userId: UserId = UserId("user-123")
const orderId: OrderId = OrderId("order-456")

// Type error: can't assign UserId to OrderId
// const wrong: OrderId = userId
```

### With Validation

```typescript
import { Brand, Either } from "effect"

type Email = string & Brand.Brand<"Email">

const Email = Brand.refined<Email>(
  (s) => /^[^@]+@[^@]+\.[^@]+$/.test(s),
  (s) => Brand.error(`Invalid email: ${s}`)
)

// Returns Either
const result = Email.either("test@example.com")
// Or throws
const email = Email("test@example.com")
```

### With Schema

```typescript
import { Schema } from "effect"

const UserId = Schema.String.pipe(
  Schema.brand("UserId")
)
type UserId = Schema.Schema.Type<typeof UserId>

const Email = Schema.String.pipe(
  Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/),
  Schema.brand("Email")
)
```

## Dual APIs

Most Effect functions support both styles:

### Data-Last (Pipeable) - Recommended

```typescript
import { Effect, pipe } from "effect"

// Using pipe
const result = pipe(
  Effect.succeed(1),
  Effect.map((n) => n + 1),
  Effect.flatMap((n) => Effect.succeed(n * 2))
)

// Using method chaining
const result = Effect.succeed(1).pipe(
  Effect.map((n) => n + 1),
  Effect.flatMap((n) => Effect.succeed(n * 2))
)
```

### Data-First

```typescript
// Useful for single transformations
const mapped = Effect.map(Effect.succeed(1), (n) => n + 1)
```

### Convention

- **Use data-last** for pipelines
- **Use data-first** for single operations
- **Be consistent** within a codebase

## Generator Syntax (Effect.gen)

The preferred way to write sequential Effect code:

```typescript
// Generator style - recommended
const program = Effect.gen(function* () {
  const user = yield* getUser(id)
  const orders = yield* getOrders(user.id)
  const enriched = yield* enrichOrders(orders)
  return { user, orders: enriched }
})

// Equivalent flatMap chain
const program = getUser(id).pipe(
  Effect.flatMap((user) =>
    getOrders(user.id).pipe(
      Effect.flatMap((orders) =>
        enrichOrders(orders).pipe(
          Effect.map((enriched) => ({ user, orders: enriched }))
        )
      )
    )
  )
)
```

### When to Use Effect.gen

- Sequential operations
- Complex control flow
- When readability matters
- Error handling with yield*

### When to Use pipe

- Simple transformations
- Parallel operations
- Single-line operations

## Do Notation (Simplifying Nesting)

Alternative to generators for some cases:

```typescript
import { Effect } from "effect"

const program = Effect.Do.pipe(
  Effect.bind("user", () => getUser(id)),
  Effect.bind("orders", ({ user }) => getOrders(user.id)),
  Effect.bind("enriched", ({ orders }) => enrichOrders(orders)),
  Effect.map(({ user, enriched }) => ({ user, orders: enriched }))
)
```

## Project Structure

### Recommended Layout

```
src/
├── domain/           # Domain types and errors
│   ├── User.ts
│   ├── Order.ts
│   └── errors.ts
├── services/         # Service interfaces
│   ├── UserRepository.ts
│   └── OrderService.ts
├── implementations/  # Service implementations
│   ├── UserRepositoryLive.ts
│   └── OrderServiceLive.ts
├── layers/          # Layer composition
│   ├── AppLive.ts
│   └── TestLive.ts
├── http/            # HTTP handlers
│   └── routes.ts
└── main.ts          # Entry point
```

### Service Definition Pattern

```typescript
// services/UserRepository.ts
import { Context, Effect } from "effect"
import { User, UserId } from "../domain/User"
import { UserNotFound } from "../domain/errors"

export class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  {
    readonly findById: (id: UserId) => Effect.Effect<User, UserNotFound>
    readonly findByEmail: (email: string) => Effect.Effect<User, UserNotFound>
    readonly save: (user: User) => Effect.Effect<void>
    readonly delete: (id: UserId) => Effect.Effect<void>
  }
>() {}
```

### Layer Composition Pattern

```typescript
// layers/AppLive.ts
import { Layer } from "effect"

// Infrastructure
const InfraLive = Layer.mergeAll(
  DatabaseLive,
  HttpClientLive,
  LoggerLive
)

// Repositories
const RepositoriesLive = Layer.mergeAll(
  UserRepositoryLive,
  OrderRepositoryLive
).pipe(Layer.provide(InfraLive))

// Services
const ServicesLive = Layer.mergeAll(
  UserServiceLive,
  OrderServiceLive
).pipe(Layer.provide(RepositoriesLive))

// Full application
export const AppLive = ServicesLive
```

## Naming Conventions

### Types and Interfaces

```typescript
// Domain types - PascalCase
interface User { ... }
interface Order { ... }

// Branded types - PascalCase
type UserId = string & Brand.Brand<"UserId">
type Email = string & Brand.Brand<"Email">

// Error types - PascalCase with descriptive suffix
class UserNotFound extends Data.TaggedError("UserNotFound")<{...}> {}
class ValidationError extends Data.TaggedError("ValidationError")<{...}> {}
```

### Services

```typescript
// Service tag - PascalCase
class UserRepository extends Context.Tag("UserRepository")<...>() {}

// Layer implementations - PascalCase with Live/Test suffix
const UserRepositoryLive = Layer.effect(...)
const UserRepositoryTest = Layer.succeed(...)
```

### Functions

```typescript
// Effect-returning functions - camelCase
const getUser = (id: UserId): Effect.Effect<User, UserNotFound> => ...
const createOrder = (data: OrderData): Effect.Effect<Order, ValidationError> => ...

// Constructors - matching type name
const UserId = Brand.nominal<UserId>()
const User = (data: UserData): User => ...
```

## Error Handling Style

### Tagged Errors

```typescript
import { Data } from "effect"

// Always use Data.TaggedError for domain errors
class UserNotFound extends Data.TaggedError("UserNotFound")<{
  readonly userId: string
}> {}

class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly field: string
  readonly message: string
}> {}

// Use in services
const getUser = (id: string): Effect.Effect<User, UserNotFound> =>
  Effect.gen(function* () {
    const user = yield* findInDb(id)
    if (!user) {
      return yield* Effect.fail(new UserNotFound({ userId: id }))
    }
    return user
  })
```

### Error Recovery Pattern

```typescript
const program = getUser(id).pipe(
  // Specific error handling
  Effect.catchTag("UserNotFound", (error) =>
    Effect.succeed(defaultUser)
  ),
  // Or match all errors
  Effect.catchTags({
    UserNotFound: () => Effect.succeed(defaultUser),
    ValidationError: (e) => Effect.fail(new BadRequest(e.message))
  })
)
```

## Best Practices Summary

### Do

- **Define ALL data structures as Schema** - entities, DTOs, configs, events, errors
- **Use Match for ALL conditional logic** - replace if/else, switch, ternaries
- Use Effect.gen for sequential code
- Define services with Context.Tag
- Compose layers bottom-up
- Use Data.TaggedError for domain errors (which work with Match.tag)

### Don't

- Use plain TypeScript interfaces/types without Schema
- Use if/else chains or switch statements (use Match)
- Mix async/await with Effect (except at boundaries)
- Use bare try/catch (use Effect.try)
- Create services without layers
- Throw exceptions (use Effect.fail)

## Additional Resources

For comprehensive code style documentation, consult `${CLAUDE_PLUGIN_ROOT}/references/llms-full.txt`.

Search for these sections:
- "Branded Types" for nominal typing
- "Dual APIs" for function styles
- "Guidelines" for best practices
- "Simplifying Excessive Nesting" for do notation
