# rule-004: schema-is-vs-match-tag

**Category:** discriminated-unions
**Rule ID:** rule-004

## Rule

Never use Match.tag when you need class methods; use Schema.is()

## Description

Choosing between Schema.is() and Match.tag

## Good Pattern

See `rule-004.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-004.detector.ts` file.
