// Rule: Never import from ".js" files; always import from ".ts" files directly
// Example: Module imports

// ❌ Bad: Importing from .js extension
// import { Item } from "../_fixtures.js"

// ✅ Good: Importing from .ts extension
import { Item } from "../_fixtures.ts"

const example: Item = { id: "1", value: 42 }

export { example }
