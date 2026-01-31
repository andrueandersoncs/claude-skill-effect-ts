# rule-002: no-type-assertions

**Category:** code-style
**Rule ID:** rule-002

## Rule

Never use type assertions (as, angle brackets, double assertions); use Schema.decodeUnknown or type guards

## Description

Type assertions bypass TypeScript's type system without runtime validation. This includes:
- `as any` - disables all type checking
- `as unknown as T` - double assertion to force type conversion
- `<Type>value` - angle bracket syntax (old-style assertion)
- `as SomeType` on API responses - trusting external data without validation

Use Schema.decodeUnknown for runtime validation of unknown data, or type guards (instanceof, discriminated unions) for narrowing known types.

## Good Pattern

See `rule-002.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-002.detector.ts` file.
