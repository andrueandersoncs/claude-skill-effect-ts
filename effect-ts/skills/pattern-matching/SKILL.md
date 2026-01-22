---
name: Pattern Matching
description: This skill should be used when the user asks about "Effect Match", "pattern matching", "Match.type", "Match.tag", "Match.when", "exhaustive matching", "discriminated unions", "Match.value", "converting switch to Match", "converting if/else to Match", or needs to understand how Effect provides type-safe exhaustive pattern matching.
version: 1.0.0
---

# Pattern Matching in Effect

## Overview

Effect's `Match` module provides:

- **Exhaustive matching** - Compiler ensures all cases handled
- **Type narrowing** - Automatic type inference in each branch
- **Composable matchers** - Build complex patterns from simple ones
- **Predicate support** - Match on conditions, not just values

## Basic Matching

### Match.value - Match a Value

```typescript
import { Match } from "effect"

const result = Match.value(input).pipe(
  Match.when("admin", () => "Full access"),
  Match.when("user", () => "Limited access"),
  Match.when("guest", () => "Read only"),
  Match.exhaustive
)
```

### Match.type - Create Reusable Matcher

```typescript
const rolePermissions = Match.type<"admin" | "user" | "guest">().pipe(
  Match.when("admin", () => "Full access"),
  Match.when("user", () => "Limited access"),
  Match.when("guest", () => "Read only"),
  Match.exhaustive
)

// Use multiple times
const perm1 = rolePermissions("admin")
const perm2 = rolePermissions("guest")
```

## Matching Discriminated Unions

### Match.tag - Match by _tag

```typescript
type Shape =
  | { _tag: "Circle"; radius: number }
  | { _tag: "Rectangle"; width: number; height: number }
  | { _tag: "Triangle"; base: number; height: number }

const area = Match.type<Shape>().pipe(
  Match.tag("Circle", ({ radius }) => Math.PI * radius ** 2),
  Match.tag("Rectangle", ({ width, height }) => width * height),
  Match.tag("Triangle", ({ base, height }) => (base * height) / 2),
  Match.exhaustive
)

area({ _tag: "Circle", radius: 5 }) // 78.54...
```

### Handling Effect Errors

```typescript
type AppError =
  | { _tag: "NetworkError"; url: string }
  | { _tag: "ValidationError"; field: string; message: string }
  | { _tag: "AuthError"; reason: string }

const handleError = Match.type<AppError>().pipe(
  Match.tag("NetworkError", (e) => `Failed to fetch ${e.url}`),
  Match.tag("ValidationError", (e) => `${e.field}: ${e.message}`),
  Match.tag("AuthError", (e) => `Auth failed: ${e.reason}`),
  Match.exhaustive
)
```

## Conditional Matching

### Match.when - Match with Predicate

```typescript
const describeNumber = Match.type<number>().pipe(
  Match.when((n) => n < 0, () => "negative"),
  Match.when((n) => n === 0, () => "zero"),
  Match.when((n) => n > 0 && n < 10, () => "small positive"),
  Match.when((n) => n >= 10, () => "large positive"),
  Match.exhaustive
)
```

### Match.when with Refinement

```typescript
const processInput = Match.type<string | number | boolean>().pipe(
  Match.when(
    (x): x is string => typeof x === "string",
    (s) => `String: ${s.toUpperCase()}`
  ),
  Match.when(
    (x): x is number => typeof x === "number",
    (n) => `Number: ${n * 2}`
  ),
  Match.when(
    (x): x is boolean => typeof x === "boolean",
    (b) => `Boolean: ${!b}`
  ),
  Match.exhaustive
)
```

## Non-Exhaustive Matching

### Match.orElse - Provide Default

```typescript
const greet = Match.type<string>().pipe(
  Match.when("morning", () => "Good morning!"),
  Match.when("evening", () => "Good evening!"),
  Match.orElse(() => "Hello!")
)

greet("morning")  // "Good morning!"
greet("afternoon") // "Hello!"
```

### Match.orElseAbsurd - Assert Exhaustive

```typescript
// Use when you believe all cases are covered
// Throws at runtime if unhandled case reached
const handle = Match.type<"a" | "b">().pipe(
  Match.when("a", () => 1),
  Match.when("b", () => 2),
  Match.orElseAbsurd
)
```

