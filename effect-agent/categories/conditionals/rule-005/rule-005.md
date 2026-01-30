# rule-005: multi-condition-matching

**Category:** conditionals
**Rule ID:** rule-005

## Rule

Never use if/else chains; define Schema types for each condition and use Match.when with Schema.is

## Description

Multi-condition object matching with Schema-defined predicates

## Good Pattern

See `rule-005.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-005.detector.ts` file.
