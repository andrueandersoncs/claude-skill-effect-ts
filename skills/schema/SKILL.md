---
name: Schema
description: This skill should be used when the user asks about "Effect Schema", "Schema.Struct", "Schema.decodeUnknown", "data validation", "parsing", "Schema.transform", "Schema filters", "Schema annotations", "JSON Schema", "Schema.Class", "Schema branded types", "encoding", "decoding", "Schema.parseJson", or needs to understand how Effect handles data validation and transformation.
version: 1.0.0
---

# Schema in Effect

## Overview

Effect Schema provides:

- **Type-safe validation** - Runtime checks with TypeScript inference
- **Bidirectional transformation** - Decode from external, encode for output
- **Composable schemas** - Build complex types from primitives
- **Error messages** - Detailed, customizable validation errors
- **Interop** - JSON Schema, Pretty Printing, Arbitrary generation

## Basic Schemas

```typescript
import { Schema } from "effect"

// Primitives
const str = Schema.String
const num = Schema.Number
const bool = Schema.Boolean
const bigint = Schema.BigInt

// Literals
const status = Schema.Literal("pending", "active", "completed")

// Enums
enum Color { Red, Green, Blue }
const color = Schema.Enums(Color)
```

## Decoding and Encoding

### Decoding (External → Internal)

```typescript
const Person = Schema.Struct({
  name: Schema.String,
  age: Schema.Number
})

// Sync decode (throws on error)
const person = Schema.decodeUnknownSync(Person)({ name: "Alice", age: 30 })

// Effect-based decode
const person = yield* Schema.decodeUnknown(Person)(input)

// Either result
const result = Schema.decodeUnknownEither(Person)(input)
```

### Encoding (Internal → External)

```typescript
const encoded = Schema.encodeSync(Person)(person)
const encoded = yield* Schema.encode(Person)(person)
```

## Struct Schemas

```typescript
const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String,
  createdAt: Schema.Date
})

// Optional fields
const UserWithOptional = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  nickname: Schema.optional(Schema.String)
})

// Optional with default
const UserWithDefault = Schema.Struct({
  id: Schema.Number,
  role: Schema.optional(Schema.String).pipe(
    Schema.withDefault(() => "user")
  )
})
```

## Array and Record

```typescript
// Array
const Numbers = Schema.Array(Schema.Number)
const Users = Schema.Array(User)

// Non-empty array
const NonEmptyStrings = Schema.NonEmptyArray(Schema.String)

// Record
const StringRecord = Schema.Record({
  key: Schema.String,
  value: Schema.Number
})
```

## Union and Discriminated Unions

```typescript
// Simple union
const StringOrNumber = Schema.Union(Schema.String, Schema.Number)

// Discriminated union (recommended)
const Shape = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal("Circle"),
    radius: Schema.Number
  }),
  Schema.Struct({
    _tag: Schema.Literal("Rectangle"),
    width: Schema.Number,
    height: Schema.Number
  })
)
```

## Transformations

### Schema.transform

```typescript
// String ↔ Number
const NumberFromString = Schema.transform(
  Schema.String,
  Schema.Number,
  {
    decode: (s) => parseFloat(s),
    encode: (n) => String(n)
  }
)

// Usage: "42" decodes to 42, 42 encodes to "42"
```

### Built-in Transformations

```typescript
// String to Number
const num = Schema.NumberFromString

// String to Date
const date = Schema.DateFromString

// Parse JSON string
const jsonData = Schema.parseJson(Schema.Struct({
  name: Schema.String
}))
```

## Filters (Validation)

```typescript
// String constraints
const Email = Schema.String.pipe(
  Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/),
  Schema.annotations({ identifier: "Email" })
)

const Username = Schema.String.pipe(
  Schema.minLength(3),
  Schema.maxLength(20),
  Schema.pattern(/^[a-z0-9_]+$/)
)

// Number constraints
const Age = Schema.Number.pipe(
  Schema.int(),
  Schema.between(0, 150)
)

const PositiveNumber = Schema.Number.pipe(
  Schema.positive()
)

// Custom filter
const EvenNumber = Schema.Number.pipe(
  Schema.filter((n) => n % 2 === 0, {
    message: () => "Expected even number"
  })
)
```

