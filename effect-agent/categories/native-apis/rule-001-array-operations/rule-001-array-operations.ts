// Rule: Use Effect's Array module for all array operations
// This consolidated rule covers all Array module function replacements
// @rule-id: rule-001-array-operations
// @category: native-apis
// @original-name: array-operations-consolidated

import { Array, Function, Match, Option, pipe } from "effect";
import {
	defaultItem,
	type Item,
	isValidEmail,
	type User,
} from "../../_fixtures.js";

declare const users: ReadonlyArray<User>;
declare const items: ReadonlyArray<Item>;
declare const ids: ReadonlyArray<string>;
declare const arr: ReadonlyArray<string>;
declare const targetId: string;
declare const newItem: string;

// ============================================================================
// DECISION MATRIX: Native JS Array Methods -> Effect Array Module
// ============================================================================
//
// | Native Method           | Effect Replacement           | Returns       |
// |-------------------------|------------------------------|---------------|
// | arr.filter().map()      | Array.filterMap              | Array<B>      |
// | arr.find()              | Array.findFirst              | Option<A>     |
// | arr.findIndex()         | Array.findFirstIndex         | Option<number>|
// | arr.includes()          | Array.contains               | boolean       |
// | arr.indexOf()           | Array.findFirstIndex         | Option<number>|
// | arr[0]                  | Array.head                   | Option<A>     |
// | arr[arr.length-1]       | Array.last                   | Option<A>     |
// | arr[n]                  | Array.get(n)                 | Option<A>     |
// | arr.length === 0        | Array.isEmptyArray           | boolean       |
// | arr.length > 0          | Array.isNonEmptyArray        | boolean       |
// | [...new Set(arr)]       | Array.dedupe                 | Array<A>      |
// | manual grouping loop    | Array.groupBy                | Record<K,NEA> |
// | filter twice opposite   | Array.partition              | [Array, Array]|
// | arr.push()              | Array.append                 | Array<A>      |
// | arr.unshift()           | Array.prepend                | Array<A>      |
// | arr.splice(i,1)         | Array.remove(i)              | Array<A>      |
// | arr.splice(i,0,x)       | Array.insertAt(i,x)          | Option<Array> |
// | arr.pop()               | Array.initNonEmpty           | Array<A>      |
// | arr.shift()             | Array.tailNonEmpty           | Array<A>      |
// | arr.sort()              | Array.sort                   | Array<A>      |
// | arr.reverse()           | Array.reverse                | Array<A>      |
// | arr.flat()              | Array.flatten                | Array<A>      |
// | arr.flatMap()           | Array.flatMap                | Array<B>      |
// | arr.map()               | Array.map                    | Array<B>      |
// | arr.filter()            | Array.filter                 | Array<A>      |
// | arr.reduce()            | Array.reduce                 | B             |
// | arr.some()              | Array.some                   | boolean       |
// | arr.every()             | Array.every                  | boolean       |
// | arr.concat()            | Array.appendAll              | Array<A>      |
// | arr.slice()             | Array.take/drop/slice        | Array<A>      |
// | arr.join()              | Array.join                   | string        |
// ============================================================================

// -------------------------------------------------------------------------
// Example 1: Filter + Map in single pass (replaces .filter().map() chains)
// -------------------------------------------------------------------------
const validEmails = Array.filterMap(users, (u) =>
	Match.value(isValidEmail(u.email)).pipe(
		Match.when(true, () => Option.some(u.email)),
		Match.orElse(Option.none),
	),
);

// -------------------------------------------------------------------------
// Example 2: Finding with default (replaces .find() ?? default)
// -------------------------------------------------------------------------
const foundItem = pipe(
	Array.findFirst(items, (i) => i.id === targetId),
	Option.getOrElse(Function.constant(defaultItem)),
);

// -------------------------------------------------------------------------
// Example 3: Grouping items by key (replaces manual for-loop grouping)
// -------------------------------------------------------------------------
const usersByRole = Array.groupBy(users, (u) => u.role ?? "user");

// -------------------------------------------------------------------------
// Example 4: Head and tail access (replaces arr[0] and arr[arr.length-1])
// -------------------------------------------------------------------------
const first = Array.head(arr); // Option<string>
const last = Array.last(arr); // Option<string>

// -------------------------------------------------------------------------
// Example 5: Removing duplicates (replaces [...new Set(arr)])
// -------------------------------------------------------------------------
const uniqueIds = Array.dedupe(ids);

// -------------------------------------------------------------------------
// Example 6: Immutable splice operations (replaces .push, .splice, etc.)
// -------------------------------------------------------------------------
const removedAt2 = pipe(items, Array.remove(2));
const insertedAt1 = pipe(
	items,
	Array.insertAt(1, items[0]),
	Option.getOrElse(Function.constant(items)),
);

// -------------------------------------------------------------------------
// Example 7: Partition (replaces filtering twice with opposite conditions)
// -------------------------------------------------------------------------
const [minors, adults] = Array.partition(users, (u) => (u.age ?? 0) >= 18);

export {
	adults,
	first,
	foundItem,
	insertedAt1,
	last,
	minors,
	removedAt2,
	uniqueIds,
	usersByRole,
	validEmails,
};
