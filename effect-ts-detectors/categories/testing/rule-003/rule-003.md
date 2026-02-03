# rule-003: effect-exit

**Category:** testing
**Rule ID:** rule-003

## Rule

Never use try/catch for error assertions; use Effect.exit

## Description

Asserting on error type and data

## Good Pattern

See `rule-003.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-003.detector.ts` file.
