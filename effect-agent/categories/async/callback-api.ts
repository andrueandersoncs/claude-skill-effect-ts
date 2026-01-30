// Rule: Never use new Promise(); use Effect.async for callback-based APIs
// Example: Converting callback-based API

import * as fs from "node:fs";
import { Effect, Match, Predicate } from "effect";

// ✅ Good: Effect.async for callback-based APIs
const readFileAsync = (path: string) =>
	Effect.async<Buffer, NodeJS.ErrnoException>((resume) => {
		fs.readFile(path, (err, data) =>
			resume(
				Match.value({ err, data }).pipe(
					Match.when(
						{ err: Predicate.isNotNull<NodeJS.ErrnoException> },
						({ err }) => Effect.fail(err),
					),
					Match.when({ data: Predicate.isNotNull<Buffer> }, ({ data }) =>
						Effect.succeed(data),
					),
					Match.orElse(() =>
						Effect.fail(new Error("Unknown error") as NodeJS.ErrnoException),
					),
				),
			),
		);
	});

export { readFileAsync };
