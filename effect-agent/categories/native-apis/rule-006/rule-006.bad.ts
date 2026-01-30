// Rule: Never use array.find(); use Array.findFirst (returns Option)
// Example: Finding with default (bad example)
// @rule-id: rule-006
// @category: native-apis
// @original-name: finding-with-default

// Type declaration
interface Item {
	id: string;
}

// Declare external variables
declare const items: Item[];
declare const targetId: string;
declare const defaultItem: Item;

// Bad: Using array.find() with nullish coalescing instead of Array.findFirst with Option.getOrElse
export const found = items.find((i) => i.id === targetId) ?? defaultItem;
