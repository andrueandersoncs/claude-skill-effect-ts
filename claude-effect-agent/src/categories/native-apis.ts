import type { Category } from "./types.js";

export const nativeApis: Category = {
  id: "native-apis",
  name: "Native API Replacements",
  patterns: [
    {
      rule: "array.find() → Array.findFirst (returns Option)",
      examples: [
        {
          description: "Finding element in array",
          bad: `const admin = users.find((u) => u.role === "admin")
if (admin) {
  notifyAdmin(admin)
}`,
          good: `const admin = Array.findFirst(users, (u) => u.role === "admin")
Option.match(admin, {
  onNone: () => Effect.void,
  onSome: (a) => notifyAdmin(a)
})`,
        },
        {
          description: "Finding with default",
          bad: `const found = items.find((i) => i.id === targetId) ?? defaultItem`,
          good: `const found = pipe(
  Array.findFirst(items, (i) => i.id === targetId),
  Option.getOrElse(() => defaultItem)
)`,
        },
      ],
    },
    {
      rule: "array[index] → Array.get(array, index) (returns Option)",
      examples: [
        {
          description: "Safe index access",
          bad: `const first = items[0]
if (first) {
  process(first)
}`,
          good: `pipe(
  Array.get(items, 0),
  Option.match({
    onNone: () => Effect.void,
    onSome: (item) => process(item)
  })
)`,
        },
        {
          description: "Index with fallback",
          bad: `const item = items[index] ?? defaultItem`,
          good: `const item = pipe(
  Array.get(items, index),
  Option.getOrElse(() => defaultItem)
)`,
        },
        {
          description: "Head and tail access",
          bad: `const first = arr[0]
const last = arr[arr.length - 1]`,
          good: `const first = Array.head(arr)     // Option<A>
const last = Array.last(arr)       // Option<A>`,
        },
      ],
    },
    {
      rule: "Object.keys/values/entries → Record.keys/values/toEntries",
      examples: [
        {
          description: "Iterating object keys",
          bad: `Object.keys(config).forEach((key) => {
  console.log(key, config[key])
})`,
          good: `pipe(
  Record.toEntries(config),
  Array.forEach(([key, value]) => console.log(key, value))
)`,
        },
        {
          description: "Getting all values",
          bad: `const allValues = Object.values(priceMap)
const allKeys = Object.keys(priceMap)`,
          good: `const allValues = Record.values(priceMap)
const allKeys = Record.keys(priceMap)`,
        },
        {
          description: "Converting to entries",
          bad: `const entries = Object.entries(config)
const fromEntries = Object.fromEntries(entries)`,
          good: `const entries = Record.toEntries(config)
const fromEntries = Record.fromEntries(entries)`,
        },
      ],
    },
    {
      rule: "record[key] → Record.get(record, key) (returns Option)",
      examples: [
        {
          description: "Safe property access",
          bad: `const price = prices[itemId]
if (price !== undefined) {
  calculateTotal(price)
}`,
          good: `pipe(
  Record.get(prices, itemId),
  Option.match({
    onNone: () => Effect.fail(new ItemNotFound({ itemId })),
    onSome: (price) => calculateTotal(price)
  })
)`,
        },
        {
          description: "Property with default",
          bad: `const value = config[key] ?? defaultValue`,
          good: `const value = pipe(
  Record.get(config, key),
  Option.getOrElse(() => defaultValue)
)`,
        },
      ],
    },
    {
      rule: "Manual && / || for predicates → Predicate.and / Predicate.or / Predicate.not",
      examples: [
        {
          description: "Combining predicates",
          bad: `const isValidUser = (u: User) =>
  u.age >= 18 && u.verified && !u.banned`,
          good: `const isAdult = (u: User) => u.age >= 18
const isVerified = (u: User) => u.verified
const isBanned = (u: User) => u.banned

const isValidUser = Predicate.and(
  isAdult,
  Predicate.and(isVerified, Predicate.not(isBanned))
)`,
        },
        {
          description: "Alternative conditions",
          bad: `const canAccess = (u: User) =>
  u.role === "admin" || u.permissions.includes("read")`,
          good: `const isAdmin = (u: User) => u.role === "admin"
const hasReadPermission = (u: User) => u.permissions.includes("read")

const canAccess = Predicate.or(isAdmin, hasReadPermission)`,
        },
        {
          description: "Struct predicate",
          bad: `const isValidInput = (input: unknown) =>
  typeof input === "object" &&
  input !== null &&
  typeof (input as any).name === "string" &&
  typeof (input as any).age === "number"`,
          good: `const isValidInput = Predicate.struct({
  name: Predicate.isString,
  age: Predicate.isNumber
})`,
        },
      ],
    },
    {
      rule: "Struct spread for updates → Struct.evolve",
      examples: [
        {
          description: "Updating specific fields",
          bad: `const updated = {
  ...user,
  age: user.age + 1,
  name: user.name.toUpperCase()
}`,
          good: `const updated = Struct.evolve(user, {
  age: (age) => age + 1,
  name: (name) => name.toUpperCase()
})`,
        },
        {
          description: "Picking fields",
          bad: `const { firstName, lastName } = user
const namePart = { firstName, lastName }`,
          good: `const namePart = Struct.pick(user, "firstName", "lastName")`,
        },
        {
          description: "Omitting fields",
          bad: `const { password, ssn, ...publicUser } = user`,
          good: `const publicUser = Struct.omit(user, "password", "ssn")`,
        },
      ],
    },
    {
      rule: "tuple[0]/tuple[1] → Tuple.getFirst/getSecond",
      examples: [
        {
          description: "Tuple element access",
          bad: `const pair = ["key", 42] as const
const key = pair[0]
const value = pair[1]`,
          good: `const pair = Tuple.make("key", 42)
const key = Tuple.getFirst(pair)
const value = Tuple.getSecond(pair)`,
        },
        {
          description: "Tuple transformation",
          bad: `const transformed = [
  pair[0].toUpperCase(),
  pair[1] * 2
] as const`,
          good: `const transformed = Tuple.mapBoth(pair, {
  onFirst: (s) => s.toUpperCase(),
  onSecond: (n) => n * 2
})`,
        },
      ],
    },
  ],
};
