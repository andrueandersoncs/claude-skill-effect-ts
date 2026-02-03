# rule-001: self-documenting-code

**Category:** comments
**Rule ID:** rule-001

## Rule

Never add comments that merely restate what the code already expresses; Effect-TS code is self-documenting through types, pipelines, and clear naming

## Description

Effect-TS provides strong self-documentation through:
- **Branded types**: The brand itself documents the purpose
- **Effect pipelines**: Operations like `pipe`, `map`, `flatMap` are self-explanatory
- **Function signatures**: Well-named functions with typed parameters need no JSDoc
- **Implementation patterns**: Clear code structure shows what the code does

Redundant comments add noise without value and can become outdated.

## Patterns to Avoid

1. **Branded type JSDoc**: `/** Branded type for X */` - the brand name says it
2. **Pipeline comments**: `// Get the user` before `fetchUser(id)`
3. **Redundant @param/@returns**: `@param name - The name` adds nothing
4. **WHAT comments**: `// Save the user` before `db.saveUser(user)`

## Good Pattern

See `rule-001.ts` for the correct implementation patterns.

## Detection

This rule can be detected by the `rule-001.detector.ts` file.
