# Effect-TS Plugin for Claude Code

A comprehensive Claude Code plugin for Effect-TS development. Provides skills, commands, and agents to help you write idiomatic Effect-TS code.

## Installation

```bash
/plugin marketplace add andrueandersoncs/claude-skill-effect-ts
/plugin install effect-ts@effect-ts
```

## Features

### Skills (22 domains)

The plugin includes skills covering all major Effect-TS domains:

| Skill | Description |
|-------|-------------|
| effect-core | Core Effect types and operations |
| error-management | Typed errors, error handling patterns |
| resource-management | Scope, acquireRelease, resource safety |
| requirements-management | Services, Layers, dependency injection |
| configuration | ConfigProvider, environment variables |
| concurrency | Fibers, concurrent operations |
| scheduling | Schedule combinators, retry policies |
| schema | Schema definition, validation, encoding/decoding |
| data-types | Option, Either, Chunk, HashMap, etc. |
| batching-caching | Request batching, caching strategies |
| observability | Logging, metrics, tracing |
| streams | Stream processing, transformations |
| sinks | Stream consumers and collectors |
| pattern-matching | Match API for exhaustive matching |
| runtime | Runtime configuration and execution |
| platform | Platform-specific APIs (Node, Browser, Bun) |
| testing | TestClock, TestRandom, test utilities |
| code-style | Idiomatic Effect-TS style guidelines |
| state-management | Ref, SynchronizedRef, state patterns |
| traits | Equal, Hash, Order, and other traits |
| effect-ai | AI/LLM integration with Effect |
| api-docs | Look up Effect API documentation via WebFetch |

### Commands

| Command | Description |
|---------|-------------|
| `/effect-check <file>` | Run parallel compliance checks across all rule categories |
| `/effect-review [path]` | Review code for Effect-TS violations (spawns reviewer agent) |
| `/docs <API>` | Look up Effect API documentation |
| `/with-style` | Enforce idiomatic Effect code style |

### Agents

| Agent | Description |
|-------|-------------|
| effect-reviewer | Review ALL TypeScript code for Effect compliance violations |
| effect-migrator | Migrate existing code to Effect-TS patterns |
| category-checker | Check code against a single rule category (used by /effect-check) |

### Rule Categories (effect-agent/)

The plugin bundles structured rule categories for systematic compliance checking:

**Builtin Categories:**
- `async` - Async & Promises (no async/await mixing)
- `conditionals` - Conditional Statements (use Match, not if/else)
- `discriminated-unions` - Tagged union patterns
- `errors` - Error Handling (typed errors, Effect.fail)
- `imperative` - Imperative code patterns to avoid
- `native-apis` - Native API replacements
- `schema` - Schema-first data modeling
- `services` - Services & Layers for testability
- `testing` - Testing best practices

**Custom Categories:**
- `code-style` - Code style & hygiene rules

## Usage

### Parallel Compliance Checking

Run all rule categories as checks in parallel against a file:

```
/effect-check src/services/UserService.ts
```

This spawns one agent per category (10 categories = 10 parallel checks), then aggregates results into a unified report.

### Code Review

Review code for Effect compliance violations:

```
/effect-review src/services/
/effect-review src/handlers/api.ts
```

### API Documentation

Look up Effect API documentation:

```
/docs Effect.retry
/docs Stream.map
/docs Schema.Class
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

Andrue Anderson ([@andrueandersoncs](https://github.com/andrueandersoncs))
