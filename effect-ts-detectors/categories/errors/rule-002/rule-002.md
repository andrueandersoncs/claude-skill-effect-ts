# rule-002: catch-tag-recovery

**Category:** errors
**Rule ID:** rule-002

## Rule

Use Effect.catchTag/catchTags with Schema.TaggedError for type-safe error recovery

## Description

This rule consolidates error handling patterns for recovering from specific errors:

1. **Single error recovery**: Use `Effect.catchTag` instead of manually checking `error._tag`
2. **Multiple error recovery**: Use `Effect.catchTags` instead of switch statements on `error._tag`
3. **Error type definitions**: Use `Schema.TaggedError` instead of plain classes extending `Error` or `Data.TaggedError`

The combination of `Schema.TaggedError` with `Effect.catchTag/catchTags` provides:
- Type-safe error handling with full TypeScript inference
- Schema compatibility for encoding/decoding errors
- Clean, declarative error recovery patterns
- Works with `Match.tag` and `Schema.is()` for additional flexibility

## Good Patterns

### Single Error Recovery with catchTag

```typescript
import { Effect } from "effect";

const result = getUser(id).pipe(
  Effect.catchTag("UserNotFound", () => Effect.succeed(defaultUser))
);
```

### Multiple Error Recovery with catchTags

```typescript
import { Effect, Schema } from "effect";

class ValidationError extends Schema.TaggedError<ValidationError>()("ValidationError", {
  message: Schema.String,
}) {}

class NotFoundError extends Schema.TaggedError<NotFoundError>()("NotFoundError", {
  message: Schema.String,
}) {}

const result = processOrder(order).pipe(
  Effect.catchTags({
    ValidationError: (e) => Effect.fail(new BadRequest({ message: e.message })),
    NotFoundError: () => Effect.succeed(defaultOrder),
  })
);
```

### Schema.TaggedError with Match

```typescript
import { Effect, Match, Schema } from "effect";

// Schema.TaggedError works with Match.tag
const handleError = (e: UserNotFound) =>
  Match.value(e).pipe(
    Match.tag("UserNotFound", () => Effect.succeed(defaultUser)),
    Match.exhaustive
  );

// Schema.is works with Schema.TaggedError
const withSchemaIs = Match.value(error).pipe(
  Match.when(Schema.is(UserNotFound), () => defaultUser),
  Match.orElse(() => Effect.die("Unknown error"))
);
```

See `rule-002.ts` for the correct implementation patterns.

## Bad Patterns

- Manually checking `error._tag === "SomeError"` in conditionals
- Using switch statements on `error._tag`
- Using `Data.TaggedError` (doesn't support Schema encoding/decoding)
- Extending native `Error` class (loses Effect error tracking benefits)
- Using `throw` statements or `Promise.reject()`

## Detection

This rule can be detected by the `rule-002.detector.ts` file.
