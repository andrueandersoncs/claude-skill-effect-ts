import { Schema } from "effect";
import * as ts from "typescript";

// Schema for objects with a number kind property
const NodeWithNumberKind = Schema.Struct({
	kind: Schema.Number,
});

// Type guard that checks if something is node-like with a number kind
const isNodeWithNumberKind = (u: unknown): u is { kind: number } =>
	Schema.is(NodeWithNumberKind)(u);

// Now use this in Schema.declare - no typeof needed!
const FunctionNodeFixed = Schema.Union(
	Schema.declare((u): u is ts.FunctionDeclaration => {
		// First check: is it a node-like object?
		if (typeof u !== "object" || u === null) {
			return false;
		}
		// Use Schema.is to check the number type
		if (!isNodeWithNumberKind(u)) {
			return false;
		}
		// Check the specific kind value
		if (u.kind !== 263) {
			return false;
		}
		// Fallback to TypeScript's built-in type predicate
		return ts.isFunctionDeclaration(u as any);
	}),
);

console.log("Schema compiled successfully");
