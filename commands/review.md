---
name: review
description: Review Effect-TS code for anti-patterns, best practices violations, and improvement opportunities
argument-hint: "[file-or-directory]"
agent: effect-reviewer
---

# Review Effect Code

Run a comprehensive review of Effect-TS code to identify:

- **Critical Issues** - Anti-patterns that must be fixed immediately
- **Warnings** - Non-idiomatic patterns that may cause problems
- **Suggestions** - Improvements that would enhance the code

## What Gets Checked

### Critical (FORBIDDEN patterns)
- Direct `._tag` access (must use Match.tag or Schema.is())
- `._tag` in type definitions (e.g., `type Tag = Foo["_tag"]`)
- `._tag` in array predicates (.some/.filter)
- `if/else` chains (must use Match)
- `switch/case` statements (must use Match)
- Ternary operators for conditionals (must use Match)
- `JSON.parse()` usage (must use Schema.parseJson)

### Schema-First Compliance
- All data structures should use Effect Schema
- Schema.Class/TaggedClass over Schema.Struct for domain entities
- Tagged unions over optional properties
- Branded types for IDs

### Match-First Compliance
- All conditional logic should use Effect Match
- Match.exhaustive for complete case coverage
- Schema.is() in Match.when patterns

### Other Patterns
- Typed errors with Data.TaggedError
- Proper Layer and Context.Tag usage
- Resource cleanup with acquireRelease
- No bare try/catch (use Effect.try)
- No Promise mixing (use Effect.promise at boundaries)

## Usage

```
/review                    # Review all Effect files in codebase
/review src/services       # Review files in a directory
/review src/UserService.ts # Review a specific file
```

## Output

The review produces a structured report:

```
## Effect Code Review

### Critical Issues
[Issues that must be fixed - code will not work correctly or violates core principles]

### Warnings
[Non-idiomatic patterns that should be addressed]

### Suggestions
[Optional improvements]

### Summary
- Files reviewed: X
- Critical issues: X
- Warnings: X
- Suggestions: X
- Overall assessment: [Good/Needs Work/Critical Issues]
```
