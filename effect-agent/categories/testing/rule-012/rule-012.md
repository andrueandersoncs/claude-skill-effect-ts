# rule-012: layer-test

**Category:** testing
**Rule ID:** rule-012

## Rule

Never use live services in tests; use layer() from @effect/vitest

## Description

Testing with service dependencies

## Good Pattern

See `rule-012.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-012.detector.ts` file.
