---
name: to-match
description: Refactor FORBIDDEN imperative code (if/else, switch/case, ternaries) to Effect Match pattern matching - this is mandatory, not optional
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
argument-hint: "<file-path> [function-name]"
---

# Convert to Effect Match

**Imperative control flow (if/else, switch/case, ternaries) is FORBIDDEN in Effect code.** This command refactors imperative code into type-safe Effect Match expressions.

This is not optional - ALL imperative conditionals must be eliminated. Use this command to systematically convert legacy or non-idiomatic code.

## Process

1. Read the specified file
2. If function name provided, find that specific function
3. Otherwise, scan for convertible patterns:
   - if/else if/else chains (3+ branches)
   - switch statements
   - Ternary chains
4. Analyze the condition patterns:
   - Property checks (`x.type === "foo"`)
   - Value comparisons (`x === "value"`)
   - Type guards (`typeof x === "string"`)
   - Direct `._tag` access (FORBIDDEN - convert to Match.tag or Schema.is())
5. Generate equivalent Match expression
6. Replace the original code

## Conversion Patterns

### if/else to Match.value

**Before:**
```typescript
function getPermission(role: string): string {
  if (role === "admin") {
    return "full"
  } else if (role === "user") {
    return "limited"
  } else if (role === "guest") {
    return "readonly"
  } else {
    return "none"
  }
}
```

**After:**
```typescript
import { Match } from "effect"

const getPermission = (role: string): string =>
  Match.value(role).pipe(
    Match.when("admin", () => "full"),
    Match.when("user", () => "limited"),
    Match.when("guest", () => "readonly"),
    Match.orElse(() => "none")
  )
```

### switch to Match.value

**Before:**
```typescript
function handleStatus(status: Status): void {
  switch (status) {
    case "pending":
      console.log("Waiting...")
      break
    case "active":
      console.log("In progress")
      break
    case "completed":
      console.log("Done!")
      break
    default:
      console.log("Unknown")
  }
}
```

**After:**
```typescript
import { Match } from "effect"

const handleStatus = (status: Status): void =>
  Match.value(status).pipe(
    Match.when("pending", () => console.log("Waiting...")),
    Match.when("active", () => console.log("In progress")),
    Match.when("completed", () => console.log("Done!")),
    Match.orElse(() => console.log("Unknown"))
  )
```

### Direct ._tag Access to Match.tag (FORBIDDEN pattern)

**Before (FORBIDDEN - direct ._tag access):**
```typescript
function getArea(shape: Shape): number {
  if (shape._tag === "Circle") {
    return Math.PI * shape.radius ** 2
  } else if (shape._tag === "Rectangle") {
    return shape.width * shape.height
  } else {
    return (shape.base * shape.height) / 2
  }
}

// Also FORBIDDEN:
const isCircle = shape._tag === "Circle"
```

**After (REQUIRED):**
```typescript
import { Match } from "effect"

const getArea = Match.type<Shape>().pipe(
  Match.tag("Circle", ({ radius }) => Math.PI * radius ** 2),
  Match.tag("Rectangle", ({ width, height }) => width * height),
  Match.tag("Triangle", ({ base, height }) => (base * height) / 2),
  Match.exhaustive
)

// For type guards on Schema types (Schema.TaggedClass, Schema.Class), use Schema.is():
import { Schema } from "effect"
const isCircle = Schema.is(Circle)  // Only works if Circle is a Schema type

// Schema.TaggedError works with Schema.is(), Effect.catchTag, and Match.tag:
// - Schema.is(NetworkError) for type guards
// - Effect.catchTag("NetworkError", ...) for error recovery
// - Match.tag("NetworkError", ...) for pattern matching
```

## Match Selection Rules

- Use `Match.exhaustive` when all cases of a union are handled
- Use `Match.orElse` when there's a default case
- Use `Match.tag` for discriminated unions with `_tag` (NEVER access `._tag` directly)
- Use `Match.when` for value comparisons
- Use `Match.type<T>()` for reusable matchers
- Use `Schema.is()` for type guards (NEVER check `._tag === "..."` directly)

## Output

After converting:
1. Show the original code
2. Show the converted Match expression
3. Note if `Match.exhaustive` was used (compile-time safety)
4. Add import statement if not present
