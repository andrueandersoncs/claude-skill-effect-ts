# rule-008: wrap-external-async

**Category:** async
**Rule ID:** rule-008

## Rule

Never use async functions; use Effect.gen with yield*

## Description

Wrapping external async library

## Good Pattern

See `rule-008.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-008.detector.ts` file.