## Branded Types

```typescript
const UserId = Schema.String.pipe(
  Schema.brand("UserId")
)
type UserId = Schema.Schema.Type<typeof UserId>
// type UserId = string & Brand<"UserId">

const OrderId = Schema.Number.pipe(
  Schema.int(),
  Schema.positive(),
  Schema.brand("OrderId")
)
```

## Class-Based Schemas

```typescript
class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String
}) {
  get displayName() {
    return `${this.name} (${this.email})`
  }
}

// Decode creates Person instance
const person = Schema.decodeUnknownSync(Person)({
  id: 1,
  name: "Alice",
  email: "alice@example.com"
})
console.log(person.displayName) // "Alice (alice@example.com)"
```

## Tagged Errors with Schema

```typescript
class UserNotFound extends Schema.TaggedError<UserNotFound>()(
  "UserNotFound",
  { userId: Schema.String }
) {}

class ValidationError extends Schema.TaggedError<ValidationError>()(
  "ValidationError",
  { errors: Schema.Array(Schema.String) }
) {}
```

## Annotations

```typescript
const User = Schema.Struct({
  id: Schema.Number.pipe(
    Schema.annotations({
      identifier: "UserId",
      title: "User ID",
      description: "Unique user identifier",
      examples: [1, 2, 3]
    })
  ),
  email: Schema.String.pipe(
    Schema.annotations({
      identifier: "Email",
      description: "User email address"
    })
  )
})
```

## Error Messages

### Custom Messages

```typescript
const Password = Schema.String.pipe(
  Schema.minLength(8, {
    message: () => "Password must be at least 8 characters"
  }),
  Schema.pattern(/[A-Z]/, {
    message: () => "Password must contain uppercase letter"
  }),
  Schema.pattern(/[0-9]/, {
    message: () => "Password must contain a number"
  })
)
```

### Formatting Errors

```typescript
import { TreeFormatter, ArrayFormatter } from "effect/ParseResult"

const result = Schema.decodeUnknownEither(User)(input)
if (Either.isLeft(result)) {
  // Tree format
  console.log(TreeFormatter.formatErrorSync(result.left))

  // Array format
  console.log(ArrayFormatter.formatErrorSync(result.left))
}
```

## JSON Schema Export

```typescript
import { JSONSchema } from "effect"

const jsonSchema = JSONSchema.make(User)
// Produces JSON Schema compatible output
```

## Common Patterns

### API Response Validation

```typescript
const ApiResponse = <A>(dataSchema: Schema.Schema<A>) =>
  Schema.Struct({
    success: Schema.Boolean,
    data: dataSchema,
    timestamp: Schema.DateFromString
  })

const UserResponse = ApiResponse(User)
```

### Form Validation

```typescript
const RegistrationForm = Schema.Struct({
  username: Schema.String.pipe(
    Schema.minLength(3),
    Schema.maxLength(20)
  ),
  email: Schema.String.pipe(Schema.pattern(emailRegex)),
  password: Schema.String.pipe(Schema.minLength(8)),
  confirmPassword: Schema.String
}).pipe(
  Schema.filter((form) =>
    form.password === form.confirmPassword
      ? undefined
      : "Passwords must match"
  )
)
```

### Recursive Schemas

```typescript
interface Category {
  name: string
  subcategories: readonly Category[]
}

const Category: Schema.Schema<Category> = Schema.Struct({
  name: Schema.String,
  subcategories: Schema.Array(Schema.suspend(() => Category))
})
```

## Best Practices

1. **Use Schema.Class for domain objects** - Get methods and instanceof
2. **Brand IDs and sensitive types** - Prevent mixing up IDs
3. **Annotate for documentation** - Descriptions flow to JSON Schema
4. **Custom error messages** - User-friendly validation errors
5. **Transform at boundaries** - Parse external data early

## Additional Resources

For comprehensive Schema documentation, consult `${CLAUDE_PLUGIN_ROOT}/references/llms-full.txt`.

Search for these sections:
- "Introduction to Effect Schema" for overview
- "Basic Usage" for getting started
- "Transformations" for bidirectional transforms
- "Filters" for validation rules
- "Class APIs" for class-based schemas
- "Error Formatters" for error handling
