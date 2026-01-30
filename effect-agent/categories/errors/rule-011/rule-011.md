# rule-011: timeout-fail

**Category:** errors
**Rule ID:** rule-011

## Rule

Never use setTimeout for timeouts; use Effect.timeout

## Description

Timeout with typed error

## Good Pattern

See `rule-011.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-011.detector.ts` file.
