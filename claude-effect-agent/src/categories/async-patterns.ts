import type { Category } from "./types.js";

export const asyncPatterns: Category = {
  id: "async-patterns",
  name: "Async/Promise Patterns",
  patterns: [
    {
      rule: "async/await mixed with Effect → Effect.gen with yield*",
      examples: [
        {
          description: "Converting async function",
          bad: `const fetchAndProcess = async (id: string) => {
  const user = await getUser(id)
  const orders = await getOrders(user.id)
  return { user, orders }
}

// Mixed in Effect
const program = Effect.gen(function* () {
  const result = await fetchAndProcess("123") // DON'T DO THIS
  return result
})`,
          good: `const fetchAndProcess = (id: string) =>
  Effect.gen(function* () {
    const user = yield* getUser(id)
    const orders = yield* getOrders(user.id)
    return { user, orders }
  })

// Pure Effect composition
const program = Effect.gen(function* () {
  const result = yield* fetchAndProcess("123")
  return result
})`,
        },
        {
          description: "Wrapping external async library",
          bad: `import { externalLib } from "some-lib"

const useLibrary = Effect.gen(function* () {
  // Mixing async/await with Effect - BAD
  const result = await externalLib.doSomething()
  return result
})`,
          good: `import { externalLib } from "some-lib"

// Wrap at the boundary
const doSomething = Effect.tryPromise({
  try: () => externalLib.doSomething(),
  catch: (e) => new LibraryError({ cause: e })
})

// Use the wrapped Effect
const useLibrary = Effect.gen(function* () {
  const result = yield* doSomething
  return result
})`,
        },
      ],
    },
    {
      rule: "Promise.all → Effect.all",
      examples: [
        {
          description: "Parallel operations",
          bad: `const [user, orders, settings] = await Promise.all([
  getUser(id),
  getOrders(id),
  getSettings(id),
])`,
          good: `const [user, orders, settings] = yield* Effect.all([
  getUser(id),
  getOrders(id),
  getSettings(id),
])`,
        },
        {
          description: "Parallel with concurrency limit",
          bad: `// No easy way to limit concurrency with Promise.all
const results = await Promise.all(items.map(processItem))`,
          good: `// Effect.all with concurrency option
const results = yield* Effect.all(
  Array.map(items, processItem),
  { concurrency: 5 }
)`,
        },
        {
          description: "Named parallel results",
          bad: `const results = await Promise.all([getUser(id), getOrders(id)])
const user = results[0]
const orders = results[1]`,
          good: `const { user, orders } = yield* Effect.all({
  user: getUser(id),
  orders: getOrders(id),
})`,
        },
      ],
    },
    {
      rule: "Promise chains → Effect.flatMap or pipe",
      examples: [
        {
          description: "Sequential async operations",
          bad: `getUser(id)
  .then((user) => getOrders(user.id))
  .then((orders) => processOrders(orders))
  .then((result) => saveResult(result))
  .catch((error) => handleError(error))`,
          good: `pipe(
  getUser(id),
  Effect.flatMap((user) => getOrders(user.id)),
  Effect.flatMap((orders) => processOrders(orders)),
  Effect.flatMap((result) => saveResult(result)),
  Effect.catchAll((error) => handleError(error))
)`,
        },
        {
          description: "Promise chain with transformation",
          bad: `fetchData()
  .then((data) => data.items)
  .then((items) => items.filter((i) => i.active))
  .then((active) => active.map((i) => i.id))`,
          good: `pipe(
  fetchData(),
  Effect.map((data) => data.items),
  Effect.map(Array.filter((i) => i.active)),
  Effect.map(Array.map((i) => i.id))
)`,
        },
      ],
    },
    {
      rule: "await in Effect.gen → yield* (except at boundaries)",
      examples: [
        {
          description: "Correct generator usage",
          bad: `const program = Effect.gen(function* () {
  const user = await getUser(id)      // Wrong: using await
  const orders = yield getOrders(id)  // Wrong: missing *
  return { user, orders }
})`,
          good: `const program = Effect.gen(function* () {
  const user = yield* getUser(id)      // Correct: yield*
  const orders = yield* getOrders(id)  // Correct: yield*
  return { user, orders }
})`,
        },
        {
          description: "Boundary: main entry point",
          bad: `// Trying to use Effect in async context badly
async function main() {
  const result = yield* myEffect  // Can't use yield* outside Effect.gen
}`,
          good: `// At application boundary, use runPromise
const main = async () => {
  const result = await Effect.runPromise(
    myEffect.pipe(Effect.provide(AppLive))
  )
  console.log(result)
}

// Or for CLI tools
Effect.runPromise(
  myEffect.pipe(Effect.provide(AppLive))
).then(console.log).catch(console.error)`,
        },
        {
          description: "Boundary: HTTP handler",
          bad: `// Express handler mixing styles
app.get("/users/:id", async (req, res) => {
  const user = yield* getUser(req.params.id)  // Won't work
  res.json(user)
})`,
          good: `// Convert Effect to Promise at HTTP boundary
app.get("/users/:id", async (req, res) => {
  const result = await Effect.runPromise(
    getUser(req.params.id).pipe(
      Effect.provide(AppLive),
      Effect.either
    )
  )

  Either.match(result, {
    onLeft: (error) => res.status(500).json({ error: error.message }),
    onRight: (user) => res.json(user)
  })
})`,
        },
      ],
    },
  ],
};
