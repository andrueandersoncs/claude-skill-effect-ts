---
name: create-schema
description: Generate Effect Schema definitions for data validation and transformation
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
argument-hint: "<SchemaName> [fields...] or from <file-path>"
---

# Create Effect Schema

Generate Effect Schema definitions for type-safe data validation.

## Modes

### Mode 1: From Field Definitions
```
/effect:create-schema User name:string email:string age:number
```

### Mode 2: From Existing TypeScript Interface
```
/effect:create-schema from src/types/user.ts
```

### Mode 3: Interactive (no arguments)
```
/effect:create-schema
```
Prompt for schema name and fields.

## Process

1. Parse arguments to determine mode
2. For field definitions:
   - Parse `name:type` pairs
   - Map to Schema types (string→Schema.String, number→Schema.Number, etc.)
   - Support modifiers: `field:type?` for optional, `field:type[]` for arrays
3. For existing interfaces:
   - Read the file
   - Parse TypeScript interfaces
   - Convert to equivalent Schema definitions
4. Generate schema file with:
   - Proper imports
   - Schema definition
   - Type extraction
   - Encode/decode helpers

## Type Mappings

| TypeScript | Schema |
|------------|--------|
| `string` | `Schema.String` |
| `number` | `Schema.Number` |
| `boolean` | `Schema.Boolean` |
| `Date` | `Schema.Date` |
| `string[]` | `Schema.Array(Schema.String)` |
| `T \| null` | `Schema.NullOr(T)` |
| `T?` | `Schema.optional(T)` |

## Schema Template

```typescript
import { Schema } from "effect"

// Schema definition
export const {SchemaName} = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String.pipe(
    Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/)
  ),
  age: Schema.Number.pipe(
    Schema.int(),
    Schema.positive()
  ),
  createdAt: Schema.Date
})

// Extract type
export type {SchemaName} = Schema.Schema.Type<typeof {SchemaName}>

// Helpers
export const decode{SchemaName} = Schema.decodeUnknown({SchemaName})
export const encode{SchemaName} = Schema.encode({SchemaName})
```

## Schema.Any and Schema.Unknown Policy

**NEVER generate schemas that use `Schema.Any` or `Schema.Unknown` as a shortcut.** These are only permitted when the value is genuinely unconstrained at the domain level:

- ✅ `cause: Schema.Unknown` on error types (caught exceptions are genuinely untyped)
- ✅ `value: Schema.Unknown` on a generic cache that truly holds arbitrary data
- ❌ `data: Schema.Unknown` for API response bodies - define the actual shape
- ❌ `settings: Schema.Any` for configuration - define the fields
- ❌ `payload: Schema.Unknown` when you know what the payload contains

If the user provides a field without a clear type, ask them to clarify the shape rather than defaulting to `Schema.Unknown`.

## Advanced Features

Add validation when field names suggest it:
- `email` → add email pattern
- `age` → add int() and between(0, 150)
- `url` → add URL pattern
- `id` → consider branding
- `password` → add minLength

## Output

After generating:
1. Show schema file location
2. Display the schema structure
3. Provide usage examples for decoding/encoding
