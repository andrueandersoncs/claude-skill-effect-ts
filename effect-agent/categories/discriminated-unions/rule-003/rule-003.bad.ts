// Rule: Never cast unknown to check ._tag; use Schema.is() for validation
// Example: Runtime validation of unknown input (bad example)
// @rule-id: rule-003
// @category: discriminated-unions
// @original-name: runtime-validation

// ❌ Bad: Casting unknown to check ._tag
const handleUnknown = (input: unknown) => {
	if (
		typeof input === "object" &&
		input !== null &&
		(input as { _tag?: string })._tag === "Circle"
	) {
		return "Valid circle";
	}
	return "Invalid shape";
};

export { handleUnknown };
