# rule-015: schema-class-over-struct

**Category:** schema
**Rule ID:** rule-015

## Rule

Always use Schema.Class for named/exported schemas. Schema.Struct is only acceptable for inline anonymous schemas.

## Description

`Schema.Class` provides significant advantages over `Schema.Struct`:

1. **`new` constructor** - `new Person({ id: 1, name: "John" })`
2. **`make` factory function** - `Person.make({ id: 1, name: "John" })`
3. **Custom methods and getters** - Can add instance methods
4. **Inheritance via `.extend()`** - Proper class hierarchy
5. **Proper class identity** - `instanceof` checks work

`Schema.Struct` should only be used for truly anonymous, inline schemas that are not assigned to a variable or exported.

## Bad Patterns

### Named Schema.Struct assigned to variable
```typescript
// Bad: Named struct should be a class
const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

// Bad: Exported struct should be a class
export const Order = Schema.Struct({
  orderId: Schema.String,
  items: Schema.Array(Schema.String),
});
```

### Schema.Struct in type alias
```typescript
// Bad: Type alias with struct should be a class
type User = Schema.Schema.Type<typeof UserSchema>;
const UserSchema = Schema.Struct({ id: Schema.Number });
```

## Good Patterns

### Schema.Class for named schemas
```typescript
// Good: Schema.Class with constructor and optional methods
class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  name: Schema.String,
}) {
  get displayName() {
    return `User #${this.id}: ${this.name}`;
  }
}

const user = new User({ id: 1, name: "Alice" });
```

### Inline Schema.Struct (acceptable)
```typescript
// Good: Anonymous inline struct in API definition
const getUsers = HttpApiEndpoint
  .get("getUsers", "/users")
  .setHeaders(Schema.Struct({
    "X-API-Key": Schema.String,
  }))
  .addSuccess(Schema.Array(User));

// Good: Inline struct in pipe transformation
const transformed = Schema.transform(
  Schema.String,
  Schema.Struct({ value: Schema.String }),
  { decode: (s) => ({ value: s }), encode: (o) => o.value }
);
```

## Detection

This rule can be detected by the `rule-015.detector.ts` file. It detects:
- `Schema.Struct` calls assigned to const/let/var declarations
- `Schema.Struct` calls that are exported
- Variables with "Schema" or "Struct" suffix that use `Schema.Struct`
