// Rule: Only add comments explaining WHY when the reason isn't obvious from context
// Example: Legitimate why comment
// @rule-id: rule-006
// @category: comments
// @original-name: legitimate-why-comment

import { Duration } from "effect";

// ❌ Bad: Comment describes what, not why
// Set timeout to 30 seconds
const timeout = 30_000;

// ✅ Good: Comment explains WHY with useful context
// Upstream payment API has p99 latency of 25s during peak hours
const paymentTimeout = Duration.seconds(30);

export { timeout, paymentTimeout };
