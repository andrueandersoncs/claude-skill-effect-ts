# rule-006: race-operations

**Category:** async
**Rule ID:** rule-006

## Rule

Never use Promise.race; use Effect.race or Effect.raceAll

## Description

Racing multiple operations

## Good Pattern

See `rule-006.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-006.detector.ts` file.
