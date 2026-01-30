# rule-009: head-and-tail-access

**Category:** native-apis
**Rule ID:** rule-009

## Rule

Never use array[index]; use Array.get or Array.head/last (returns Option)

## Description

Head and tail access

## Good Pattern

See `rule-009.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-009.detector.ts` file.
