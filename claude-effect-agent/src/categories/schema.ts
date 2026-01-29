import type { Category } from "./types.js";

export const schema: Category = {
  id: "schema",
  name: "Schema Anti-Patterns",
  patterns: [
    {
      rule: "Plain TypeScript interfaces → Schema.Class or Schema.Struct",
      examples: [
        {
          description: "Domain entity definition",
          bad: `interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}`,
          good: `class User extends Schema.Class<User>("User")({
  id: Schema.String.pipe(Schema.brand("UserId")),
  email: Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+\\.[^@]+$/)),
  name: Schema.String.pipe(Schema.nonEmptyString()),
  createdAt: Schema.Date,
}) {
  get emailDomain() {
    return this.email.split("@")[1]
  }
}`,
        },
        {
          description: "Simple data structure",
          bad: `type Point = { x: number; y: number }`,
          good: `const Point = Schema.Struct({
  x: Schema.Number,
  y: Schema.Number,
})
type Point = Schema.Schema.Type<typeof Point>`,
        },
      ],
    },
    {
      rule: "Schema.Struct for domain entities → Schema.Class (with methods)",
      examples: [
        {
          description: "Entity needing methods",
          bad: `const User = Schema.Struct({
  id: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
})

// Helper function outside schema
const getFullName = (user: User) => \`\${user.firstName} \${user.lastName}\``,
          good: `class User extends Schema.Class<User>("User")({
  id: Schema.String,
  firstName: Schema.String,
  lastName: Schema.String,
}) {
  get fullName() {
    return \`\${this.firstName} \${this.lastName}\`
  }
}`,
        },
        {
          description: "Entity with computed properties",
          bad: `const Order = Schema.Struct({
  items: Schema.Array(OrderItem),
  discount: Schema.Number,
})

const getTotal = (order: Order) =>
  order.items.reduce((sum, i) => sum + i.price, 0) * (1 - order.discount)`,
          good: `class Order extends Schema.Class<Order>("Order")({
  items: Schema.Array(OrderItem),
  discount: Schema.Number,
}) {
  get subtotal() {
    return Array.reduce(this.items, 0, (sum, i) => sum + i.price)
  }
  get total() {
    return this.subtotal * (1 - this.discount)
  }
}`,
        },
      ],
    },
    {
      rule: "Optional properties for state → Tagged unions",
      examples: [
        {
          description: "Order status with optional fields",
          bad: `const Order = Schema.Struct({
  orderId: Schema.String,
  items: Schema.Array(Schema.String),
  trackingNumber: Schema.optional(Schema.String),
  shippedAt: Schema.optional(Schema.Date),
  deliveredAt: Schema.optional(Schema.Date),
})`,
          good: `class Pending extends Schema.TaggedClass<Pending>()("Pending", {
  orderId: Schema.String,
  items: Schema.Array(Schema.String),
}) {}

class Shipped extends Schema.TaggedClass<Shipped>()("Shipped", {
  orderId: Schema.String,
  items: Schema.Array(Schema.String),
  trackingNumber: Schema.String,
  shippedAt: Schema.Date,
}) {}

class Delivered extends Schema.TaggedClass<Delivered>()("Delivered", {
  orderId: Schema.String,
  items: Schema.Array(Schema.String),
  deliveredAt: Schema.Date,
}) {}

const Order = Schema.Union(Pending, Shipped, Delivered)
type Order = Schema.Schema.Type<typeof Order>`,
        },
        {
          description: "Authentication state",
          bad: `const AuthState = Schema.Struct({
  isAuthenticated: Schema.Boolean,
  user: Schema.optional(UserSchema),
  error: Schema.optional(Schema.String),
})`,
          good: `class Anonymous extends Schema.TaggedClass<Anonymous>()("Anonymous", {}) {}

class Authenticated extends Schema.TaggedClass<Authenticated>()("Authenticated", {
  user: UserSchema,
  token: Schema.String,
}) {}

class AuthError extends Schema.TaggedClass<AuthError>()("AuthError", {
  message: Schema.String,
}) {}

const AuthState = Schema.Union(Anonymous, Authenticated, AuthError)`,
        },
      ],
    },
    {
      rule: "Schema.Any/Schema.Unknown → Proper typed schemas",
      examples: [
        {
          description: "API response handling",
          bad: `const ApiResponse = Schema.Struct({
  status: Schema.Number,
  data: Schema.Any, // What's in here?
})`,
          good: `// Define specific response schemas
const UserResponse = Schema.Struct({
  status: Schema.Literal(200),
  data: User,
})

const ErrorResponse = Schema.Struct({
  status: Schema.Number.pipe(Schema.greaterThan(299)),
  error: Schema.String,
})

const ApiResponse = Schema.Union(UserResponse, ErrorResponse)`,
        },
        {
          description: "Exception cause field (legitimate use)",
          bad: `// Overusing Schema.Unknown
const Event = Schema.Struct({
  type: Schema.String,
  payload: Schema.Unknown, // Should be typed
})`,
          good: `// Schema.Unknown is OK for genuinely unconstrained data
class AppError extends Schema.TaggedError<AppError>()("AppError", {
  message: Schema.String,
  cause: Schema.Unknown, // Legitimate: captures arbitrary caught exceptions
}) {}

// But domain data should be typed
class UserCreated extends Schema.TaggedClass<UserCreated>()("UserCreated", {
  userId: Schema.String,
  email: Schema.String,
}) {}`,
        },
      ],
    },
    {
      rule: "JSON.parse() → Schema.parseJson()",
      examples: [
        {
          description: "Parsing JSON string",
          bad: `const data = JSON.parse(jsonString)
// data is 'any' - no validation`,
          good: `const parseUser = Schema.decodeUnknownSync(
  Schema.parseJson(User)
)
const user = parseUser(jsonString)
// user is fully typed and validated`,
        },
        {
          description: "Parsing with error handling",
          bad: `try {
  const data = JSON.parse(jsonString)
  processUser(data)
} catch (e) {
  console.error("Invalid JSON")
}`,
          good: `const parseUser = Schema.decodeUnknown(Schema.parseJson(User))

pipe(
  parseUser(jsonString),
  Effect.map(processUser),
  Effect.catchTag("ParseError", (e) =>
    Effect.logError("Invalid user JSON", e)
  )
)`,
        },
      ],
    },
  ],
};
