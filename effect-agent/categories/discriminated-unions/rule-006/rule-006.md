# rule-006: switch-on-tag

**Category:** discriminated-unions
**Rule ID:** rule-006

## Rule

Never check ._tag directly; use Schema.is(Variant)

## Description

Switch on _tag property

## Good Pattern

See `rule-006.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-006.detector.ts` file.
