// Rule: Never use eslint-disable for exhaustive checks; use Match.exhaustive
// Example: Switch exhaustiveness (bad example)
// @rule-id: rule-007
// @category: code-style
// @original-name: exhaustive-match

type Status = "pending" | "active" | "completed";

// BAD: eslint-disable to bypass switch exhaustiveness check
// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
export const handleStatus = (status: Status): string => {
	switch (status) {
		case "pending":
			return "Waiting";
		case "active":
			return "Running";
		// Missing "completed" case - eslint-disable hides this error
	}
};

// BAD: Using no-unnecessary-condition to suppress unreachable default warning
export const getStatusLabel = (status: Status): string => {
	switch (status) {
		case "pending":
			return "Pending";
		case "active":
			return "Active";
		case "completed":
			return "Done";
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- unreachable default
		default:
			return "Unknown";
	}
};

// BAD: @ts-expect-error to suppress exhaustiveness error
export const processStatus = (status: Status): number => {
	// @ts-expect-error TS7030: Not all code paths return a value
	switch (status) {
		case "pending":
			return 1;
		case "active":
			return 2;
		// Missing "completed" - @ts-expect-error hides the issue
	}
};
