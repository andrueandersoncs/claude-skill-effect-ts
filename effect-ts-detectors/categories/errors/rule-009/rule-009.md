# rule-009: retry-schedule

**Category:** errors
**Rule ID:** rule-009

## Rule

Never use manual retry loops; use Effect.retry with Schedule

## Description

Retry only for specific errors

## Good Pattern

See `rule-009.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-009.detector.ts` file.
