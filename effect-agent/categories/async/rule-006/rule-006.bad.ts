// Rule: Never use Promise.race; use Effect.race or Effect.raceAll
// Example: Racing multiple operations (bad example)
// @rule-id: rule-006
// @category: async
// @original-name: race-operations

declare const fetchFromPrimary: () => Promise<string>;
declare const fetchFromBackup: () => Promise<string>;

// ❌ Bad: Using Promise.race instead of Effect.race
const fetchWithFallbackBad = async () => {
	const result = await Promise.race([fetchFromPrimary(), fetchFromBackup()]);
	return result;
};

export { fetchWithFallbackBad };
