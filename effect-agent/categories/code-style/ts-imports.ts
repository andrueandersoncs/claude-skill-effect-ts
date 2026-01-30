// Rule: Never import from ".js" files; always import from ".ts" files directly
// Example: Module imports

// ❌ Bad: Importing from .js extension
// import { Item } from "../_fixtures.js"

// ✅ Good: Importing from .ts extension
import { Item } from "../_fixtures.ts"

const example: Item = {
  id: "1",
  key: "item-key",
  value: 42,
  price: 9.99,
  quantity: 1,
  active: true,
}

export { example }
