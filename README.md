# Effect-TS Plugin for Claude Code

A comprehensive Claude Code plugin for Effect-TS development. Provides skills, commands, and agents to help you write idiomatic Effect-TS code.

## Installation

```bash
/plugin marketplace add andrueandersoncs/claude-skill-effect-ts
/plugin install effect-ts@effect-ts
```

## Features

### Skills (21 domains)

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

### Commands

| Command | Description |
|---------|-------------|
| `/create-service` | Generate an Effect service with Layer |
| `/add-errors` | Add typed errors to existing code |
| `/create-schema` | Generate Schema definitions |
| `/to-match` | Convert conditionals to Match expressions |

### Agents

| Agent | Description |
|-------|-------------|
| effect-reviewer | Review code for Effect-TS best practices |
| effect-migrator | Migrate code to Effect-TS patterns |

## Usage

Once installed, Claude Code will automatically use these skills when working with Effect-TS code. You can also explicitly invoke commands:

```
/create-service UserService
/create-schema User
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

Andrue Anderson ([@andrueandersoncs](https://github.com/andrueandersoncs))
