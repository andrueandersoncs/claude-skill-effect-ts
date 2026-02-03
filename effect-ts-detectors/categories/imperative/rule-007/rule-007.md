# rule-007: limited-concurrency

**Category:** imperative
**Rule ID:** rule-007

## Rule

Never use manual batching loops; use Effect.all with concurrency

## Description

Limited concurrency

## Good Pattern

See `rule-007.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-007.detector.ts` file.
