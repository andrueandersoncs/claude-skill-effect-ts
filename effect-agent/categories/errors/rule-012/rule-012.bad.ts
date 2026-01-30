// Rule: Never use untyped errors; use Schema.TaggedError
// Example: Multiple error types (bad example)
// @rule-id: rule-012
// @category: errors
// @original-name: typed-errors

// ❌ Bad:
export class ValidationError extends Error {
	constructor(
		public field: string,
		message: string,
	) {
		super(message);
	}
}

export class NotFoundError extends Error {
	constructor(
		public resource: string,
		public id: string,
	) {
		super(`${resource} ${id} not found`);
	}
}
