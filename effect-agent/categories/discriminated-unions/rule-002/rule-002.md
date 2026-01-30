# rule-002: partitioning-by-tag

**Category:** discriminated-unions
**Rule ID:** rule-002

## Rule

Never use ._tag in array predicates; use Schema.is(Variant)

## Description

Partitioning by _tag

## Good Pattern

See `rule-002.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-002.detector.ts` file.
