// Rule: Never use Object.keys/values/entries; use Record module
// Example: Converting to entries

import { Record } from "effect"

declare const config: Record<string, string>

// ✅ Good: Record.toEntries and Record.fromEntries
const entries = Record.toEntries(config)
const fromEntries = Record.fromEntries(entries)

export { entries, fromEntries }
