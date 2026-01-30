// Rule: Never use imperative loops for tree traversal; use recursion with Effect
// Example: Recursive Effect processing (bad example)
// @rule-id: rule-008
// @category: imperative
// @original-name: recursive-effect-processing

// Declare external types and functions for demonstration
interface TreeNode {
	children: TreeNode[];
}
declare function processLeaf(node: TreeNode): Promise<unknown>;
declare function combineResults(results: unknown[]): unknown;

// ❌ Bad:
export async function processTree(node: TreeNode): Promise<unknown> {
	if (node.children.length === 0) {
		return await processLeaf(node);
	}
	const results: unknown[] = [];
	for (const child of node.children) {
		results.push(await processTree(child));
	}
	return combineResults(results);
}
