# rule-009: fix-types

**Category:** code-style
**Rule ID:** rule-009

## Rule

Never suppress type errors with comments; fix the types

## Description

This rule detects `@ts-ignore`, `@ts-expect-error`, and `@ts-nocheck` comments used to suppress **general type errors** such as:

- Type mismatches (assigning wrong types)
- Property does not exist errors
- Argument type errors
- Return type errors

**Note:** This rule excludes exhaustiveness-related suppressions (switch/case/default contexts), which are handled by [rule-007](../rule-007/rule-007.md) (exhaustive-match).

## Why This Matters

Type suppression comments hide real type errors that could cause runtime bugs. Instead of suppressing errors:

1. **For unknown data**: Use `Schema.decodeUnknown` to validate and type the data
2. **For type mismatches**: Fix the type annotations or provide correctly typed data
3. **For missing properties**: Add the required properties or update the interface

## Bad Pattern

```typescript
declare const data: unknown;
declare const processUser: (user: User) => void;

// BAD: Suppressing type mismatch with @ts-expect-error
// @ts-expect-error - TODO fix types later
processUser(data);

// BAD: Suppressing argument type error with @ts-ignore
// @ts-ignore
getUserName({ id: 123, name: "test" }); // missing 'email' property
```

## Good Pattern

```typescript
import { Effect, Schema } from "effect";

class User extends Schema.Class<User>("User")({
  id: Schema.String,
  name: Schema.NonEmptyString,
  email: Schema.String,
}) {}

// GOOD: Validate unknown data with Schema
const processUnknownData = (data: unknown) =>
  Effect.gen(function* () {
    const user = yield* Schema.decodeUnknown(User)(data);
    yield* processUser(user);
  });

// GOOD: Provide correctly typed data
const user = new User({ id: "123", name: "Test", email: "test@example.com" });
getUserName(user);
```

## Detection

This rule can be detected by the `rule-009.detector.ts` file.

## Related Rules

- [rule-007](../rule-007/rule-007.md): Handles exhaustiveness-related lint/type suppressions
