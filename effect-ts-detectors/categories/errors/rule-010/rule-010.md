# rule-010: sandbox-catch-tags

**Category:** errors
**Rule ID:** rule-010

## Rule

Never use try/catch for Effect errors; use Effect.sandbox with catchTags

## Description

Handling defects and expected errors

## Good Pattern

See `rule-010.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-010.detector.ts` file.
