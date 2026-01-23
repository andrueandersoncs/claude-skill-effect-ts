---
name: docs
description: Look up Effect-TS API documentation for a specific function, type, or module
allowed-tools:
  - WebFetch
argument-hint: "<Module.function> or <Module>"
---

# Effect API Documentation Lookup

Look up documentation from the official Effect-TS API reference at `https://effect-ts.github.io/effect/`.

## Process

1. Parse the argument to determine what to look up:
   - `Effect.retry` → function `retry` in Effect module
   - `Schema.Struct` → type `Struct` in Schema module
   - `Stream` → overview of Stream module
   - `Layer.provide` → function `provide` in Layer module

2. Map the module name to documentation URL:

   **Core modules** (in `effect` package):
   ```
   https://effect-ts.github.io/effect/effect/{Module}.ts.html
   ```

   | Module | URL |
   |--------|-----|
   | Effect | `https://effect-ts.github.io/effect/effect/Effect.ts.html` |
   | Schema | `https://effect-ts.github.io/effect/effect/Schema.ts.html` |
   | Stream | `https://effect-ts.github.io/effect/effect/Stream.ts.html` |
   | Layer | `https://effect-ts.github.io/effect/effect/Layer.ts.html` |
   | Context | `https://effect-ts.github.io/effect/effect/Context.ts.html` |
   | Schedule | `https://effect-ts.github.io/effect/effect/Schedule.ts.html` |
   | Fiber | `https://effect-ts.github.io/effect/effect/Fiber.ts.html` |
   | Queue | `https://effect-ts.github.io/effect/effect/Queue.ts.html` |
   | Ref | `https://effect-ts.github.io/effect/effect/Ref.ts.html` |
   | Scope | `https://effect-ts.github.io/effect/effect/Scope.ts.html` |
   | Option | `https://effect-ts.github.io/effect/effect/Option.ts.html` |
   | Either | `https://effect-ts.github.io/effect/effect/Either.ts.html` |
   | Chunk | `https://effect-ts.github.io/effect/effect/Chunk.ts.html` |
   | HashMap | `https://effect-ts.github.io/effect/effect/HashMap.ts.html` |
   | HashSet | `https://effect-ts.github.io/effect/effect/HashSet.ts.html` |
   | Duration | `https://effect-ts.github.io/effect/effect/Duration.ts.html` |
   | Config | `https://effect-ts.github.io/effect/effect/Config.ts.html` |
   | ConfigProvider | `https://effect-ts.github.io/effect/effect/ConfigProvider.ts.html` |
   | Match | `https://effect-ts.github.io/effect/effect/Match.ts.html` |
   | Data | `https://effect-ts.github.io/effect/effect/Data.ts.html` |
   | Cause | `https://effect-ts.github.io/effect/effect/Cause.ts.html` |
   | Exit | `https://effect-ts.github.io/effect/effect/Exit.ts.html` |
   | Random | `https://effect-ts.github.io/effect/effect/Random.ts.html` |
   | Clock | `https://effect-ts.github.io/effect/effect/Clock.ts.html` |
   | Tracer | `https://effect-ts.github.io/effect/effect/Tracer.ts.html` |
   | Metric | `https://effect-ts.github.io/effect/effect/Metric.ts.html` |
   | Logger | `https://effect-ts.github.io/effect/effect/Logger.ts.html` |
   | Sink | `https://effect-ts.github.io/effect/effect/Sink.ts.html` |
   | PubSub | `https://effect-ts.github.io/effect/effect/PubSub.ts.html` |
   | Deferred | `https://effect-ts.github.io/effect/effect/Deferred.ts.html` |
   | Semaphore | `https://effect-ts.github.io/effect/effect/Semaphore.ts.html` |
   | Request | `https://effect-ts.github.io/effect/effect/Request.ts.html` |
   | RequestResolver | `https://effect-ts.github.io/effect/effect/RequestResolver.ts.html` |
   | Cache | `https://effect-ts.github.io/effect/effect/Cache.ts.html` |
   | TestClock | `https://effect-ts.github.io/effect/effect/TestClock.ts.html` |
   | Runtime | `https://effect-ts.github.io/effect/effect/Runtime.ts.html` |
   | ManagedRuntime | `https://effect-ts.github.io/effect/effect/ManagedRuntime.ts.html` |

   **Platform modules** (`@effect/platform`):
   ```
   https://effect-ts.github.io/effect/platform/{Module}.ts.html
   ```
   - HttpClient, HttpServer, FileSystem, KeyValueStore, Terminal, Command, Path

3. Use WebFetch with a targeted prompt:

   **For a specific function** (e.g., `Effect.retry`):
   ```
   prompt: "Find the documentation for the 'retry' function. Include:
   1. Complete type signature with all overloads
   2. Description of what it does
   3. Parameters and options explained
   4. Code examples with expected output
   5. Related functions (See also)"
   ```

   **For a module overview** (e.g., `Stream`):
   ```
   prompt: "Provide an overview of this module:
   1. What is its purpose?
   2. Main categories of functions
   3. Key types and interfaces
   4. Common usage patterns"
   ```

4. Present the documentation in a clear format:
   - Function signature in a TypeScript code block
   - Description and explanation
   - Usage examples
   - Related functions if relevant

## Examples

**Input:** `/docs Effect.retry`
**Action:** Fetch Effect.ts.html, extract retry documentation

**Input:** `/docs Schema.transform`
**Action:** Fetch Schema.ts.html, extract transform documentation

**Input:** `/docs Stream`
**Action:** Fetch Stream.ts.html, provide module overview

**Input:** `/docs Layer.provide`
**Action:** Fetch Layer.ts.html, extract provide documentation

**Input:** `/docs HttpClient.get`
**Action:** Fetch platform/HttpClient.ts.html, extract get documentation

## Output Format

Present documentation as:

```
## Effect.retry

**Signature:**
\`\`\`typescript
<type signature>
\`\`\`

**Description:**
<what it does>

**Parameters:**
- `policy`: <description>
- `options`: <description>

**Example:**
\`\`\`typescript
<code example>
\`\`\`

**See also:** <related functions>
```

## Error Handling

If the module is not recognized:
1. Suggest similar module names
2. Offer to search the main docs index at `https://effect-ts.github.io/effect/`
