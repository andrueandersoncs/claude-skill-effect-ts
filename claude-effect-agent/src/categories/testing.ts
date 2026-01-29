import type { Category } from "./types.js";

export const testing: Category = {
  id: "testing",
  name: "Testing Anti-Patterns",
  patterns: [
    {
      rule: "Effect.runPromise in tests → it.effect from @effect/vitest",
      examples: [
        {
          description: "Basic Effect test",
          bad: `import { it, expect } from "vitest"

it("should get user", async () => {
  const result = await Effect.runPromise(getUser("123"))
  expect(result.name).toBe("Alice")
})`,
          good: `import { it, expect } from "@effect/vitest"

it.effect("should get user", () =>
  Effect.gen(function* () {
    const result = yield* getUser("123")
    expect(result.name).toBe("Alice")
  })
)`,
        },
        {
          description: "Test with service dependencies",
          bad: `it("should process order", async () => {
  const result = await Effect.runPromise(
    processOrder(order).pipe(
      Effect.provide(TestLayer)
    )
  )
  expect(result.status).toBe("completed")
})`,
          good: `it.effect("should process order", () =>
  Effect.gen(function* () {
    const result = yield* processOrder(order)
    expect(result.status).toBe("completed")
  }).pipe(Effect.provide(TestLayer))
)

// Or use it.layer for multiple tests
describe("OrderService", () => {
  it.layer(TestLayer)("should process order", () =>
    Effect.gen(function* () {
      const result = yield* processOrder(order)
      expect(result.status).toBe("completed")
    })
  )
})`,
        },
      ],
    },
    {
      rule: 'import { it } from "vitest" → import { it } from "@effect/vitest"',
      examples: [
        {
          description: "Test file imports",
          bad: `import { describe, it, expect } from "vitest"
import { Effect } from "effect"

describe("UserService", () => {
  it("should create user", async () => {
    const result = await Effect.runPromise(createUser(data))
    expect(result).toBeDefined()
  })
})`,
          good: `import { describe, it, expect } from "@effect/vitest"
import { Effect } from "effect"

describe("UserService", () => {
  it.effect("should create user", () =>
    Effect.gen(function* () {
      const result = yield* createUser(data)
      expect(result).toBeDefined()
    })
  )
})`,
        },
      ],
    },
    {
      rule: "Hard-coded test data → Arbitrary.make(Schema)",
      examples: [
        {
          description: "User test data",
          bad: `const testUser = {
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
  age: 25,
}

it("should validate user", () => {
  expect(validateUser(testUser)).toBe(true)
})`,
          good: `import { Arbitrary } from "effect"
import * as fc from "fast-check"

const UserArbitrary = Arbitrary.make(User)

it.prop("should validate all generated users", [UserArbitrary], ([user]) => {
  expect(validateUser(user)).toBe(true)
})`,
        },
        {
          description: "Multiple test inputs",
          bad: `const testOrders = [
  { id: "order-1", total: 100, items: ["a", "b"] },
  { id: "order-2", total: 200, items: ["c"] },
  { id: "order-3", total: 50, items: [] },
]

testOrders.forEach((order) => {
  it(\`should process order \${order.id}\`, async () => {
    const result = await processOrder(order)
    expect(result).toBeDefined()
  })
})`,
          good: `it.prop(
  "should process all valid orders",
  { order: Arbitrary.make(Order) },
  ({ order }) =>
    Effect.gen(function* () {
      const result = yield* processOrder(order)
      expect(result).toBeDefined()
    })
)`,
        },
      ],
    },
    {
      rule: "fast-check .filter() → Schema constraints (Schema.between, Schema.minLength)",
      examples: [
        {
          description: "Filtering numeric range",
          bad: `const adultAge = fc.integer().filter((n) => n >= 18 && n <= 100)

it.prop("processes adult ages", [adultAge], ([age]) => {
  expect(isValidAdultAge(age)).toBe(true)
})`,
          good: `const Age = Schema.Number.pipe(
  Schema.int(),
  Schema.between(18, 100)
)

const AgeArbitrary = Arbitrary.make(Age)

it.prop("processes adult ages", [AgeArbitrary], ([age]) => {
  expect(isValidAdultAge(age)).toBe(true)
})`,
        },
        {
          description: "Filtering string length",
          bad: `const nonEmptyString = fc.string().filter((s) => s.length > 0)
const shortString = fc.string().filter((s) => s.length <= 100)`,
          good: `const NonEmptyName = Schema.String.pipe(Schema.minLength(1))
const ShortDescription = Schema.String.pipe(Schema.maxLength(100))

// Arbitraries generate ONLY valid values
const NameArbitrary = Arbitrary.make(NonEmptyName)
const DescArbitrary = Arbitrary.make(ShortDescription)`,
        },
        {
          description: "Complex Schema constraints",
          bad: `const validUser = fc.record({
  id: fc.string(),
  name: fc.string(),
  age: fc.integer(),
  email: fc.string(),
}).filter((u) =>
  u.name.length > 0 &&
  u.age >= 18 &&
  u.email.includes("@")
)`,
          good: `class User extends Schema.Class<User>("User")({
  id: Schema.String.pipe(Schema.minLength(1)),
  name: Schema.String.pipe(Schema.nonEmptyString()),
  age: Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(18)),
  email: Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+\\.[^@]+$/)),
}) {}

// Arbitrary generates only valid users - no filtering needed
const UserArbitrary = Arbitrary.make(User)`,
        },
      ],
    },
    {
      rule: "Manual property tests → it.prop with Arbitrary.make(Schema)",
      examples: [
        {
          description: "Round-trip testing",
          bad: `it("should encode and decode user", () => {
  const users = [
    { id: "1", name: "Alice", age: 30 },
    { id: "2", name: "Bob", age: 25 },
  ]

  users.forEach((user) => {
    const encoded = Schema.encodeSync(User)(user)
    const decoded = Schema.decodeSync(User)(encoded)
    expect(decoded).toEqual(user)
  })
})`,
          good: `it.prop(
  "should encode and decode any user",
  { user: Arbitrary.make(User) },
  ({ user }) => {
    const encoded = Schema.encodeSync(User)(user)
    const decoded = Schema.decodeUnknownSync(User)(encoded)
    expect(decoded).toEqual(user)
  }
)`,
        },
        {
          description: "Property test with Effect",
          bad: `it("should process orders correctly", async () => {
  const orders = generateTestOrders(100)

  for (const order of orders) {
    const result = await Effect.runPromise(processOrder(order))
    expect(result.status).toBe("completed")
  }
})`,
          good: `it.effect.prop(
  "should process any valid order",
  [Arbitrary.make(Order)],
  ([order]) =>
    Effect.gen(function* () {
      const result = yield* processOrder(order)
      expect(result.status).toBe("completed")
    })
)`,
        },
      ],
    },
  ],
};
