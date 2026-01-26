---
name: create-service
description: Generate a typed Effect service with Context.Tag and Layer implementation
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
argument-hint: "<ServiceName> [description]"
---

# Create Effect Service

Generate a complete Effect service with:
1. Service interface definition using Context.Tag
2. Layer implementation (Live)
3. Optional test layer

## Process

1. Parse the service name from arguments (e.g., "UserRepository", "EmailService")
2. If description provided, use it; otherwise infer from name
3. Determine appropriate file location:
   - Check for existing `services/` or `src/services/` directory
   - If none exists, create in current directory
4. Generate the service file with:
   - Proper imports from "effect"
   - Service interface using Context.Tag pattern
   - Placeholder methods based on service name
   - Live layer implementation
   - Export statements

## Service Template

```typescript
import { Context, Effect, Layer } from "effect"

// Service interface
export class {ServiceName} extends Context.Tag("{ServiceName}")<
  {ServiceName},
  {
    readonly methodName: (param: ParamType) => Effect.Effect<ReturnType, ErrorType>
  }
>() {}

// Live implementation
export const {ServiceName}Live = Layer.succeed(
  {ServiceName},
  {
    methodName: (param) => Effect.gen(function* () {
      // Implementation
      return result
    })
  }
)

// Test implementation (use with @effect/vitest it.layer)
export const {ServiceName}Test = Layer.succeed(
  {ServiceName},
  {
    methodName: (param) => Effect.succeed(mockResult)
  }
)
```

## Test Usage with @effect/vitest

When generating a test layer, also show how to use it with `@effect/vitest`:

```typescript
import { it, expect, layer } from "@effect/vitest"
import { Effect } from "effect"
import { {ServiceName}, {ServiceName}Test } from "./{ServiceName}"

layer({ServiceName}Test)("{ServiceName}", (it) => {
  it.effect("should execute method", () =>
    Effect.gen(function* () {
      const service = yield* {ServiceName}
      const result = yield* service.methodName(param)
      expect(result).toBeDefined()
    })
  )
})
```

## Infer Methods from Service Name

- If name contains "Repository": add `findById`, `findAll`, `save`, `delete`
- If name contains "Service": add `execute`, `process`
- If name contains "Client": add `get`, `post`, `request`
- If name contains "Cache": add `get`, `set`, `invalidate`
- Otherwise: add generic `execute` method

## Output

After generating, display:
1. File path created
2. Service name and methods
3. Example usage code showing how to use the service in an Effect.gen block
