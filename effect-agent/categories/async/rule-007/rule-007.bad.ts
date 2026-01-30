// Rule: Never use setTimeout/setInterval; use Effect.sleep and Schedule
// Example: Repeated execution (bad example)
// @rule-id: rule-007
// @category: async
// @original-name: repeated-execution

declare const pollForUpdates: () => void;

// ❌ Bad: Using setInterval instead of Effect.repeat with Schedule
const intervalBad = setInterval(() => {
	pollForUpdates();
}, 5000);

export { intervalBad };
