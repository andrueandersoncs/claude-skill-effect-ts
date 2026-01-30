// Rule: Never use eslint-disable for exhaustive checks; use Match.exhaustive
// Example: Switch exhaustiveness (bad example)
// @rule-id: rule-007
// @category: code-style
// @original-name: exhaustive-match

type Status = "pending" | "active";

// BAD: eslint-disable to hide exhaustiveness issue
export const handleStatus = (status: Status): string => {
	switch (status) {
		case "pending":
			return "Waiting";
		case "active":
			return "Running";
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		default:
			return "Unknown";
	}
};
