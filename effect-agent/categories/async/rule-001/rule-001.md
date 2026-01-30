# rule-001: callback-api

**Category:** async
**Rule ID:** rule-001

## Rule

Never use new Promise(); use Effect.async for callback-based APIs

## Description

Converting callback-based API

## Good Pattern

See `rule-001.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-001.detector.ts` file.
