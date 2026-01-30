# rule-003: chunked-processing

**Category:** imperative
**Rule ID:** rule-003

## Rule

Never use manual batching for large sequences; use Stream

## Description

Chunked processing with concurrency

## Good Pattern

See `rule-003.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-003.detector.ts` file.
