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
2. Live Layer implementation (production)
3. **Test Layer implementation (REQUIRED — not optional)**

Every external dependency (API calls, databases, file systems, third-party SDKs, email, caches, queues) MUST be wrapped in a Service. The Test Layer is REQUIRED because it is the foundation of testable Effect code — without it, tests cannot avoid hitting real external systems, and 100% coverage is impossible.

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
   - **Test layer implementation (ALWAYS generated)**
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

// Test implementation (REQUIRED — use with @effect/vitest it.layer)
export const {ServiceName}Test = Layer.succeed(
  {ServiceName},
  {
    methodName: (param) => Effect.succeed(mockResult)
  }
)
```

**For stateful services (repositories, caches),** use `Layer.effect` with `Ref`:

```typescript
import { Context, Effect, Layer, Ref, Option } from "effect"

export const {ServiceName}Test = Layer.effect(
  {ServiceName},
  Effect.gen(function* () {
    const store = yield* Ref.make<Map<string, Entity>>(new Map())

    return {
      save: (entity: Entity) =>
        Ref.update(store, (m) => new Map(m).set(entity.id, entity)),
      findById: (id: string) =>
        Effect.gen(function* () {
          const items = yield* Ref.get(store)
          return yield* Option.match(Option.fromNullable(items.get(id)), {
            onNone: () => Effect.fail(new NotFoundError({ id })),
            onSome: Effect.succeed
          }).pipe(Effect.flatten)
        })
    }
  })
)
```

## Test Usage with @effect/vitest

**ALWAYS show test layer usage.** The test layer is the primary reason the service exists — it enables 100% test coverage without external dependencies.

```typescript
import { it, expect, layer } from "@effect/vitest"
import { Effect, Schema, Arbitrary } from "effect"
import { {ServiceName}, {ServiceName}Test } from "./{ServiceName}"

layer({ServiceName}Test)("{ServiceName}", (it) => {
  it.effect("should execute method", () =>
    Effect.gen(function* () {
      const service = yield* {ServiceName}
      const result = yield* service.methodName(param)
      expect(result).toBeDefined()
    })
  )

  // Property-based test with Arbitrary — combine services + generated data
  it.effect.prop(
    "should handle any valid input",
    [Arbitrary.make(InputSchema)],
    ([input]) =>
      Effect.gen(function* () {
        const service = yield* {ServiceName}
        const result = yield* service.methodName(input)
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
