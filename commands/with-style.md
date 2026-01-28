---
name: with-style
description: Enforce idiomatic Effect code style - Schema-first, Match-first, no if/else, no switch/case, no ternaries
---

# Code Style Enforcement

## CRITICAL: You MUST Follow the Code Style Skill

**Before writing ANY Effect code, you MUST read and follow the [Code Style](../skills/code-style/SKILL.md) skill ([view on GitHub](https://github.com/andrueandersoncs/claude-skill-effect-ts/blob/main/skills/code-style/SKILL.md)).**

This skill defines MANDATORY patterns, FORBIDDEN anti-patterns, and idiomatic conventions that apply to ALL Effect code you produce. Every code example you generate must conform to these rules.

## Key Directives

- **Schema-First**: Define ALL data structures as Effect Schemas
- **Match-First**: ALL conditionals MUST use Match (NO if/else, NO switch/case, NO ternaries)
- **No Imperative Control Flow**: Refactor imperative code on sight - this is mandatory
- **Service Testability**: ALL external dependencies go through Context.Tag services
- **Proper Testing**: Use @effect/vitest, never Effect.runPromise in tests

## Related Skills

| Skill | Purpose |
|-------|---------|
| [Effect Core](../skills/effect-core/SKILL.md) | Creating and composing Effects |
| [Error Management](../skills/error-management/SKILL.md) | Typed error handling |
| [Pattern Matching](../skills/pattern-matching/SKILL.md) | Match module APIs |
| [Schema](../skills/schema/SKILL.md) | Data modeling and validation |
| [Testing](../skills/testing/SKILL.md) | @effect/vitest, property-based testing |

## Reference Material

For comprehensive code style documentation, consult `${CLAUDE_PLUGIN_ROOT}/references/llms-full.txt`.
