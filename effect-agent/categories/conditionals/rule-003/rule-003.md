# rule-003: match-struct-conditions

**Category:** conditionals
**Rule ID:** rule-003

## Rule

Never use combined AND conditions (&&); define a Schema.Struct capturing all conditions and use Match.when with Schema.is

## Description

Matching multiple conditions with Schema.Struct

## Good Pattern

See `rule-003.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-003.detector.ts` file.
