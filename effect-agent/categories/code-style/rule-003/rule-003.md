# rule-003: eslint-disable-any-type

**Category:** code-style
**Rule ID:** rule-003

## Rule

Never use eslint-disable for any-type errors; use Schema

## Description

Using eslint-disable comments to suppress TypeScript any-type errors (like @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, etc.) defeats type safety. Instead, use Effect's Schema module with `Schema.decodeUnknown` to parse and validate unknown data with full type safety.

## Detected Patterns

This rule detects eslint-disable comments that suppress:
- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-unsafe-return`
- `@typescript-eslint/no-unsafe-argument`

## Good Pattern

See `rule-003.ts` for the correct implementation pattern using Schema.decodeUnknown.

## Detection

This rule can be detected by the `rule-003.detector.ts` file.
