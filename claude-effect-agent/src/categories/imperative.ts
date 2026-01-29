import type { Category } from "./types.js";

export const imperative: Category = {
  id: "imperative",
  name: "Loops & Mutation",
  patterns: [
    {
      rule: "for/while/do...while loops → Array.map/filter/reduce, Effect.forEach",
      examples: [
        {
          description: "Transforming array elements",
          bad: `const doubled = []
for (let i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2)
}`,
          good: `const doubled = Array.map(numbers, (n) => n * 2)
// or with pipe
const doubled = pipe(numbers, Array.map((n) => n * 2))`,
        },
        {
          description: "Accumulating values",
          bad: `let sum = 0
let i = 0
while (i < numbers.length) {
  sum += numbers[i]
  i++
}`,
          good: `const sum = Array.reduce(numbers, 0, (acc, n) => acc + n)`,
        },
        {
          description: "Effectful iteration",
          bad: `const results = []
for (const item of items) {
  const result = await processItem(item)
  results.push(result)
}`,
          good: `const results = yield* Effect.forEach(items, processItem)`,
        },
        {
          description: "do...while conversion",
          bad: `let attempts = 0
do {
  const result = tryOperation()
  if (result.success) break
  attempts++
} while (attempts < 3)`,
          good: `const result = yield* Effect.retry(
  tryOperation,
  Schedule.recurs(3)
)`,
        },
      ],
    },
    {
      rule: "for...of/for...in → Array module functions",
      examples: [
        {
          description: "Processing collection",
          bad: `const results = []
for (const item of items) {
  results.push(process(item))
}`,
          good: `const results = Array.map(items, process)`,
        },
        {
          description: "Filtering and transforming",
          bad: `const activeEmails = []
for (const user of users) {
  if (user.active) {
    activeEmails.push(user.email)
  }
}`,
          good: `const activeEmails = pipe(
  users,
  Array.filter((u) => u.active),
  Array.map((u) => u.email)
)`,
        },
        {
          description: "Conditional accumulation",
          bad: `let total = 0
for (const order of orders) {
  if (order.status === "completed") {
    total += order.amount
  }
}`,
          good: `const total = pipe(
  orders,
  Array.filter((o) => o.status === "completed"),
  Array.reduce(0, (acc, o) => acc + o.amount)
)`,
        },
        {
          description: "for...in on objects",
          bad: `const result = {}
for (const key in source) {
  result[key] = transform(source[key])
}`,
          good: `const result = Record.map(source, transform)`,
        },
      ],
    },
    {
      rule: "Variable mutation (let, push, pop, splice) → Immutable operations",
      examples: [
        {
          description: "Building array with push",
          bad: `const output = []
items.forEach(item => output.push(transform(item)))`,
          good: `const output = Array.map(items, transform)`,
        },
        {
          description: "Accumulator mutation",
          bad: `let total = 0
for (const price of prices) {
  total += price
}`,
          good: `const total = Array.reduce(prices, 0, (acc, price) => acc + price)`,
        },
        {
          description: "Array concatenation with push",
          bad: `const all = []
all.push(...first)
all.push(...second)`,
          good: `const all = [...first, ...second]
// or
const all = Array.appendAll(first, second)`,
        },
        {
          description: "Conditional array building",
          bad: `const selected = []
for (const item of items) {
  if (isValid(item)) {
    selected.push(item)
  }
}`,
          good: `const selected = Array.filter(items, isValid)`,
        },
        {
          description: "Array splice/modification",
          bad: `const arr = [...items]
arr.splice(2, 1)  // Remove at index 2
arr.splice(1, 0, newItem)  // Insert at index 1`,
          good: `const removed = pipe(
  items,
  Array.remove(2)
)
const inserted = pipe(
  items,
  Array.insertAt(1, newItem),
  Option.getOrElse(() => items)
)`,
        },
      ],
    },
    {
      rule: "Reassignment → Functional transformation",
      examples: [
        {
          description: "Incrementing counter",
          bad: `let count = 0
items.forEach((item) => {
  if (item.active) count++
})`,
          good: `const count = Array.filter(items, (i) => i.active).length
// or
const count = Array.reduce(items, 0, (acc, i) => i.active ? acc + 1 : acc)`,
        },
        {
          description: "Conditional reassignment",
          bad: `let result = defaultValue
if (condition1) {
  result = value1
} else if (condition2) {
  result = value2
}`,
          good: `const result = Match.value({ condition1, condition2 }).pipe(
  Match.when({ condition1: true }, () => value1),
  Match.when({ condition2: true }, () => value2),
  Match.orElse(() => defaultValue)
)`,
        },
        {
          description: "Building object with mutation",
          bad: `const obj: Record<string, number> = {}
for (const item of items) {
  obj[item.key] = item.value
}`,
          good: `const obj = pipe(
  items,
  Array.map((item) => [item.key, item.value] as const),
  Record.fromEntries
)`,
        },
      ],
    },
    {
      rule: "Recursion for complex iteration",
      examples: [
        {
          description: "Tree traversal",
          bad: `const collectLeaves = (node) => {
  const leaves = []
  const stack = [node]
  while (stack.length > 0) {
    const current = stack.pop()
    if (current.children.length === 0) {
      leaves.push(current)
    } else {
      stack.push(...current.children)
    }
  }
  return leaves
}`,
          good: `const collectLeaves = (node: TreeNode): ReadonlyArray<TreeNode> =>
  Array.match(node.children, {
    onEmpty: () => [node],
    onNonEmpty: (children) => Array.flatMap(children, collectLeaves)
  })`,
        },
        {
          description: "Recursive Effect processing",
          bad: `async function processTree(node) {
  if (node.children.length === 0) {
    return await processLeaf(node)
  }
  const results = []
  for (const child of node.children) {
    results.push(await processTree(child))
  }
  return combineResults(results)
}`,
          good: `const processTree = (node: TreeNode): Effect.Effect<Result> =>
  Array.match(node.children, {
    onEmpty: () => processLeaf(node),
    onNonEmpty: (children) =>
      Effect.forEach(children, processTree).pipe(
        Effect.flatMap(combineResults)
      )
  })`,
        },
      ],
    },
    {
      rule: "Effect combinators for async loops",
      examples: [
        {
          description: "Sequential processing",
          bad: `const processAll = Effect.gen(function* () {
  const results = []
  for (const item of items) {
    const result = yield* processItem(item)
    results.push(result)
  }
  return results
})`,
          good: `const processAll = Effect.forEach(items, processItem)`,
        },
        {
          description: "Parallel processing",
          bad: `const results = await Promise.all(items.map(processItem))`,
          good: `const results = yield* Effect.all(
  Array.map(items, processItem),
  { concurrency: "unbounded" }
)`,
        },
        {
          description: "Limited concurrency",
          bad: `// Complex manual batching with Promise.all
const batchSize = 5
for (let i = 0; i < items.length; i += batchSize) {
  const batch = items.slice(i, i + batchSize)
  await Promise.all(batch.map(processItem))
}`,
          good: `const results = yield* Effect.all(
  Array.map(items, processItem),
  { concurrency: 5 }
)`,
        },
        {
          description: "Effectful reduce",
          bad: `let total = 0
for (const item of items) {
  const price = await getPrice(item)
  total += price
}`,
          good: `const total = yield* Effect.reduce(items, 0, (acc, item) =>
  getPrice(item).pipe(Effect.map((price) => acc + price))
)`,
        },
      ],
    },
  ],
};
