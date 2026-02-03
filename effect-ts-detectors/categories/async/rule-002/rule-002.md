# rule-002: generator-yield

**Category:** async
**Rule ID:** rule-002

## Rule

Never use yield or await in Effect.gen; use yield*

## Description

Correct generator usage

## Good Pattern

See `rule-002.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-002.detector.ts` file.
