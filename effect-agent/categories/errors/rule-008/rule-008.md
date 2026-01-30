# rule-008: or-else-fallback

**Category:** errors
**Rule ID:** rule-008

## Rule

Never use catchAll for fallbacks; use Effect.orElse

## Description

Fallback to alternative

## Good Pattern

See `rule-008.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-008.detector.ts` file.
