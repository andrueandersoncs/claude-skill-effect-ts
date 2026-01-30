# rule-007: it-effect

**Category:** testing
**Rule ID:** rule-007

## Rule

Never use Effect.runPromise in tests; use it.effect from @effect/vitest

## Description

Test with service dependencies

## Good Pattern

See `rule-007.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-007.detector.ts` file.
