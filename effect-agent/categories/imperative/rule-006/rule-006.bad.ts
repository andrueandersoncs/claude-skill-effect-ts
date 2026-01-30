// Rule: Never use nested for loops; use Array.flatMap
// Example: Flattening nested arrays (bad example)
// @rule-id: rule-006
// @category: imperative
// @original-name: flattening-nested-arrays

// Declare external data for demonstration
interface Post {
	tags: string[];
}
declare const posts: Post[];

// Wrap in an exported function to avoid unused variable errors
export function badFlatteningArrays(): string[] {
	// ❌ Bad:
	const allTags: string[] = [];
	for (const post of posts) {
		for (const tag of post.tags) {
			allTags.push(tag);
		}
	}
	return allTags;
}
