# rule-003: parse-json

**Category:** schema
**Rule ID:** rule-003

## Rule

Never use JSON.parse(); use Schema.parseJson()

## Description

Separate JSON.parse then validate (WRONG)

## Good Pattern

See `rule-003.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-003.detector.ts` file.
