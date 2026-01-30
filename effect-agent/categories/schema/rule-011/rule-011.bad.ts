// Rule: Never use TypeScript union types; use Schema.Union of TaggedClass
// Example: Union type definition (bad example)
// @rule-id: rule-011
// @category: schema
// @original-name: schema-union

// Define supporting types for the unions
interface Success {
	value: string;
}

interface Failure {
	error: string;
}

interface UserCreated {
	type: "created";
	userId: string;
}

interface UserUpdated {
	type: "updated";
	userId: string;
	fields: string[];
}

interface UserDeleted {
	type: "deleted";
	userId: string;
}

// ❌ Bad: Using TypeScript union types
type Status = "pending" | "active" | "completed";
type Result = Success | Failure;
type Event = UserCreated | UserUpdated | UserDeleted;

// Usage of bad union types
export function handleStatus(status: Status): string {
	return status.toUpperCase();
}

export function handleResult(result: Result): string {
	if ("value" in result) {
		return result.value;
	}
	return result.error;
}

export function handleEvent(event: Event): string {
	return event.userId;
}

export type { Status, Result, Event };
