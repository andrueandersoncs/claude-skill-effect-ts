// Rule: Never use angle bracket casting (<Type>value); use Schema
// Example: Old-style type assertion

import { Effect, Option, pipe } from "effect";
import { ElementNotFound } from "../_fixtures.js";

// ✅ Good: Option and type guard for DOM elements
const getInput = (id: string) =>
	Effect.gen(function* () {
		const el = yield* Effect.sync(() => document.getElementById(id));
		return yield* pipe(
			Option.fromNullable(el),
			Option.filter(
				(e): e is HTMLInputElement => e instanceof HTMLInputElement,
			),
			Option.match({
				onNone: () => Effect.fail(new ElementNotFound({ id })),
				onSome: Effect.succeed,
			}),
		);
	});

export { getInput };
