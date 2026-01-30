// Rule: Never use Object.keys/values/entries; use Record module
// Example: Converting to entries (bad example)
// @rule-id: rule-003
// @category: native-apis
// @original-name: converting-to-entries

// Declare external variables
declare const config: Record<string, string>;

// Bad: Using Object.entries instead of Record.toEntries
export const entries = Object.entries(config);
export const fromEntries = Object.fromEntries(entries);
