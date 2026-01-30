# rule-010: ternary-to-match

**Category:** conditionals
**Rule ID:** rule-010

## Rule

Never use ternary operators; define Schema types for each range and use Match.when with Schema.is

## Description

Nested ternary replaced with Schema-defined score ranges

## Good Pattern

See `rule-010.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-010.detector.ts` file.
