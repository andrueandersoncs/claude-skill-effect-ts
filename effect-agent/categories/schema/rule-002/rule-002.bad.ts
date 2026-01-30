// Rule: Never extend plain Error class; use Schema.TaggedError
// Example: Domain error types (bad example)
// @rule-id: rule-002
// @category: schema
// @original-name: no-plain-error

// ❌ Bad: Extending plain Error class instead of Schema.TaggedError
class UserNotFoundError extends Error {
	constructor(public userId: string) {
		super(`User ${userId} not found`);
		this.name = "UserNotFoundError";
	}
}

// Usage of the bad error class
export function findUserBad(userId: string): never {
	throw new UserNotFoundError(userId);
}

export { UserNotFoundError };
