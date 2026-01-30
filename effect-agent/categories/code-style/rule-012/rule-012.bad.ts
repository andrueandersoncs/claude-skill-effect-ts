// Rule: Never use 'as unknown as T'; define a Schema instead
// Example: Converting between types (bad example)
// @rule-id: rule-012
// @category: code-style
// @original-name: unknown-conversion

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
