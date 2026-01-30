// Rule: Never manage resources manually in tests; use it.scoped
// Example: Testing with acquireRelease resources (bad example)
// @rule-id: rule-010
// @category: testing
// @original-name: it-scoped

// Declare external test functions
declare function it(name: string, fn: () => Promise<void>): void;
declare function expect<T>(value: T): { toBeDefined(): void };

// Declare database connection type
interface DatabaseConnection {
	query(sql: string): Promise<unknown>;
	close(): Promise<void>;
}

declare function connect(): Promise<DatabaseConnection>;

// BAD: Manual resource management in tests instead of it.scoped
it("should use database connection", async () => {
	const conn = await connect();
	try {
		const result = await conn.query("SELECT 1");
		expect(result).toBeDefined();
	} finally {
		await conn.close(); // Manual cleanup
	}
});

export { connect };
