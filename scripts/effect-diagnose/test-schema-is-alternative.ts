#!/usr/bin/env bun
/**
 * Test: Can manual typeof checks in Schema.declare be replaced with Schema.is()?
 *
 * Hypothesis: The pattern `typeof u !== "object" || u === null || !("kind" in u)`
 * can be replaced with `!Schema.is(NodeLikeSchema)(u)` where NodeLikeSchema
 * validates the same structure.
 *
 * Exit 0 = hypothesis is WRONG (manual checks are required)
 * Exit 1 = hypothesis is CORRECT (Schema.is works as replacement)
 */

import { Schema } from "effect";
import ts from "typescript";

// Current approach: manual typeof checks
const manualCheck = (u: unknown): boolean =>
	typeof u === "object" && u !== null && "kind" in u;

// Proposed approach: Schema.is with a structural schema
const NodeLikeSchema = Schema.Struct({
	kind: Schema.Number,
});
const schemaCheck = Schema.is(NodeLikeSchema);

// Test cases
const testCases = [
	{ input: null, expected: false, name: "null" },
	{ input: undefined, expected: false, name: "undefined" },
	{ input: 42, expected: false, name: "number" },
	{ input: "string", expected: false, name: "string" },
	{ input: {}, expected: false, name: "empty object" },
	{ input: { kind: "not a number" }, expected: false, name: "kind is string" },
	{ input: { kind: 123 }, expected: true, name: "valid node-like" },
	{ input: { kind: 0, other: "props" }, expected: true, name: "node-like with extra props" },
];

// Also test with real TypeScript AST nodes
const sourceFile = ts.createSourceFile(
	"test.ts",
	"function foo() {}",
	ts.ScriptTarget.Latest,
	true
);
const realNode = sourceFile.statements[0];
testCases.push({ input: realNode, expected: true, name: "real ts.FunctionDeclaration" });

console.log("Testing manual check vs Schema.is replacement\n");

let allMatch = true;
for (const { input, expected, name } of testCases) {
	const manualResult = manualCheck(input);
	const schemaResult = schemaCheck(input);

	const match = manualResult === schemaResult;
	const status = match ? "✓" : "✗";

	console.log(`${status} ${name}`);
	console.log(`  manual: ${manualResult}, schema: ${schemaResult}, expected: ${expected}`);

	if (!match) {
		allMatch = false;
		console.log(`  MISMATCH: manual and schema give different results`);
	}
	if (manualResult !== expected) {
		console.log(`  WARNING: manual check doesn't match expected`);
	}
}

console.log("");

// Check if schema is stricter (catches more invalid cases)
const schemaMoreCorrect = testCases.every(({ input, expected }) => {
	const schemaResult = schemaCheck(input);
	// Schema is "more correct" if it matches expected OR is stricter (false when manual is true)
	return schemaResult === expected;
});

const manualHasBugs = testCases.some(({ input, expected }) => {
	const manualResult = manualCheck(input);
	return manualResult !== expected;
});

console.log(`Schema matches all expected values: ${schemaMoreCorrect}`);
console.log(`Manual check has bugs: ${manualHasBugs}`);
console.log("");

if (schemaMoreCorrect && manualHasBugs) {
	console.log("RESULT: Schema.is() is MORE CORRECT than manual checks");
	console.log("The manual check has a bug - it passes { kind: 'string' }");
	console.log("Schema.is() should REPLACE manual checks - exit 1");
	process.exit(1);
} else if (allMatch) {
	console.log("RESULT: Schema.is() can replace manual typeof checks (equivalent)");
	process.exit(1);
} else {
	console.log("RESULT: Schema.is() behaves differently - needs more investigation");
	process.exit(0);
}
