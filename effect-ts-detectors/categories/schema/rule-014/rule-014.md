# rule-014: schema-field-composition

**Category:** schema
**Rule ID:** rule-014

## Rule

Never duplicate Schema fields across multiple definitions; use `.fields` spread, `.extend()`, `.pick()`, `.omit()`, or TaggedClass

## Description

When multiple Schema.Struct or Schema.Class definitions share the same fields, extract common fields to a base definition and use composition. This reduces duplication, improves maintainability, and enables better pattern matching with discriminated unions.

## Bad Patterns

### Duplicated Schema.Struct fields

```typescript
// ❌ Bad: Same fields repeated in multiple structs
const UserBase = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String,
});

const UserWithRole = Schema.Struct({
  id: Schema.Number,        // duplicated
  name: Schema.String,      // duplicated
  email: Schema.String,     // duplicated
  role: Schema.String,
});

const UserWithAge = Schema.Struct({
  id: Schema.Number,        // duplicated
  name: Schema.String,      // duplicated
  email: Schema.String,     // duplicated
  age: Schema.Number,
});
```

### Duplicated Schema.Class fields

```typescript
// ❌ Bad: Same fields repeated in multiple classes
class Person extends Schema.Class<Person>("Person")({
  name: Schema.String,
  email: Schema.String,
}) {}

class Employee extends Schema.Class<Employee>("Employee")({
  name: Schema.String,      // duplicated
  email: Schema.String,     // duplicated
  department: Schema.String,
}) {}
```

## Good Patterns

### Using `.fields` spread for Schema.Struct

```typescript
// ✅ Good: Define base struct, spread fields
const UserBase = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String,
});

const UserWithRole = Schema.Struct({
  ...UserBase.fields,
  role: Schema.String,
});

const UserWithAge = Schema.Struct({
  ...UserBase.fields,
  age: Schema.Number,
});
```

### Using `.extend()` for Schema.Class

```typescript
// ✅ Good: Use class extension
class Person extends Schema.Class<Person>("Person")({
  name: Schema.String,
  email: Schema.String,
}) {}

class Employee extends Person.extend<Employee>("Employee")({
  department: Schema.String,
}) {}
```

### Using `.pick()` and `.omit()`

```typescript
// ✅ Good: Use pick/omit for field selection
const FullUser = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  email: Schema.String,
  password: Schema.String,
});

const PublicUser = FullUser.omit("password");
const UserCredentials = FullUser.pick("email", "password");
```

### Using TaggedClass for discriminated unions

```typescript
// ✅ Good: Shared fields with TaggedClass for discrimination
const baseFields = {
  id: Schema.Number,
  name: Schema.String,
};

class Admin extends Schema.TaggedClass<Admin>()("Admin", {
  ...baseFields,
  permissions: Schema.Array(Schema.String),
}) {}

class Guest extends Schema.TaggedClass<Guest>()("Guest", {
  ...baseFields,
  expiresAt: Schema.Date,
}) {}

const User = Schema.Union(Admin, Guest);

// Pattern match on _tag
const describe = Match.type<typeof User.Type>().pipe(
  Match.tag("Admin", (u) => `Admin ${u.name} with ${u.permissions.length} permissions`),
  Match.tag("Guest", (u) => `Guest ${u.name} expires ${u.expiresAt}`),
  Match.exhaustive
);
```

## Detection

This rule can be detected by the `rule-014.detector.ts` file.
