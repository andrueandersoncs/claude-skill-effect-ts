# rule-007: stateful-test-layer

**Category:** services
**Rule ID:** rule-007

## Rule

Never use stateless test mocks; use Layer.effect with Ref for state

## Description

Repository test layer maintaining state

## Good Pattern

See `rule-007.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-007.detector.ts` file.
