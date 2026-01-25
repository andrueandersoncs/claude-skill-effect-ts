---
name: effect-review
description: Review ALL TypeScript code and flag violations - all non-Effect patterns MUST be converted
argument-hint: "[file-or-directory]"
allowed-tools:
  - Task
---

# Review Code for Effect Compliance

Use the Task tool to spawn the `effect-reviewer` agent to perform a strict review of ALL TypeScript code. All non-Effect code is a violation that MUST be fixed.

## Instructions

1. **Invoke the effect-reviewer agent** using the Task tool:
   ```
   Task(
     subagent_type: "effect-ts:effect-reviewer",
     prompt: "Review ALL TypeScript code in [target path]. Flag all non-Effect code as violations requiring conversion. This is not optional.",
     description: "Review code for Effect compliance"
   )
   ```

2. **Pass the target path** from the command arguments:
   - If a file or directory is specified, include it in the prompt
   - If no argument provided, review all TypeScript files in the codebase

3. **Return the agent's findings** to the user

## Violations That MUST Be Fixed

### Non-Effect Code (MUST CONVERT)

- **Plain TypeScript interfaces/types** → MUST use Schema.Class or Schema.TaggedClass
- **try/catch blocks** → MUST use Effect.try or Effect.tryPromise
- **async/await functions** → MUST use Effect.gen with yield*
- **Promise-based code** → MUST use Effect with proper error typing
- **throw statements** → MUST use Effect.fail with typed errors
- **null/undefined checks** → MUST use Option with Option.match
- **if/else/switch/ternary** → MUST use Match
- **JSON.parse()** → MUST use Schema.parseJson

### Effect Anti-Patterns (FORBIDDEN)

- Direct `._tag` access (MUST use Match.tag or Schema.is() for Schema types)
- `._tag` in type definitions (e.g., `type Tag = Foo["_tag"]`)
- `._tag` in array predicates (.some/.filter) (MUST use Schema.is() for Schema types, Match.tag predicate for errors)
- `if/else` chains (MUST use Match)
- `switch/case` statements (MUST use Match)
- Ternary operators for conditionals (MUST use Match)

### Schema-First Compliance (REQUIRED)

- All data structures MUST use Effect Schema
- Schema.Class/TaggedClass over Schema.Struct for domain entities
- Tagged unions over optional properties
- Branded types for IDs

### Match-First Compliance (REQUIRED)

- All conditional logic MUST use Effect Match
- Match.exhaustive for complete case coverage
- Schema.is() in Match.when patterns

## Usage Examples

```
/effect-review                    # Review all TypeScript files in codebase
/effect-review src/services       # Review files in a directory
/effect-review src/UserService.ts # Review a specific file
```

## Expected Output

```
## Effect Code Review

### Required Conversions
[Non-Effect code that MUST be converted - these are violations, not suggestions]

### Critical Violations
[Effect anti-patterns that MUST be fixed immediately]

### Warnings
[Non-idiomatic patterns that should be addressed]

### Summary
- Files reviewed: X
- Required conversions: X
- Critical violations: X
- Warnings: X
- Overall assessment: [Non-Compliant/Needs Work/Compliant]

### Required Actions
1. [Most critical violation to fix]
2. [Second priority]
...
```
