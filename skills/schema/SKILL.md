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

## Schema Best Practices

### 1. Tagged Unions Over Optional Properties

**AVOID optional properties. USE tagged unions instead.** This makes states explicit and enables exhaustive pattern matching.

```typescript
// ❌ BAD: Optional properties hide state complexity
const User = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.optional(Schema.String),
  verifiedAt: Schema.optional(Schema.Date),
  suspendedReason: Schema.optional(Schema.String)
})
// Unclear: Can a user be both verified AND suspended? What if email is missing?

// ✅ GOOD: Tagged union makes states explicit
const User = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal("Unverified"),
    id: Schema.String,
    name: Schema.String
  }),
  Schema.Struct({
    _tag: Schema.Literal("Active"),
    id: Schema.String,
    name: Schema.String,
    email: Schema.String,
    verifiedAt: Schema.Date
  }),
  Schema.Struct({
    _tag: Schema.Literal("Suspended"),
    id: Schema.String,
    name: Schema.String,
    email: Schema.String,
    suspendedReason: Schema.String
  })
)
// Clear: Each state has exactly the fields it needs
```

**Why tagged unions:**
- No impossible states (suspended user always has a reason)
- Exhaustive matching catches missing cases
- Self-documenting state machine
- Works perfectly with Match.tag

### 2. Class-Based Schemas Over Struct Schemas

**PREFER Schema.Class over Schema.Struct.** Classes give you methods, instanceof checks, and better ergonomics.

```typescript
// ❌ AVOID: Plain Struct (no methods, no instanceof)
const UserStruct = Schema.Struct({
  id: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  email: Schema.String
})
type User = Schema.Schema.Type<typeof UserStruct>

// ✅ PREFER: Class-based Schema
class User extends Schema.Class<User>("User")({
  id: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
  email: Schema.String
}) {
  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }

  get emailDomain() {
    return this.email.split("@")[1]
  }

  withEmail(email: string) {
    return new User({ ...this, email })
  }
}

// Usage:
const user = Schema.decodeUnknownSync(User)(data)
console.log(user.fullName)        // "John Doe"
console.log(user instanceof User) // true
```

**For tagged unions with classes:**

```typescript
class Unverified extends Schema.TaggedClass<Unverified>()("Unverified", {
  id: Schema.String,
  name: Schema.String
}) {}

class Active extends Schema.TaggedClass<Active>()("Active", {
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  verifiedAt: Schema.Date
}) {
  get isRecent() {
    return Date.now() - this.verifiedAt.getTime() < 86400000
  }
}

class Suspended extends Schema.TaggedClass<Suspended>()("Suspended", {
  id: Schema.String,
  name: Schema.String,
  suspendedReason: Schema.String
}) {}

const User = Schema.Union(Unverified, Active, Suspended)
type User = Schema.Schema.Type<typeof User>
```

### 3. Schema.is() with Match Patterns

**USE Schema.is() as type guards in Match.when patterns.** This combines Schema validation with Match's exhaustive checking.

```typescript
import { Schema, Match } from "effect"

// Define schemas
class Circle extends Schema.TaggedClass<Circle>()("Circle", {
  radius: Schema.Number
}) {
  get area() { return Math.PI * this.radius ** 2 }
}

class Rectangle extends Schema.TaggedClass<Rectangle>()("Rectangle", {
  width: Schema.Number,
  height: Schema.Number
}) {
  get area() { return this.width * this.height }
}

const Shape = Schema.Union(Circle, Rectangle)
type Shape = Schema.Schema.Type<typeof Shape>

// Use Schema.is() in Match patterns
const describeShape = (shape: Shape) =>
  Match.value(shape).pipe(
    Match.when(Schema.is(Circle), (c) => `Circle with radius ${c.radius}`),
    Match.when(Schema.is(Rectangle), (r) => `${r.width}x${r.height} rectangle`),
    Match.exhaustive
  )

// Schema.is() also works for runtime type checking
const processUnknown = (input: unknown) => {
  if (Schema.is(Circle)(input)) {
    console.log(`Circle area: ${input.area}`)
  }
}
```

**Schema.is() vs Match.tag:**

```typescript
// Match.tag - when you already know it's the union type
const handleUser = (user: User) =>
  Match.value(user).pipe(
    Match.tag("Active", (u) => sendEmail(u.email)),
    Match.tag("Suspended", (u) => logSuspension(u.suspendedReason)),
    Match.tag("Unverified", () => sendVerificationReminder()),
    Match.exhaustive
  )

// Schema.is() - when validating unknown data or need class features
const handleUnknown = (input: unknown) =>
  Match.value(input).pipe(
    Match.when(Schema.is(Active), (u) => u.isRecent),  // Can use class methods
    Match.when(Schema.is(Suspended), () => false),
    Match.orElse(() => false)
  )
```

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

## Best Practices Summary

### Do

1. **Use tagged unions over optional properties** - Make states explicit
2. **Use Schema.Class/TaggedClass over Struct** - Get methods and instanceof
3. **Use Schema.is() in Match patterns** - Combine validation with matching
4. **Brand IDs and sensitive types** - Prevent mixing up values
5. **Annotate for documentation** - Descriptions flow to JSON Schema
6. **Transform at boundaries** - Parse external data early

### Don't

1. **Don't use optional properties for state** - Use tagged unions instead
2. **Don't use plain Struct for domain entities** - Use Schema.Class
3. **Don't validate manually** - Use Schema.is() with Match
4. **Don't mix branded types** - Each ID type should be distinct

## Additional Resources

For comprehensive Schema documentation, consult `${CLAUDE_PLUGIN_ROOT}/references/llms-full.txt`.

Search for these sections:
- "Introduction to Effect Schema" for overview
- "Basic Usage" for getting started
- "Transformations" for bidirectional transforms
- "Filters" for validation rules
- "Class APIs" for class-based schemas
- "Error Formatters" for error handling
