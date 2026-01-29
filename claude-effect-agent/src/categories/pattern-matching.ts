import type { Category } from "./types.js";

export const patternMatching: Category = {
  id: "pattern-matching",
  name: "Pattern Matching",
  patterns: [
    {
      rule: "Match.value for value-based matching",
      examples: [
        {
          description: "Role-based access control",
          bad: `if (user.role === "admin") {
  return "full access"
} else if (user.role === "user") {
  return "limited access"
} else {
  return "no access"
}`,
          good: `const getAccess = (user: User) =>
  Match.value(user.role).pipe(
    Match.when("admin", () => "full access"),
    Match.when("user", () => "limited access"),
    Match.orElse(() => "no access")
  )`,
        },
        {
          description: "Numeric range matching",
          bad: `if (score >= 90) {
  return "A"
} else if (score >= 80) {
  return "B"
} else {
  return "F"
}`,
          good: `const getGrade = (score: number) =>
  Match.value(score).pipe(
    Match.when((s) => s >= 90, () => "A"),
    Match.when((s) => s >= 80, () => "B"),
    Match.orElse(() => "F")
  )`,
        },
        {
          description: "Object property matching",
          bad: `if (order.total > 1000 && order.isPremium) {
  return 0.25
} else if (order.total > 1000) {
  return 0.15
} else {
  return 0
}`,
          good: `const calculateDiscount = (order: Order) =>
  Match.value(order).pipe(
    Match.when({ total: (t) => t > 1000, isPremium: true }, () => 0.25),
    Match.when({ total: (t) => t > 1000 }, () => 0.15),
    Match.orElse(() => 0)
  )`,
        },
      ],
    },
    {
      rule: "Match.type + Match.tag for discriminated unions",
      examples: [
        {
          description: "Event handling",
          bad: `switch (event.type) {
  case "UserCreated":
    return notifyAdmin(event.userId)
  case "UserDeleted":
    return cleanupData(event.userId)
  default:
    throw new Error("Unknown event")
}`,
          good: `const handleEvent = Match.type<AppEvent>().pipe(
  Match.tag("UserCreated", (e) => notifyAdmin(e.userId)),
  Match.tag("UserDeleted", (e) => cleanupData(e.userId)),
  Match.exhaustive
)`,
        },
        {
          description: "Error to HTTP status mapping",
          bad: `function toHttpStatus(error: AppError): number {
  if (error._tag === "NotFound") return 404
  if (error._tag === "Unauthorized") return 401
  if (error._tag === "ValidationError") return 400
  return 500
}`,
          good: `const toHttpStatus = Match.type<AppError>().pipe(
  Match.tag("NotFound", () => 404),
  Match.tag("Unauthorized", () => 401),
  Match.tag("ValidationError", () => 400),
  Match.tag("InternalError", () => 500),
  Match.exhaustive
)`,
        },
        {
          description: "Order status display",
          bad: `function getStatusMessage(order: Order): string {
  switch (order._tag) {
    case "Pending": return "Awaiting shipment"
    case "Shipped": return \`Tracking: \${order.trackingNumber}\`
    case "Delivered": return \`Delivered \${order.deliveredAt}\`
  }
}`,
          good: `const getOrderStatus = (order: Order) =>
  Match.value(order).pipe(
    Match.when(Schema.is(Pending), () => "Awaiting shipment"),
    Match.when(Schema.is(Shipped), (o) => \`Tracking: \${o.trackingNumber}\`),
    Match.when(Schema.is(Delivered), (o) => \`Delivered \${o.deliveredAt}\`),
    Match.exhaustive
  )`,
        },
      ],
    },
    {
      rule: "Schema.is() for type guards (not ._tag access)",
      examples: [
        {
          description: "Type narrowing in conditionals",
          bad: `if (event._tag === "UserCreated") {
  notifyAdmin(event.userId)
}

const isCreated = event._tag === "UserCreated"`,
          good: `if (Schema.is(UserCreated)(event)) {
  // event is narrowed to UserCreated
  notifyAdmin(event.userId)
}

const isCreated = Schema.is(UserCreated)(event)`,
        },
        {
          description: "Array predicates with Schema.is()",
          bad: `const hasConflict = conflicts.some((c) => c._tag === "MergeConflict")
const mergeConflicts = conflicts.filter((c) => c._tag === "MergeConflict")
const countMerge = conflicts.filter((c) => c._tag === "MergeConflict").length`,
          good: `const hasConflict = conflicts.some(Schema.is(MergeConflict))
const mergeConflicts = conflicts.filter(Schema.is(MergeConflict))
const countMerge = conflicts.filter(Schema.is(MergeConflict)).length`,
        },
        {
          description: "Finding and partitioning by type",
          bad: `const firstPending = orders.find((o) => o._tag === "Pending")
const pending = orders.filter((o) => o._tag === "Pending")
const notPending = orders.filter((o) => o._tag !== "Pending")`,
          good: `const firstPending = Array.findFirst(orders, Schema.is(Pending))
const [notPending, pending] = Array.partition(orders, Schema.is(Pending))`,
        },
        {
          description: "Never extract ._tag as a type",
          bad: `type ConflictTag = Conflict["_tag"]
type EventType = AppEvent["_tag"]

// Using extracted tag
function handleByTag(tag: EventType) { ... }`,
          good: `// Don't extract _tag - use the union directly with Match or Schema.is

// For type narrowing, use Schema.is
const isUserCreated = Schema.is(UserCreated)

// For exhaustive handling, use Match
const handleAll = Match.type<AppEvent>().pipe(
  Match.tag("UserCreated", handleUserCreated),
  Match.tag("UserDeleted", handleUserDeleted),
  Match.exhaustive
)`,
        },
      ],
    },
    {
      rule: "Option.match for nullable/optional values",
      examples: [
        {
          description: "Null check for display",
          bad: `if (user != null) {
  return user.name
} else {
  return "Guest"
}

// Or with nullish coalescing
const name = user?.name ?? "Guest"`,
          good: `const displayName = Option.match(maybeUser, {
  onNone: () => "Guest",
  onSome: (user) => user.name
})`,
        },
        {
          description: "Optional with transformation",
          bad: `const email = user?.email?.toLowerCase() ?? "no-email"`,
          good: `const email = pipe(
  Option.fromNullable(user),
  Option.flatMap((u) => Option.fromNullable(u.email)),
  Option.map((e) => e.toLowerCase()),
  Option.getOrElse(() => "no-email")
)`,
        },
        {
          description: "Effectful handling of Option",
          bad: `if (maybeUser != null) {
  await sendEmail(maybeUser.email)
} else {
  console.log("No user to notify")
}`,
          good: `Option.match(maybeUser, {
  onNone: () => Effect.log("No user to notify"),
  onSome: (user) => sendEmail(user.email)
})`,
        },
      ],
    },
    {
      rule: "Either.match for Result types",
      examples: [
        {
          description: "Parse result handling",
          bad: `const result = parseUser(input)
if (result.success) {
  process(result.data)
} else {
  handleError(result.error)
}`,
          good: `pipe(
  Schema.decodeEither(User)(input),
  Either.match({
    onLeft: (error) => handleError(error),
    onRight: (user) => process(user)
  })
)`,
        },
        {
          description: "Validation result",
          bad: `try {
  const validated = validate(data)
  return { success: true, data: validated }
} catch (e) {
  return { success: false, error: e }
}`,
          good: `const result = Schema.decodeEither(ValidationSchema)(data)

Either.match(result, {
  onLeft: (error) => Effect.fail(new ValidationError({ cause: error })),
  onRight: (validated) => Effect.succeed(validated)
})`,
        },
      ],
    },
    {
      rule: "Effect.match for Effect results",
      examples: [
        {
          description: "Handling Effect success/failure",
          bad: `try {
  const user = await Effect.runPromise(getUser(id))
  return { status: "success", user }
} catch (error) {
  return { status: "error", message: error.message }
}`,
          good: `Effect.match(getUser(id), {
  onFailure: (error) => ({ status: "error", message: error.message }),
  onSuccess: (user) => ({ status: "success", user })
})`,
        },
        {
          description: "Converting Effect to response",
          bad: `const handleRequest = async (id: string) => {
  try {
    const data = await Effect.runPromise(fetchData(id))
    return new Response(JSON.stringify(data), { status: 200 })
  } catch (e) {
    return new Response("Error", { status: 500 })
  }
}`,
          good: `const handleRequest = (id: string) =>
  fetchData(id).pipe(
    Effect.match({
      onFailure: () => new Response("Error", { status: 500 }),
      onSuccess: (data) => new Response(JSON.stringify(data), { status: 200 })
    })
  )`,
        },
      ],
    },
    {
      rule: "Array.match for empty/non-empty handling",
      examples: [
        {
          description: "Empty array display",
          bad: `if (items.length === 0) {
  return "No items"
} else {
  return \`\${items.length} items\`
}`,
          good: `const message = Array.match(items, {
  onEmpty: () => "No items",
  onNonEmpty: (items) => \`\${items.length} items\`
})`,
        },
        {
          description: "First element or default",
          bad: `const first = items.length > 0 ? items[0] : defaultItem`,
          good: `const first = Array.match(items, {
  onEmpty: () => defaultItem,
  onNonEmpty: (arr) => Array.headNonEmpty(arr)
})`,
        },
      ],
    },
  ],
};
