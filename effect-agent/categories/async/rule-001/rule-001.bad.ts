// Rule: Never use new Promise(); use Effect.async for callback-based APIs
// Example: Converting callback-based API (bad example)
// @rule-id: rule-001
// @category: async
// @original-name: callback-api

import * as fs from "node:fs";

// ❌ Bad: Using new Promise instead of Effect.async
const readFileAsyncBad = (path: string) =>
	new Promise<Buffer>((resolve, reject) => {
		fs.readFile(path, (err, data) => {
			if (err) reject(err);
			else resolve(data);
		});
	});

export { readFileAsyncBad };
