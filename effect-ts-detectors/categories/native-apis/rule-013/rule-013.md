# rule-013: safe-property-access

**Category:** native-apis
**Rule ID:** rule-013

## Rule

Never use record[key]; use Record.get (returns Option)

## Description

Safe property access

## Good Pattern

See `rule-013.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-013.detector.ts` file.
