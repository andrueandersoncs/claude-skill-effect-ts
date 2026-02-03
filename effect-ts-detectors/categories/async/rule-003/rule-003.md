# rule-003: http-handler-boundary

**Category:** async
**Rule ID:** rule-003

## Rule

Never use Effect.runPromise except at application boundaries

## Description

HTTP handler (boundary OK)

## Good Pattern

See `rule-003.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-003.detector.ts` file.
