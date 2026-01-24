---
name: effect-review
description: Review ALL TypeScript code for Effect adoption opportunities and anti-patterns - converts regular code to Effect
argument-hint: "[file-or-directory]"
allowed-tools:
  - Task
---

# Review Code for Effect Adoption

Use the Task tool to spawn the `effect-reviewer` agent to perform a comprehensive review of ALL TypeScript code - both existing Effect code and regular TypeScript that should be converted to Effect.

## Instructions

1. **Invoke the effect-reviewer agent** using the Task tool:
   ```
   Task(
     subagent_type: "effect-ts:effect-reviewer",
     prompt: "Review ALL TypeScript code in [target path]. Identify non-Effect code that should be converted, and check existing Effect code for anti-patterns and best practices.",
     description: "Review code for Effect adoption"
   )
   ```

2. **Pass the target path** from the command arguments:
   - If a file or directory is specified, include it in the prompt
   - If no argument provided, review all TypeScript files in the codebase

3. **Return the agent's findings** to the user

## What Gets Reviewed

### Code That Should Be Converted to Effect

- **Plain TypeScript interfaces/types** → Convert to Schema.Class or Schema.TaggedClass
- **try/catch blocks** → Convert to Effect.try or Effect.tryPromise
- **async/await functions** → Convert to Effect.gen with yield*
- **Promise-based code** → Convert to Effect with proper error typing
- **throw statements** → Convert to Effect.fail with typed errors
- **null/undefined checks** → Convert to Option with Option.match
- **Manual error handling** → Convert to Either or Effect error channel
- **JSON.parse()** → Convert to Schema.parseJson

### Effect Code Anti-Patterns (FORBIDDEN)

- Direct `._tag` access (must use Match.tag or Schema.is())
- `._tag` in type definitions (e.g., `type Tag = Foo["_tag"]`)
- `._tag` in array predicates (.some/.filter)
- `if/else` chains (must use Match)
- `switch/case` statements (must use Match)
- Ternary operators for conditionals (must use Match)

### Schema-First Compliance

- All data structures should use Effect Schema
- Schema.Class/TaggedClass over Schema.Struct for domain entities
- Tagged unions over optional properties
- Branded types for IDs

### Match-First Compliance

- All conditional logic should use Effect Match
- Match.exhaustive for complete case coverage
- Schema.is() in Match.when patterns

## Usage Examples

```
/effect-review                    # Review all TypeScript files in codebase
/effect-review src/services       # Review files in a directory
/effect-review src/UserService.ts # Review a specific file
```

## Expected Output

The effect-reviewer agent produces a structured report:

```
## Effect Code Review

### Conversion Opportunities
[Regular TypeScript code that should be converted to Effect]

### Critical Issues
[Effect anti-patterns that must be fixed]

### Warnings
[Non-idiomatic patterns that should be addressed]

### Suggestions
[Improvements that would enhance the code]

### Summary
- Files reviewed: X
- Conversion opportunities: X
- Critical issues: X
- Warnings: X
- Overall assessment: [Needs Effect Adoption/Needs Work/Good]

### Recommended Actions
1. [Most important conversion or fix]
2. [Second priority]
...
```
