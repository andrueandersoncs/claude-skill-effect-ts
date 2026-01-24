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

### 0. No Imperative Control Flow

**NEVER use `if/else`, `switch/case`, or ternary operators.** These imperative constructs must be replaced with pattern matching in ALL cases:

- **`if/else` chains** → `Match.value` + `Match.when`
- **`switch/case` statements** → `Match.type` + `Match.tag` or `Match.when`
- **Ternary operators (`? :`)** → `Match.value` + `Match.when`
- **Optional chaining conditionals** → `Option.match`
- **Result/error conditionals** → `Either.match` or `Effect.match`

```typescript
// ❌ FORBIDDEN: if/else
if (user.role === "admin") {
  return "full access"
} else if (user.role === "user") {
  return "limited access"
} else {
  return "no access"
}

// ❌ FORBIDDEN: switch/case
switch (status) {
  case "pending": return "waiting"
  case "active": return "running"
  default: return "unknown"
}

// ❌ FORBIDDEN: ternary
const message = isError ? "Failed" : "Success"

// ❌ FORBIDDEN: direct ._tag access
if (event._tag === "UserCreated") { ... }
const isCreated = event._tag === "UserCreated"

// ✅ REQUIRED: Match.value
const getAccess = (user: User) =>
  Match.value(user.role).pipe(
    Match.when("admin", () => "full access"),
    Match.when("user", () => "limited access"),
    Match.orElse(() => "no access")
  )

// ✅ REQUIRED: Match.type
const getStatusMessage = Match.type<Status>().pipe(
  Match.when("pending", () => "waiting"),
  Match.when("active", () => "running"),
  Match.exhaustive
)

// ✅ REQUIRED: Option.match for nullable/optional
const displayName = Option.match(maybeUser, {
  onNone: () => "Guest",
  onSome: (user) => user.name
})

// ✅ REQUIRED: Either.match for results
const result = Either.match(parseResult, {
  onLeft: (error) => `Error: ${error}`,
  onRight: (value) => `Success: ${value}`
})

// ✅ REQUIRED: Match.tag for discriminated unions (not ._tag access)
const handleEvent = Match.type<AppEvent>().pipe(
  Match.tag("UserCreated", (e) => notifyAdmin(e.userId)),
  Match.tag("UserDeleted", (e) => cleanupData(e.userId)),
  Match.exhaustive
)

// ✅ REQUIRED: Schema.is() for type guards (not ._tag checks)
if (Schema.is(UserCreated)(event)) {
  // event is narrowed to UserCreated
}
```

**When you encounter imperative control flow in existing code, refactor it immediately.** This is not optional - imperative conditionals are code smells that must be eliminated.

### 1. Schema-First Data Modeling

**Define ALL data structures as Effect Schemas.** This is the foundation of type-safe Effect code.

**Key principles:**
- **Use Schema.Class over Schema.Struct** - Get methods and instanceof
- **Use tagged unions over optional properties** - Make states explicit
- **Use Schema.is() in Match patterns** - Combine validation with matching

```typescript
import { Schema, Match } from "effect"

// ✅ GOOD: Class-based schema with methods
class User extends Schema.Class<User>("User")({
  id: Schema.String.pipe(Schema.brand("UserId")),
  email: Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/)),
  name: Schema.String.pipe(Schema.nonEmptyString()),
  createdAt: Schema.Date
}) {
  get emailDomain() {
    return this.email.split("@")[1]
  }
}

// ✅ GOOD: Tagged union over optional properties
class Pending extends Schema.TaggedClass<Pending>()("Pending", {
  orderId: Schema.String,
  items: Schema.Array(Schema.String)
}) {}

class Shipped extends Schema.TaggedClass<Shipped>()("Shipped", {
  orderId: Schema.String,
  items: Schema.Array(Schema.String),
  trackingNumber: Schema.String,
  shippedAt: Schema.Date
}) {}

class Delivered extends Schema.TaggedClass<Delivered>()("Delivered", {
  orderId: Schema.String,
  items: Schema.Array(Schema.String),
  deliveredAt: Schema.Date
}) {}

const Order = Schema.Union(Pending, Shipped, Delivered)
type Order = Schema.Schema.Type<typeof Order>

// ✅ GOOD: Schema.is() in Match patterns
const getOrderStatus = (order: Order) =>
  Match.value(order).pipe(
    Match.when(Schema.is(Pending), () => "Awaiting shipment"),
    Match.when(Schema.is(Shipped), (o) => `Tracking: ${o.trackingNumber}`),
    Match.when(Schema.is(Delivered), (o) => `Delivered ${o.deliveredAt}`),
    Match.exhaustive
  )
```

