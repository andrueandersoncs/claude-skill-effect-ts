# rule-005: filter-and-transform-single-pass

**Category:** native-apis
**Rule ID:** rule-005

## Rule

Never chain filter then map; use Array.filterMap in one pass

## Description

Filter and transform in single pass

## Good Pattern

See `rule-005.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-005.detector.ts` file.
