# rule-005: effect-try-promise

**Category:** errors
**Rule ID:** rule-005

## Rule

Never use try/catch with async; use Effect.tryPromise()

## Description

Wrapping async operation

## Good Pattern

See `rule-005.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-005.detector.ts` file.
