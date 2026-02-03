# rule-001: all-either-mode

**Category:** errors
**Rule ID:** rule-001

## Rule

Never use fail-fast Promise.all; use Effect.all with mode: "either"

## Description

Get Either results for each operation

## Good Pattern

See `rule-001.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-001.detector.ts` file.
