# rule-005: promise-chain

**Category:** async
**Rule ID:** rule-005

## Rule

Never use Promise chains (.then); use pipe with Effect.map/flatMap

## Description

Promise chain with transformation

## Good Pattern

See `rule-005.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-005.detector.ts` file.
