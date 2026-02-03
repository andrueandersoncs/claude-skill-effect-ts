# rule-006: nullable-option-match

**Category:** conditionals
**Rule ID:** rule-006

## Rule

Never use null checks (if x != null); use Option.match

## Description

Effectful handling of nullable

## Good Pattern

See `rule-006.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-006.detector.ts` file.
