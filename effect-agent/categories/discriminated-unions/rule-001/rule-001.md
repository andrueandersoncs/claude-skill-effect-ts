# rule-001: match-tag-dispatch

**Category:** discriminated-unions
**Rule ID:** rule-001

## Rule

Never use if/else on ._tag; use Match.tag for discriminated unions

## Description

Simple event dispatch

## Good Pattern

See `rule-001.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-001.detector.ts` file.
