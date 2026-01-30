// Rule: Never use TypeScript enum; use Schema.Literal
// Example: Converting TypeScript enums (bad example)
// @rule-id: rule-008
// @category: schema
// @original-name: schema-literal

// ❌ Bad: Using TypeScript enum instead of Schema.Literal
enum Status {
	Pending = "pending",
	Active = "active",
	Completed = "completed",
}

// Usage of bad enum
export function getStatusLabel(status: Status): string {
	switch (status) {
		case Status.Pending:
			return "Pending...";
		case Status.Active:
			return "Active!";
		case Status.Completed:
			return "Done";
	}
}

export { Status };
