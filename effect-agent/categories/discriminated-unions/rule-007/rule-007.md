# rule-007: use-union-directly

**Category:** discriminated-unions
**Rule ID:** rule-007

## Rule

Never extract types from ._tag; use the union type directly

## Description

Extracting _tag as a type

## Good Pattern

See `rule-007.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-007.detector.ts` file.
