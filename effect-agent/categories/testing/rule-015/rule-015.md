# rule-015: test-clock

**Category:** testing
**Rule ID:** rule-015

## Rule

Never provide TestClock layer (defaultTestClock/live) manually; it.effect includes it automatically

## Description

Time-based testing

## Good Pattern

See `rule-015.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-015.detector.ts` file.
