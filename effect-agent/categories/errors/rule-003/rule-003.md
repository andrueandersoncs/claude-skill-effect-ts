# rule-003: catch-tags

**Category:** errors
**Rule ID:** rule-003

## Rule

Never use switch on error._tag; use Effect.catchTags

## Description

Handling multiple error types

## Good Pattern

See `rule-003.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-003.detector.ts` file.
