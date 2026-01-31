// Rule: Never use type assertions (as, angle brackets, double assertions); use Schema.decodeUnknown or type guards
// Example: Various type assertion anti-patterns (bad examples)
// @rule-id: rule-002
// @category: code-style
// @original-name: no-type-assertions

// BAD: Using 'as any' to bypass type checking
export const processEvent = (event: unknown): unknown => {
	const typed = event as any;
	return typed.payload.data;
};

// BAD: Angle bracket type assertion for DOM elements
export const getInputElement = (): HTMLInputElement | null => {
	const element = <HTMLInputElement>document.getElementById("input");
	return element;
};

interface LegacyData {
	old_field: string;
}

interface NewFormat {
	newField: string;
}

declare const getLegacyData: () => LegacyData;

// BAD: Double assertion through unknown
export const convertData = (): NewFormat => {
	const legacyData = getLegacyData();
	const newFormat = legacyData as unknown as NewFormat;
	return newFormat;
};

interface User {
	id: string;
	name: string;
	email: string;
}

// BAD: Type casting API response without runtime validation
export const fetchUser = async (id: string): Promise<User> => {
	const response = await fetch(`/users/${id}`);
	const data = await response.json();
	return data as User; // Type casting - no runtime validation!
};
