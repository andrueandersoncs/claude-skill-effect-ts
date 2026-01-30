// Rule: Never use the function keyword; use fat arrow syntax
// Example: Function declarations

import { Array } from "effect"
import { Item } from "../_fixtures.js"

interface Event {
  data: unknown
}

// ✅ Good: Fat arrow syntax for all functions
const processItems = (items: ReadonlyArray<Item>): number =>
  Array.reduce(items, 0, (sum, item) => sum + item.value)

const handler = (event: Event) => event.data

export { processItems, handler }
