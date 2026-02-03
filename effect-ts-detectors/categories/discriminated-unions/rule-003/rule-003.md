# rule-003: runtime-validation

**Category:** discriminated-unions
**Rule ID:** rule-003

## Rule

Never cast unknown to check ._tag; use Schema.is() for validation

## Description

Runtime validation of unknown input

## Good Pattern

See `rule-003.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-003.detector.ts` file.
