import type { Category } from "./types.js";

export const errors: Category = {
  id: "errors",
  name: "Error Handling",
  patterns: [
    {
      rule: "throw statements → Effect.fail()",
      examples: [
        {
          description: "Throwing domain error",
          bad: `function getUser(id: string): User {
  const user = db.find(id)
  if (!user) {
    throw new Error("User not found")
  }
  return user
}`,
          good: `const getUser = (id: string): Effect.Effect<User, UserNotFound> =>
  Effect.gen(function* () {
    const user = yield* findInDb(id)
    if (!user) {
      return yield* Effect.fail(new UserNotFound({ userId: id }))
    }
    return user
  })`,
        },
        {
          description: "Validation error",
          bad: `function validateEmail(email: string): string {
  if (!email.includes("@")) {
    throw new Error("Invalid email")
  }
  return email
}`,
          good: `class InvalidEmail extends Schema.TaggedError<InvalidEmail>()("InvalidEmail", {
  email: Schema.String,
}) {}

const validateEmail = (email: string): Effect.Effect<string, InvalidEmail> =>
  email.includes("@")
    ? Effect.succeed(email)
    : Effect.fail(new InvalidEmail({ email }))`,
        },
      ],
    },
    {
      rule: "try/catch blocks → Effect.try() or Effect.tryPromise()",
      examples: [
        {
          description: "Wrapping sync operation",
          bad: `function parseConfig(json: string): Config {
  try {
    return JSON.parse(json)
  } catch (e) {
    throw new Error("Invalid config")
  }
}`,
          good: `const parseConfig = (json: string) =>
  Effect.try({
    try: () => JSON.parse(json) as Config,
    catch: (e) => new ConfigParseError({ cause: e })
  })`,
        },
        {
          description: "Wrapping async operation",
          bad: `async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(\`/users/\${id}\`)
    return await response.json()
  } catch (e) {
    throw new Error("Failed to fetch user")
  }
}`,
          good: `const fetchUser = (id: string) =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(\`/users/\${id}\`)
      return response.json() as Promise<User>
    },
    catch: (e) => new FetchUserError({ userId: id, cause: e })
  })`,
        },
        {
          description: "Multiple try/catch",
          bad: `async function processOrder(data: string) {
  let order
  try {
    order = JSON.parse(data)
  } catch (e) {
    throw new Error("Invalid order JSON")
  }

  try {
    await saveOrder(order)
  } catch (e) {
    throw new Error("Failed to save order")
  }
}`,
          good: `const processOrder = (data: string) =>
  Effect.gen(function* () {
    const order = yield* Effect.try({
      try: () => JSON.parse(data) as Order,
      catch: () => new InvalidOrderJson({ data })
    })

    yield* Effect.tryPromise({
      try: () => saveOrder(order),
      catch: (e) => new SaveOrderError({ orderId: order.id, cause: e })
    })
  })`,
        },
      ],
    },
    {
      rule: "Untyped errors → Schema.TaggedError",
      examples: [
        {
          description: "Plain Error class",
          bad: `class UserNotFoundError extends Error {
  constructor(public userId: string) {
    super(\`User \${userId} not found\`)
    this.name = "UserNotFoundError"
  }
}`,
          good: `class UserNotFound extends Schema.TaggedError<UserNotFound>()("UserNotFound", {
  userId: Schema.String,
}) {}`,
        },
        {
          description: "Multiple error types",
          bad: `class ValidationError extends Error {
  constructor(public field: string, public message: string) {
    super(message)
  }
}

class NotFoundError extends Error {
  constructor(public resource: string, public id: string) {
    super(\`\${resource} \${id} not found\`)
  }
}`,
          good: `class ValidationError extends Schema.TaggedError<ValidationError>()("ValidationError", {
  field: Schema.String,
  message: Schema.String,
}) {}

class NotFoundError extends Schema.TaggedError<NotFoundError>()("NotFoundError", {
  resource: Schema.String,
  id: Schema.String,
}) {}

// Now you can use catchTag for specific handling
const program = getUser(id).pipe(
  Effect.catchTag("NotFoundError", (e) =>
    Effect.succeed(defaultUser)
  ),
  Effect.catchTag("ValidationError", (e) =>
    Effect.fail(new BadRequest({ message: e.message }))
  )
)`,
        },
        {
          description: "Error with complex payload",
          bad: `class ApiError extends Error {
  constructor(
    public statusCode: number,
    public body: unknown,
    public headers: Record<string, string>
  ) {
    super(\`API error: \${statusCode}\`)
  }
}`,
          good: `class ApiError extends Schema.TaggedError<ApiError>()("ApiError", {
  statusCode: Schema.Number,
  body: Schema.Unknown,
  headers: Schema.Record({ key: Schema.String, value: Schema.String }),
}) {
  get isClientError() {
    return this.statusCode >= 400 && this.statusCode < 500
  }
  get isServerError() {
    return this.statusCode >= 500
  }
}`,
        },
      ],
    },
  ],
};
