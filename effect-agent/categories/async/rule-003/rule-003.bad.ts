// Rule: Never use Effect.runPromise except at application boundaries
// Example: HTTP handler (boundary OK) (bad example)
// @rule-id: rule-003
// @category: async
// @original-name: http-handler-boundary

import type { Effect } from "effect";

// Mock Express types
interface Request {
	params: { id: string };
}
interface Response {
	json: (data: unknown) => void;
}
interface App {
	get: (
		path: string,
		handler: (req: Request, res: Response) => Promise<void>,
	) => void;
}

declare const app: App;
declare const getUser: (
	id: string,
) => Effect.Effect<{ id: string; name: string }>;

// ❌ Bad: Trying to use yield* outside of Effect.gen context
// The bad pattern is: yield* getUser(id) inside an async function
// This won't compile because yield* requires a generator function
app.get("/users/:id", async (_req, res) => {
	// This is wrong - can't use yield* in async function
	// const user = yield* getUser(req.params.id)
	void getUser; // Reference to show the pattern
	res.json({ error: "Cannot use yield* outside Effect.gen" });
});

export { app };
