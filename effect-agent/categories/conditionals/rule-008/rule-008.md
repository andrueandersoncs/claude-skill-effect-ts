# rule-008: result-effect-match

**Category:** conditionals
**Rule ID:** rule-008

## Rule

Never use result/error flag checks; use Either.match or Effect.match with Schema.TaggedClass

## Description

Effect success/failure handling with Schema-defined result types

## Good Pattern

See `rule-008.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-008.detector.ts` file.