## Advanced Patterns

### Match.not - Negative Matching

```typescript
const classify = Match.type<number>().pipe(
  Match.when((n) => n === 0, () => "zero"),
  Match.not((n) => n > 0, () => "negative"),  // Matches when NOT positive
  Match.orElse(() => "positive")
)
```

### Match.whenOr - Multiple Patterns

```typescript
const isWeekend = Match.type<string>().pipe(
  Match.whenOr("Saturday", "Sunday", () => true),
  Match.orElse(() => false)
)
```

### Match.whenAnd - Combined Conditions

```typescript
interface User {
  role: "admin" | "user"
  verified: boolean
}

const canDelete = Match.type<User>().pipe(
  Match.whenAnd(
    { role: "admin" },
    (u) => u.verified,
    () => true
  ),
  Match.orElse(() => false)
)
```

## Pattern Objects

### Matching Object Shapes

```typescript
const processEvent = Match.type<Event>().pipe(
  Match.when({ type: "click" }, (e) => handleClick(e)),
  Match.when({ type: "keydown" }, (e) => handleKeydown(e)),
  Match.when({ type: "submit" }, (e) => handleSubmit(e)),
  Match.orElse(() => { /* unknown event */ })
)
```

### Nested Pattern Matching

```typescript
interface Response {
  status: number
  data: { type: string; value: unknown }
}

const handleResponse = Match.type<Response>().pipe(
  Match.when(
    { status: 200, data: { type: "user" } },
    (r) => `User: ${r.data.value}`
  ),
  Match.when(
    { status: 200, data: { type: "product" } },
    (r) => `Product: ${r.data.value}`
  ),
  Match.when({ status: 404 }, () => "Not found"),
  Match.when({ status: 500 }, () => "Server error"),
  Match.orElse(() => "Unknown response")
)
```

## Converting from if/else

### Before (if/else)

```typescript
function processStatus(status: Status): string {
  if (status === "pending") {
    return "Waiting..."
  } else if (status === "active") {
    return "In progress"
  } else if (status === "completed") {
    return "Done!"
  } else if (status === "failed") {
    return "Error occurred"
  } else {
    return "Unknown"
  }
}
```

### After (Match)

```typescript
const processStatus = Match.type<Status>().pipe(
  Match.when("pending", () => "Waiting..."),
  Match.when("active", () => "In progress"),
  Match.when("completed", () => "Done!"),
  Match.when("failed", () => "Error occurred"),
  Match.exhaustive // Compile error if status type changes!
)
```

## Converting from switch

### Before (switch)

```typescript
function getDiscount(userType: UserType): number {
  switch (userType) {
    case "regular":
      return 0
    case "premium":
      return 10
    case "vip":
      return 20
    default:
      return 0
  }
}
```

### After (Match)

```typescript
const getDiscount = Match.type<UserType>().pipe(
  Match.when("regular", () => 0),
  Match.when("premium", () => 10),
  Match.when("vip", () => 20),
  Match.exhaustive
)
```

## With Effects

```typescript
const handleError = (error: AppError) =>
  Match.value(error).pipe(
    Match.tag("NetworkError", (e) =>
      Effect.gen(function* () {
        yield* Effect.logError("Network failure", { url: e.url })
        return yield* Effect.fail(e)
      })
    ),
    Match.tag("ValidationError", (e) =>
      Effect.succeed({ field: e.field, message: e.message })
    ),
    Match.tag("AuthError", () =>
      Effect.redirect("/login")
    ),
    Match.exhaustive
  )
```

## Best Practices

1. **Prefer Match.exhaustive** - Catch missing cases at compile time
2. **Use Match.tag for unions** - Cleaner than manual _tag checks
3. **Create reusable matchers** - Use Match.type() for repeated patterns
4. **Handle edge cases with Match.when** - Predicates for complex logic
5. **Combine with Schema** - Validate then match

## Additional Resources

For comprehensive pattern matching documentation, consult `${CLAUDE_PLUGIN_ROOT}/references/llms-full.txt`.

Search for these sections:
- "Pattern Matching" for full API reference
