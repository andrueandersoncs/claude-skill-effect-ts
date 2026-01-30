// Rule: Only add comments explaining WHY when the reason isn't obvious from context
// Example: Legitimate why comment (bad example)
// @rule-id: rule-006
// @category: comments
// @original-name: legitimate-why-comment

// ❌ Bad: Comment describes what, not why
// Set timeout to 30 seconds
const timeout = 30_000;

export { timeout };
