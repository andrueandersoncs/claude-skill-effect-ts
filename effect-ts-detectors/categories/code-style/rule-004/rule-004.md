# rule-004: effect-fn-single-step

**Category:** code-style
**Rule ID:** rule-004

## Rule

Never use Effect.gen for simple single-step effects; use Effect.fn()

## Description

Single operation function

## Good Pattern

See `rule-004.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-004.detector.ts` file.
