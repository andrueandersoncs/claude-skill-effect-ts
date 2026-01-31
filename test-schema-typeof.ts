import { Schema } from "effect";

// Current approach - uses typeof in Schema.declare
const BadFunctionNode = Schema.declare((u): u is { kind: number } => {
	const kind = (u as any)["kind"];
	// This line violates rule-007: typeof check
	if (typeof kind === "number") {
		return true;
	}
	return false;
});

// Better approach - use schema composition to validate number type
const KindNumber = Schema.Number;

const GoodFunctionNode = Schema.Struct({
	kind: KindNumber,
});

// Test both
const test = (u: unknown) => {
	console.log("Testing BadFunctionNode with { kind: 263 }");
	try {
		const result1 = Schema.is(BadFunctionNode)({ kind: 263 });
		console.log("BadFunctionNode result:", result1);
	} catch (e) {
		console.log("BadFunctionNode error:", e);
	}

	console.log("Testing GoodFunctionNode with { kind: 263 }");
	try {
		const result2 = Schema.is(GoodFunctionNode)({ kind: 263 });
		console.log("GoodFunctionNode result:", result2);
	} catch (e) {
		console.log("GoodFunctionError:", e);
	}
};

test({});
