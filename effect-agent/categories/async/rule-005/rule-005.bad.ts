// Rule: Never use Promise chains (.then); use pipe with Effect.map/flatMap
// Example: Promise chain with transformation (bad example)
// @rule-id: rule-005
// @category: async
// @original-name: promise-chain

interface Item {
	id: string;
	active: boolean;
}

interface Data {
	items: Item[];
}

declare const fetchData: () => Promise<Data>;

// ❌ Bad: Using Promise .then chains instead of Effect pipe
const resultBad = fetchData()
	.then((data) => data.items)
	.then((items) => items.filter((i) => i.active))
	.then((active) => active.map((i) => i.id));

export { resultBad };
