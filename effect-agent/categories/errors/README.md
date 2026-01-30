# Error Handling

NEVER use throw, try/catch, or untyped Error classes. ALL errors MUST be typed using Schema.TaggedError. Use Effect.try/Effect.tryPromise to wrap code that may throw.
