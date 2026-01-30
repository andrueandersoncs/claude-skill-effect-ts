// Rule: Never use eslint-disable for any-type errors; use Schema
// Example: Dynamic property access

import { Function, Option, pipe, Record } from "effect";

// ✅ Good: Record.get with proper types
const getValue = <K extends string>(obj: Record<K, unknown>, key: K) =>
	pipe(Record.get(obj, key), Option.getOrElse(Function.constant(undefined)));

export { getValue };
