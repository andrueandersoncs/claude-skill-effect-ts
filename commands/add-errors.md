---
name: add-errors
description: Add typed error handling to existing Effect code using Schema.TaggedError
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
argument-hint: "<file-path> [error-names...]"
---

# Add Typed Errors to Effect Code

Add typed error handling to existing Effect code by:
1. Creating Schema.TaggedError classes
2. Updating function signatures with error types
3. Adding proper error handling with catchTag/catchTags

## Process

1. Read the specified file
2. Analyze existing code for:
   - Functions returning Effect
   - Existing error handling (try/catch, Effect.catchAll)
   - Places where errors might occur (API calls, validations)
3. If error names provided, create those specific errors
4. If no error names, infer appropriate errors from code context:
   - API/fetch calls → `NetworkError`, `ApiError`
   - Database operations → `DatabaseError`, `NotFoundError`
   - Validation → `ValidationError`
   - Parsing → `ParseError`
   - Auth → `AuthenticationError`, `AuthorizationError`

## Error Template

```typescript
import { Schema } from "effect"

export class {ErrorName} extends Schema.TaggedError<{ErrorName}>()(
  "{ErrorName}",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}
```

## Transformation Examples

### Before
```typescript
const getUser = (id: string) =>
  Effect.tryPromise(() => fetch(`/api/users/${id}`).then(r => r.json()))
```

### After
```typescript
import { Schema, Effect } from "effect"

export class UserNotFound extends Schema.TaggedError<UserNotFound>()(
  "UserNotFound",
  { userId: Schema.String }
) {}

export class NetworkError extends Schema.TaggedError<NetworkError>()(
  "NetworkError",
  { url: Schema.String, cause: Schema.Unknown }
) {}

const getUser = (id: string): Effect.Effect<User, UserNotFound | NetworkError> =>
  Effect.tryPromise({
    try: () => fetch(`/api/users/${id}`).then(r => r.json()),
    catch: (error) => new NetworkError({ url: `/api/users/${id}`, cause: error })
  }).pipe(
    Effect.flatMap((data) =>
      data ? Effect.succeed(data) : Effect.fail(new UserNotFound({ userId: id }))
    )
  )
```

## Output

After transforming:
1. Show errors created
2. Show functions updated with error types
3. Provide example error handling code using catchTag
