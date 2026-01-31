# rule-001: context-tag-dependencies

**Category:** services
**Rule ID:** rule-001

## Rule

Never call external dependencies directly; always wrap them in a Context.Tag service

## Description

External dependencies (APIs, filesystem, databases, third-party SDKs) should be wrapped in Context.Tag services to enable:
- **Testability**: Swap real implementations with test doubles
- **Dependency injection**: Compose services using Effect's Layer system
- **Error boundaries**: Handle failures in a typed, predictable way
- **Mockability**: Property-based testing with Arbitrary

## Examples

This rule covers four categories of external dependencies:

### 1. HTTP APIs

Direct `fetch()` calls are untestable. Wrap in a service:

```typescript
// Bad: Direct fetch call
const getUser = (id: string) =>
  Effect.tryPromise(() =>
    fetch(`https://api.example.com/users/${id}`).then(r => r.json())
  );

// Good: Context.Tag service
class UserApi extends Context.Tag("UserApi")<UserApi, {
  readonly getUser: (id: UserId) => Effect.Effect<User, ApiError>;
}>() {}
```

### 2. Filesystem Operations

Direct `fs` calls prevent in-memory testing:

```typescript
// Bad: Direct fs access
const readConfig = () =>
  Effect.tryPromise(() => fs.readFile("config.json", "utf-8"));

// Good: Context.Tag service
class FileSystem extends Context.Tag("FileSystem")<FileSystem, {
  readonly readFile: (path: string) => Effect.Effect<string, FileError>;
  readonly writeFile: (path: string, content: string) => Effect.Effect<void, FileError>;
}>() {}
```

### 3. Database/Repository Operations

Direct database access couples business logic to persistence:

```typescript
// Bad: Direct database call
const findUser = (id: string) =>
  Effect.tryPromise(() => db.query("SELECT * FROM users WHERE id = ?", [id]));

// Good: Context.Tag repository
class UserRepository extends Context.Tag("UserRepository")<UserRepository, {
  readonly findById: (id: UserId) => Effect.Effect<User, UserNotFound>;
  readonly save: (user: User) => Effect.Effect<void, DatabaseError>;
}>() {}
```

### 4. Third-Party SDKs

Direct SDK calls (Stripe, AWS, SendGrid) prevent testing:

```typescript
// Bad: Direct SDK call
const processPayment = (amount: number) =>
  Effect.tryPromise(() => stripe.charges.create({ amount, currency: "usd" }));

// Good: Context.Tag service
class PaymentGateway extends Context.Tag("PaymentGateway")<PaymentGateway, {
  readonly charge: (amount: number, currency: string) => Effect.Effect<ChargeResult, PaymentError>;
}>() {}
```

## Implementation Pattern

Every service should have:

1. **Service interface** - Define operations as typed Effect functions
2. **Live layer** - Real implementation for production
3. **Test layer** - In-memory/mock implementation for tests

## Good Pattern

See `rule-001.ts` for complete implementation examples of all four dependency types.

## Detection

This rule can be detected by the `rule-001.detector.ts` file.
