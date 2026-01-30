# rule-007: map-error

**Category:** errors
**Rule ID:** rule-007

## Rule

Never rethrow transformed errors; use Effect.mapError

## Description

Transform low-level to domain errors

## Good Pattern

See `rule-007.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-007.detector.ts` file.