```typescript
// ❌ BAD: Optional properties hide state complexity
const Order = Schema.Struct({
  orderId: Schema.String,
  items: Schema.Array(Schema.String),
  trackingNumber: Schema.optional(Schema.String),  // When is this set?
  shippedAt: Schema.optional(Schema.Date),         // Unclear state
  deliveredAt: Schema.optional(Schema.Date)        // Can be shipped AND delivered?
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

The most powerful pattern: **TaggedClass for data, Schema.is() in Match for logic.**

```typescript
import { Schema, Match } from "effect"

// Define all variants with TaggedClass (not Struct)
class CreditCard extends Schema.TaggedClass<CreditCard>()("CreditCard", {
  last4: Schema.String,
  expiryMonth: Schema.Number,
  expiryYear: Schema.Number
}) {
  get isExpired() {
    const now = new Date()
    return this.expiryYear < now.getFullYear() ||
      (this.expiryYear === now.getFullYear() && this.expiryMonth < now.getMonth() + 1)
  }
}

class BankTransfer extends Schema.TaggedClass<BankTransfer>()("BankTransfer", {
  accountId: Schema.String,
  routingNumber: Schema.String
}) {}

class Crypto extends Schema.TaggedClass<Crypto>()("Crypto", {
  walletAddress: Schema.String,
  network: Schema.Literal("ethereum", "bitcoin", "solana")
}) {}

const PaymentMethod = Schema.Union(CreditCard, BankTransfer, Crypto)
type PaymentMethod = Schema.Schema.Type<typeof PaymentMethod>

// Process with Schema.is() to access class methods
const processPayment = (method: PaymentMethod, amount: number) =>
  Match.value(method).pipe(
    Match.when(Schema.is(CreditCard), (card) =>
      card.isExpired ? Effect.fail("Card expired") : chargeCard(card.last4, amount)
    ),
    Match.when(Schema.is(BankTransfer), (bank) =>
      initiateBankTransfer(bank.accountId, bank.routingNumber, amount)
    ),
    Match.when(Schema.is(Crypto), (crypto) =>
      sendCrypto(crypto.walletAddress, crypto.network, amount)
    ),
    Match.exhaustive
  )

// Also works with Match.tag for simple cases
const getPaymentLabel = (method: PaymentMethod) =>
  Match.value(method).pipe(
    Match.tag("CreditCard", (c) => `Card ending ${c.last4}`),
    Match.tag("BankTransfer", (b) => `Bank ${b.accountId}`),
    Match.tag("Crypto", (c) => `${c.network}: ${c.walletAddress.slice(0, 8)}...`),
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

- **ELIMINATE all if/else, switch/case, and ternaries** - use Match, Option.match, Either.match instead
- **Refactor imperative code on sight** - this is mandatory, not optional
- **Use Schema.Class/TaggedClass** - not Schema.Struct for domain entities
- **Use tagged unions over optional properties** - make states explicit
- **Use Schema.is() in Match.when patterns** - combine validation with matching
- **Use Match for ALL conditional logic** - replace if/else, switch, ternaries
- Use Effect.gen for sequential code
- Define services with Context.Tag
- Compose layers bottom-up
- Use Data.TaggedError for domain errors (which work with Match.tag)

### Don't - FORBIDDEN Patterns

- **NEVER use if/else** - always use Match.value + Match.when
- **NEVER use switch/case** - always use Match.type + Match.tag
- **NEVER use ternary operators** - always use Match.value + Match.when
- **NEVER use `if (x != null)`** - always use Option.match
- **NEVER check `.success` or similar** - always use Either.match or Effect.match
- **NEVER access `._tag` directly** - always use Match.tag or Schema.is()
- **NEVER use JSON.parse()** - always use Schema.parseJson with a schema
- Use Schema.Struct for domain entities (use Schema.Class)
- Use optional properties for state (use tagged unions)
- Use plain TypeScript interfaces/types without Schema
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
