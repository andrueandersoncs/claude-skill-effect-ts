import type { Category } from "./types.js";

export const services: Category = {
  id: "services",
  name: "Service & Layer Patterns",
  patterns: [
    {
      rule: "Direct external API calls → Context.Tag service",
      examples: [
        {
          description: "HTTP API call",
          bad: `const getUser = (id: string) =>
  Effect.tryPromise(() =>
    fetch(\`https://api.example.com/users/\${id}\`).then((r) => r.json())
  )

// Used directly in business logic
const processUser = (id: string) =>
  Effect.gen(function* () {
    const user = yield* getUser(id) // Direct API call - untestable!
    return processData(user)
  })`,
          good: `// Define service interface
class UserApi extends Context.Tag("UserApi")<
  UserApi,
  {
    readonly getUser: (id: string) => Effect.Effect<User, ApiError>
    readonly updateUser: (user: User) => Effect.Effect<void, ApiError>
  }
>() {}

// Use service in business logic
const processUser = (id: string) =>
  Effect.gen(function* () {
    const api = yield* UserApi
    const user = yield* api.getUser(id)
    return processData(user)
  })

// Live implementation
const UserApiLive = Layer.succeed(UserApi, {
  getUser: (id) =>
    Effect.tryPromise({
      try: () => fetch(\`https://api.example.com/users/\${id}\`).then((r) => r.json()),
      catch: (e) => new ApiError({ cause: e })
    }),
  updateUser: (user) =>
    Effect.tryPromise({
      try: () => fetch(\`https://api.example.com/users/\${user.id}\`, {
        method: "PUT",
        body: JSON.stringify(user)
      }),
      catch: (e) => new ApiError({ cause: e })
    })
})

// Test implementation
const UserApiTest = Layer.succeed(UserApi, {
  getUser: (id) => Effect.succeed({ id, name: "Test User", email: "test@test.com" }),
  updateUser: () => Effect.void
})`,
        },
      ],
    },
    {
      rule: "Direct database access → Context.Tag repository",
      examples: [
        {
          description: "Database operations",
          bad: `import { db } from "./database"

const findUser = (id: string) =>
  Effect.tryPromise(() => db.query("SELECT * FROM users WHERE id = ?", [id]))

const saveUser = (user: User) =>
  Effect.tryPromise(() => db.query("INSERT INTO users VALUES (?)", [user]))`,
          good: `// Repository interface
class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  {
    readonly findById: (id: UserId) => Effect.Effect<User, UserNotFound>
    readonly findByEmail: (email: string) => Effect.Effect<User, UserNotFound>
    readonly save: (user: User) => Effect.Effect<void>
    readonly delete: (id: UserId) => Effect.Effect<void>
  }
>() {}

// Live implementation with real database
const UserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* Database
    return {
      findById: (id) =>
        Effect.tryPromise({
          try: () => db.query("SELECT * FROM users WHERE id = ?", [id]),
          catch: () => new UserNotFound({ userId: id })
        }),
      findByEmail: (email) =>
        Effect.tryPromise({
          try: () => db.query("SELECT * FROM users WHERE email = ?", [email]),
          catch: () => new UserNotFound({ userId: email })
        }),
      save: (user) =>
        Effect.tryPromise({
          try: () => db.query("INSERT INTO users VALUES (?)", [user]),
          catch: (e) => new DatabaseError({ cause: e })
        }),
      delete: (id) =>
        Effect.tryPromise({
          try: () => db.query("DELETE FROM users WHERE id = ?", [id]),
          catch: (e) => new DatabaseError({ cause: e })
        })
    }
  })
)

// Test implementation with in-memory store
const UserRepositoryTest = Layer.succeed(UserRepository, {
  findById: (id) => Effect.succeed({ id, name: "Test", email: "test@test.com" }),
  findByEmail: (email) => Effect.succeed({ id: "1", name: "Test", email }),
  save: () => Effect.void,
  delete: () => Effect.void
})`,
        },
      ],
    },
    {
      rule: "Direct file I/O → Context.Tag service",
      examples: [
        {
          description: "File system operations",
          bad: `import * as fs from "fs/promises"

const readConfig = () =>
  Effect.tryPromise(() => fs.readFile("config.json", "utf-8"))

const writeLog = (message: string) =>
  Effect.tryPromise(() => fs.appendFile("app.log", message))`,
          good: `// FileSystem service
class FileSystem extends Context.Tag("FileSystem")<
  FileSystem,
  {
    readonly readFile: (path: string) => Effect.Effect<string, FileError>
    readonly writeFile: (path: string, content: string) => Effect.Effect<void, FileError>
    readonly appendFile: (path: string, content: string) => Effect.Effect<void, FileError>
    readonly exists: (path: string) => Effect.Effect<boolean>
  }
>() {}

// Live implementation
const FileSystemLive = Layer.succeed(FileSystem, {
  readFile: (path) =>
    Effect.tryPromise({
      try: () => fs.readFile(path, "utf-8"),
      catch: (e) => new FileError({ path, cause: e })
    }),
  writeFile: (path, content) =>
    Effect.tryPromise({
      try: () => fs.writeFile(path, content),
      catch: (e) => new FileError({ path, cause: e })
    }),
  appendFile: (path, content) =>
    Effect.tryPromise({
      try: () => fs.appendFile(path, content),
      catch: (e) => new FileError({ path, cause: e })
    }),
  exists: (path) =>
    Effect.tryPromise({
      try: () => fs.access(path).then(() => true).catch(() => false),
      catch: () => false
    })
})

// Test implementation with virtual file system
const FileSystemTest = (files: Map<string, string>) =>
  Layer.succeed(FileSystem, {
    readFile: (path) =>
      pipe(
        Option.fromNullable(files.get(path)),
        Option.match({
          onNone: () => Effect.fail(new FileError({ path, cause: "Not found" })),
          onSome: (content) => Effect.succeed(content)
        })
      ),
    writeFile: (path, content) =>
      Effect.sync(() => { files.set(path, content) }),
    appendFile: (path, content) =>
      Effect.sync(() => {
        const existing = files.get(path) ?? ""
        files.set(path, existing + content)
      }),
    exists: (path) =>
      Effect.succeed(files.has(path))
  })`,
        },
      ],
    },
    {
      rule: "Missing test Layers → *Live + *Test layers for every service",
      examples: [
        {
          description: "Complete layer setup",
          bad: `// Only has live implementation
const EmailServiceLive = Layer.succeed(EmailService, {
  send: (email) => sendRealEmail(email)
})

// Tests hit real email service!
it.effect("should send welcome email", () =>
  Effect.gen(function* () {
    yield* sendWelcomeEmail(user)
  }).pipe(Effect.provide(EmailServiceLive))
)`,
          good: `// Live implementation
const EmailServiceLive = Layer.succeed(EmailService, {
  send: (email) => sendRealEmail(email)
})

// Test implementation that captures sent emails
const EmailServiceTest = (sentEmails: Array<Email> = []) =>
  Layer.succeed(EmailService, {
    send: (email) =>
      Effect.sync(() => {
        sentEmails.push(email)
      })
  })

// Test can verify email behavior without sending
it.effect("should send welcome email", () => {
  const sentEmails: Email[] = []
  return Effect.gen(function* () {
    yield* sendWelcomeEmail(user)
    expect(sentEmails).toHaveLength(1)
    expect(sentEmails[0].to).toBe(user.email)
    expect(sentEmails[0].subject).toContain("Welcome")
  }).pipe(Effect.provide(EmailServiceTest(sentEmails)))
})`,
        },
      ],
    },
    {
      rule: "Services without layers → Layer.effect or Layer.succeed",
      examples: [
        {
          description: "Simple stateless service",
          bad: `// Service defined but no layer
class Logger extends Context.Tag("Logger")<
  Logger,
  { readonly log: (msg: string) => Effect.Effect<void> }
>() {}

// Using Effect.provideService directly (works but not composable)
const program = myEffect.pipe(
  Effect.provideService(Logger, { log: (msg) => Effect.log(msg) })
)`,
          good: `class Logger extends Context.Tag("Logger")<
  Logger,
  { readonly log: (msg: string) => Effect.Effect<void> }
>() {}

// Layer.succeed for simple implementations
const LoggerLive = Layer.succeed(Logger, {
  log: (msg) => Effect.log(msg)
})

// Layer.effect when you need other services
const LoggerWithTimestamp = Layer.effect(
  Logger,
  Effect.gen(function* () {
    const clock = yield* Clock
    return {
      log: (msg) =>
        Effect.gen(function* () {
          const now = yield* clock.currentTimeMillis
          yield* Effect.log(\`[\${now}] \${msg}\`)
        })
    }
  })
)

// Layers compose
const AppLive = Layer.mergeAll(
  LoggerLive,
  UserRepositoryLive,
  EmailServiceLive
)`,
        },
        {
          description: "Service with dependencies",
          bad: `// Creating service implementation inline
const program = Effect.gen(function* () {
  const db = yield* Database
  const cache = yield* Cache

  // Business logic mixed with service creation
  const user = yield* db.query("...")
  yield* cache.set(user.id, user)
})`,
          good: `// UserService depends on Database and Cache
const UserServiceLive = Layer.effect(
  UserService,
  Effect.gen(function* () {
    const db = yield* Database
    const cache = yield* Cache

    return {
      getUser: (id) =>
        Effect.gen(function* () {
          // Check cache first
          const cached = yield* cache.get(id)
          if (Option.isSome(cached)) {
            return cached.value
          }

          // Fetch from DB and cache
          const user = yield* db.query("SELECT * FROM users WHERE id = ?", [id])
          yield* cache.set(id, user)
          return user
        }),
      // ... other methods
    }
  })
)

// Layer composition handles dependencies
const AppLive = UserServiceLive.pipe(
  Layer.provide(Layer.mergeAll(DatabaseLive, CacheLive))
)`,
        },
      ],
    },
  ],
};
