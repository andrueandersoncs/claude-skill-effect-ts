// Rule: Never use Promise.all; use Effect.all
// Example: Named parallel results (bad example)
// @rule-id: rule-004
// @category: async
// @original-name: parallel-results

declare const id: string;
declare const getUser: (id: string) => Promise<{ name: string }>;
declare const getOrders: (id: string) => Promise<Array<{ id: string }>>;

// ❌ Bad: Using Promise.all instead of Effect.all
const fetchUserDataBad = async () => {
	const results = await Promise.all([getUser(id), getOrders(id)]);
	const user = results[0];
	const orders = results[1];
	return { user, orders };
};

export { fetchUserDataBad };
