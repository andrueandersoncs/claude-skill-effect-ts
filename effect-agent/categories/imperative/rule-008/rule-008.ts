// Rule: Never use imperative loops for tree traversal; use recursion with Effect
// Example: Recursive Effect processing
// @rule-id: rule-008
// @category: imperative
// @original-name: recursive-effect-processing

import { Array, Effect } from "effect";
import {
	combineResults,
	processLeaf,
	type Result,
	type TreeNode,
} from "../../_fixtures.js";

// ✅ Good: Recursive Effect processing with Array.match
const processTree = (node: TreeNode): Effect.Effect<Result> =>
	Array.match(node.children, {
		onEmpty: () => processLeaf(node),
		onNonEmpty: (children) =>
			Effect.forEach(children, processTree).pipe(
				Effect.flatMap(combineResults),
			),
	});

export { processTree };
