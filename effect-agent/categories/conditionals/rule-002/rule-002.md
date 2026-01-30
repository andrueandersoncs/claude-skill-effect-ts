# rule-002: match-literal-union

**Category:** conditionals
**Rule ID:** rule-002

## Rule

Never use multiple OR conditions (||); define a Schema union with Schema.Literal and use Match.when with Schema.is

## Description

Matching any of several values with Schema.Literal union

## Good Pattern

See `rule-002.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-002.detector.ts` file.
