/**
 * Migration script to split monolithic detectors into per-rule detector files
 *
 * This script:
 * 1. Reads the rule-mappings.json to understand the mapping
 * 2. Creates individual detector files for each rule
 * 3. Updates the runner to discover and use them
 */

import * as fs from "node:fs";
import * as path from "node:path";

interface RuleMapping {
	ruleId: string;
	category: string;
	originalName: string;
	rule: string;
	example: string;
}

// Load rule mappings
const ruleMappings: RuleMapping[] = JSON.parse(
	fs.readFileSync("./rule-mappings.json", "utf-8"),
);

console.log(`Loaded ${ruleMappings.length} rule mappings`);

// Map from originalName to detection patterns
// This maps the semantic rule names to their detection logic
const detectionPatterns: Record<
	string,
	{
		checks: string[];
		severity: "error" | "warning" | "info";
		certainty: "definite" | "potential";
		suggestion: string;
	}
> = {
	// async category
	"callback-api": {
		checks: ["new Promise()", "callback parameters"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Effect.async() for callback-based APIs",
	},
	"generator-yield": {
		checks: ["generator functions", "yield without *"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Effect.gen() with yield* instead of plain generators",
	},
	"http-handler-boundary": {
		checks: ["Effect.runPromise outside boundaries"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Only use Effect.runPromise at application boundaries",
	},
	"parallel-results": {
		checks: ["Promise.all", "Promise.allSettled"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Effect.all() or Effect.all({ mode: 'either' })",
	},
	"promise-chain": {
		checks: ["async/await", ".then()", ".catch()", "Promise.resolve/reject"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Effect.gen() with yield* or pipe with Effect.map/flatMap",
	},
	"race-operations": {
		checks: ["Promise.race", "Promise.any"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Effect.race() or Effect.raceAll()",
	},
	"repeated-execution": {
		checks: ["setTimeout", "setInterval"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Effect.sleep() or Effect.repeat() with Schedule",
	},
	"wrap-external-async": {
		checks: ["async functions"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Effect.tryPromise() to wrap external async APIs",
	},

	// imperative category
	"array-splice-modification": {
		checks: ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"],
		severity: "error",
		certainty: "potential",
		suggestion:
			"Use Array.append, Array.prepend, or other immutable operations",
	},
	"building-object-mutation": {
		checks: ["let declarations", "++", "--", "+=", "-="],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use const with immutable operations, or Effect Ref for state",
	},
	"chunked-processing": {
		checks: ["manual batching loops"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Stream.grouped() or Effect.all with concurrency",
	},
	"conditional-accumulation": {
		checks: ["for...of with condition", "for...in"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Array.filter, Array.reduce, or Array.filterMap",
	},
	"effectful-iteration": {
		checks: ["for", "for...of", "for...in", "while", "do...while"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Effect.forEach() or Array.map/filter/reduce",
	},
	"flattening-nested-arrays": {
		checks: ["nested for loops"],
		severity: "error",
		certainty: "potential",
		suggestion: "Use Array.flatMap()",
	},
	"limited-concurrency": {
		checks: ["manual batching with Promise"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Effect.all() with { concurrency: N }",
	},
	"recursive-effect-processing": {
		checks: ["recursive functions without Effect"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use recursive Effect.gen() for tree traversal",
	},
	"splitting-array-by-condition": {
		checks: ["filter with opposite conditions"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Array.partition()",
	},

	// conditionals category
	"array-empty-check": {
		checks: ["array.length === 0", "array.length > 0"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Array.match() or Array.isNonEmpty()",
	},
	"match-literal-union": {
		checks: ["|| chains", "value === a || value === b"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Define Schema.Literal union and use Match.when with Schema.is",
	},
	"match-struct-conditions": {
		checks: ["&& chains"],
		severity: "warning",
		certainty: "potential",
		suggestion:
			"Define Schema.Struct capturing conditions and use Match.when with Schema.is",
	},
	"multi-condition-assignment": {
		checks: ["variable reassignment in if/else"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Define Schema types and use Match.when with Schema.is",
	},
	"multi-condition-matching": {
		checks: ["if/else chains"],
		severity: "warning",
		certainty: "potential",
		suggestion:
			"Define Schema types for each condition and use Match.when with Schema.is",
	},
	"nullable-option-match": {
		checks: ["!= null", "!== null", "!= undefined", "!== undefined"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Option.fromNullable() and Option.match()",
	},
	"numeric-classification": {
		checks: ["if with < > comparisons"],
		severity: "info",
		certainty: "potential",
		suggestion:
			"Define Schema types for each range and use Match.when with Schema.is",
	},
	"result-effect-match": {
		checks: ["success/error flag checks", "isError property"],
		severity: "warning",
		certainty: "potential",
		suggestion:
			"Use Either.match or Effect.match with Schema.TaggedClass result types",
	},
	"switch-to-match-tag": {
		checks: ["switch/case statements"],
		severity: "error",
		certainty: "definite",
		suggestion:
			"Use Match.type() with Match.tag() for discriminated union handling",
	},
	"ternary-to-match": {
		checks: ["ternary operators"],
		severity: "warning",
		certainty: "potential",
		suggestion:
			"Define Schema types for each case and use Match.when with Schema.is",
	},

	// errors category
	"all-either-mode": {
		checks: ["Promise.all without error handling"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Effect.all with { mode: 'either' } for individual results",
	},
	"catch-tag": {
		checks: ["error._tag === 'X'"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Effect.catchTag() for specific error handling",
	},
	"catch-tags": {
		checks: ["switch on error._tag"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Effect.catchTags() for handling multiple error types",
	},
	"conditional-fail": {
		checks: ["throw in if block"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Effect.fail() with a typed error",
	},
	"effect-try-promise": {
		checks: ["try/catch with async"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Effect.tryPromise() for async operations",
	},
	"effect-try": {
		checks: ["try/catch blocks"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Effect.try() for sync operations",
	},
	"map-error": {
		checks: ["catch with throw new Error"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Effect.mapError() to transform errors",
	},
	"or-else-fallback": {
		checks: ["catchAll for simple fallback"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Effect.orElse() for simple fallbacks",
	},
	"retry-schedule": {
		checks: ["manual retry loops"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Effect.retry() with Schedule",
	},
	"sandbox-catch-tags": {
		checks: ["catching defects"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Effect.sandbox() with catchTags for defect handling",
	},
	"timeout-fail": {
		checks: ["setTimeout for timeout"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Effect.timeout() or Effect.timeoutFail()",
	},
	"typed-errors": {
		checks: ["throw", "new Error()", "extends Error", "console.error"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Schema.TaggedError for typed errors",
	},

	// schema category
	"branded-ids": {
		checks: ["type UserId = string", "string IDs"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Schema.brand() for type-safe IDs",
	},
	"no-plain-error": {
		checks: ["extends Error"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Schema.TaggedError instead of extending Error",
	},
	"parse-json": {
		checks: ["JSON.parse()"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Schema.parseJson() for type-safe JSON parsing",
	},
	"schema-class-methods": {
		checks: ["Schema.Struct for entities with methods"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Schema.Class for entities that need methods",
	},
	"schema-class": {
		checks: ["interface", "type = { ... }"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Schema.Class or Schema.TaggedClass for data structures",
	},
	"schema-constructor": {
		checks: ["object literal construction"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Schema class constructors with make()",
	},
	"schema-filters": {
		checks: ["manual validation functions"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Schema.filter() for validation constraints",
	},
	"schema-literal": {
		checks: ["TypeScript enum"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Schema.Literal() union instead of enum",
	},
	"schema-tagged-error": {
		checks: ["Data.TaggedError"],
		severity: "warning",
		certainty: "definite",
		suggestion: "Use Schema.TaggedError for full codec support",
	},
	"schema-transform": {
		checks: ["manual type conversions"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Schema.transform() for type transformations",
	},
	"schema-union": {
		checks: ["TypeScript union types"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Schema.Union of TaggedClass variants",
	},
	"schema-unknown-legitimate": {
		checks: ["Schema.Any", "Schema.Unknown"],
		severity: "info",
		certainty: "potential",
		suggestion: "Only use Schema.Any/Unknown when genuinely unconstrained",
	},
	"tagged-union-state": {
		checks: ["optional properties for state"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Schema.TaggedClass union for state variants",
	},

	// code-style category
	"dom-element": {
		checks: ["<Type>value casting"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Schema.decodeUnknown() instead of type casting",
	},
	"dynamic-data": {
		checks: ["as any"],
		severity: "error",
		certainty: "definite",
		suggestion: "Fix the type or create a Schema for the data",
	},
	"dynamic-property-access": {
		checks: ["eslint-disable @typescript-eslint/no-explicit-any"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Record.get() or define a Schema",
	},
	"effect-fn-single-step": {
		checks: ["Effect.gen for single step"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Effect.fn() for simple single-step effects",
	},
	"effect-fn-transformation": {
		checks: ["plain functions returning Effect"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Effect.fn() or Effect.gen() for effectful functions",
	},
	"effect-gen-multi-step": {
		checks: ["multiple sequential operations"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Effect.gen() for multi-step sequential operations",
	},
	"exhaustive-match": {
		checks: ["eslint-disable switch exhaustive"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Match.exhaustive() for guaranteed exhaustiveness",
	},
	"fat-arrow-syntax": {
		checks: ["function keyword"],
		severity: "warning",
		certainty: "definite",
		suggestion: "Use arrow functions instead of function keyword",
	},
	"fix-types": {
		checks: ["@ts-ignore", "@ts-expect-error"],
		severity: "error",
		certainty: "definite",
		suggestion: "Fix the underlying type issue instead of suppressing",
	},
	"non-null-assertion": {
		checks: ["! operator"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Option or Effect instead of non-null assertion",
	},
	"ts-imports": {
		checks: ['from ".js"'],
		severity: "warning",
		certainty: "definite",
		suggestion: 'Import from ".ts" files directly',
	},
	"unknown-conversion": {
		checks: ["as unknown as T"],
		severity: "error",
		certainty: "definite",
		suggestion: "Define a Schema for type-safe conversion",
	},
	"unused-variable": {
		checks: ["eslint-disable no-unused-vars"],
		severity: "warning",
		certainty: "definite",
		suggestion: "Remove the unused variable or use it",
	},
	"validate-api-response": {
		checks: ["as Type"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Schema.decodeUnknown() for API response validation",
	},

	// native-apis category
	"composing-two-functions": {
		checks: ["f(g(x))"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Function.compose() or pipe()",
	},
	"conditional-transformation": {
		checks: ["(x) => x"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Function.identity",
	},
	"converting-to-entries": {
		checks: ["Object.keys", "Object.values", "Object.entries"],
		severity: "warning",
		certainty: "definite",
		suggestion: "Use Record.keys/values/toEntries from Effect",
	},
	"data-transformation-pipeline": {
		checks: [".map().filter().reduce()"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use pipe() with Effect's Array module",
	},
	"filter-and-transform-single-pass": {
		checks: [".filter().map()"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Array.filterMap() for single-pass transform",
	},
	"finding-with-default": {
		checks: [".find()"],
		severity: "warning",
		certainty: "definite",
		suggestion: "Use Array.findFirst() which returns Option",
	},
	"function-constant-value": {
		checks: ["() => constant"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Function.constant()",
	},
	"grouping-items-by-key": {
		checks: ["reduce to group"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Array.groupBy()",
	},
	"head-and-tail-access": {
		checks: ["array[0]", "array[array.length - 1]"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Array.head/last which return Option",
	},
	"omitting-fields": {
		checks: ["const { field, ...rest }"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Struct.omit()",
	},
	"removing-duplicates": {
		checks: ["[...new Set()]", "Array.from(new Set())"],
		severity: "warning",
		certainty: "definite",
		suggestion: "Use Array.dedupe()",
	},
	"reusable-pipeline": {
		checks: ["nested function calls"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use flow() for composing pipelines",
	},
	"safe-property-access": {
		checks: ["record[key]"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Record.get() which returns Option",
	},
	"struct-predicate": {
		checks: ["&& || predicates"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Predicate.and/or/not",
	},
	"tuple-transformation": {
		checks: ["tuple[0]", "tuple[1]"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Tuple.getFirst/getSecond",
	},

	// discriminated-unions category
	"match-tag-dispatch": {
		checks: ["if (x._tag ==="],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Match.tag() for discriminated union dispatch",
	},
	"partitioning-by-tag": {
		checks: [".filter(x => x._tag ==="],
		severity: "warning",
		certainty: "definite",
		suggestion: "Use Schema.is(Variant) in array predicates",
	},
	"runtime-validation": {
		checks: ["(x as unknown)._tag"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Schema.is() for runtime validation",
	},
	"schema-is-vs-match-tag": {
		checks: ["Match.tag with methods"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Schema.is() when you need class methods",
	},
	"schema-tagged-error": {
		checks: ["Data.TaggedError"],
		severity: "warning",
		certainty: "definite",
		suggestion: "Use Schema.TaggedError for full compatibility",
	},
	"switch-on-tag": {
		checks: ["switch (x._tag)"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use Schema.is(Variant) with Match.when()",
	},
	"use-union-directly": {
		checks: ["type Tag = x['_tag']"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use the union type directly instead of extracting _tag",
	},

	// services category
	"context-tag-api": {
		checks: ["fetch(", "axios.", "got.", "request("],
		severity: "error",
		certainty: "potential",
		suggestion: "Wrap API calls in a Context.Tag service",
	},
	"context-tag-filesystem": {
		checks: ["fs.", "readFile", "writeFile", "readdir"],
		severity: "error",
		certainty: "potential",
		suggestion: "Use @effect/platform FileSystem service",
	},
	"context-tag-repository": {
		checks: [".query(", "prisma.", "mongoose.", "sql`"],
		severity: "error",
		certainty: "potential",
		suggestion: "Wrap database access in a Context.Tag repository",
	},
	"layer-composition": {
		checks: ["Effect.provideService chain"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Layer.mergeAll() or Layer.provide() for composition",
	},
	"layer-effect": {
		checks: ["inline service creation"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Layer.effect() or Layer.succeed() for service layers",
	},
	"live-and-test-layers": {
		checks: ["missing test layer"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Create both *Live and *Test layers for each service",
	},
	"stateful-test-layer": {
		checks: ["stateless test mock"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Layer.effect with Ref for stateful test layers",
	},
	"wrap-third-party-sdk": {
		checks: ["stripe.", "sendgrid.", "aws-sdk"],
		severity: "error",
		certainty: "potential",
		suggestion: "Wrap third-party SDKs in Context.Tag services",
	},

	// testing category
	"arbitrary-responses": {
		checks: ['"not implemented"', "throw in stub"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Schema.Arbitrary for generated test responses",
	},
	"arbitrary-test-layer": {
		checks: ["hard-coded test values"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use Schema.Arbitrary for generated test layer values",
	},
	"effect-exit": {
		checks: ["try/catch for error assertions"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Effect.exit() and Exit.match() for error assertions",
	},
	"effect-vitest-imports": {
		checks: ['from "vitest"', "describe, it, expect"],
		severity: "error",
		certainty: "definite",
		suggestion: "Import from @effect/vitest instead",
	},
	"equality-testers": {
		checks: ["beforeAll without addEqualityTesters"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Call addEqualityTesters() in beforeAll for Effect equality",
	},
	"it-effect-prop": {
		checks: ["hard-coded test data"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use it.effect.prop() with Schema for property-based testing",
	},
	"it-effect": {
		checks: ["Effect.runPromise in test"],
		severity: "error",
		certainty: "definite",
		suggestion: "Use it.effect() from @effect/vitest",
	},
	"it-live": {
		checks: ["it.effect with real time"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use it.live() when you need real clock/environment",
	},
	"it-prop-schema": {
		checks: ["fc.integer", "fc.string", "raw fast-check"],
		severity: "warning",
		certainty: "definite",
		suggestion: "Use it.prop() with Schema.Arbitrary",
	},
	"it-scoped": {
		checks: ["manual resource cleanup in test"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use it.scoped() for automatic resource cleanup",
	},
	"layer-effect-prop": {
		checks: ["partial test coverage"],
		severity: "info",
		certainty: "potential",
		suggestion: "Combine layer() with it.effect.prop() for full coverage",
	},
	"layer-test": {
		checks: ["live services in tests"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use layer() from @effect/vitest with test layers",
	},
	"property-based": {
		checks: ["manual property tests"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use it.effect.prop() for property-based testing",
	},
	"schema-constraints": {
		checks: [".filter(", "fc.filter"],
		severity: "warning",
		certainty: "potential",
		suggestion: "Use Schema filters instead of fast-check .filter()",
	},
	"test-clock": {
		checks: ["TestClock.layer"],
		severity: "info",
		certainty: "definite",
		suggestion: "it.effect() includes TestClock automatically",
	},

	// comments category
	"branded-type-definition": {
		checks: ["JSDoc restating type"],
		severity: "info",
		certainty: "potential",
		suggestion: "Remove JSDoc that merely restates the type definition",
	},
	"code-organization": {
		checks: ["// ===", "// ---", "// ###"],
		severity: "info",
		certainty: "definite",
		suggestion: "Use file organization and clear naming instead of markers",
	},
	"effect-pipeline": {
		checks: ["// get", "// map", "// filter"],
		severity: "info",
		certainty: "potential",
		suggestion: "Remove obvious comments; Effect code is self-documenting",
	},
	"function-documentation": {
		checks: ["@param {string}", "@returns"],
		severity: "info",
		certainty: "potential",
		suggestion: "Remove JSDoc that repeats the type signature",
	},
	"function-implementation": {
		checks: ["// convert", "// calculate", "// check"],
		severity: "info",
		certainty: "potential",
		suggestion: "Remove comments describing WHAT code does",
	},
	"legitimate-why-comment": {
		checks: [],
		severity: "info",
		certainty: "potential",
		suggestion: "Only add comments explaining WHY when non-obvious",
	},
	"naming-over-commenting": {
		checks: ["// this is"],
		severity: "info",
		certainty: "potential",
		suggestion: "Use better variable/function names instead of comments",
	},
	"todo-comments": {
		checks: ["// TODO", "// FIXME", "// HACK"],
		severity: "warning",
		certainty: "definite",
		suggestion: "Remove TODO comments - either fix it or remove it",
	},
};

// Generate detector files
const CATEGORIES_DIR = "./categories";

console.log("\n=== Generating Per-Rule Detectors ===\n");

for (const mapping of ruleMappings) {
	const ruleDir = path.join(CATEGORIES_DIR, mapping.category, mapping.ruleId);
	const detectorPath = path.join(ruleDir, `${mapping.ruleId}.detector.ts`);

	// Get detection pattern info
	const pattern = detectionPatterns[mapping.originalName];
	if (!pattern) {
		console.log(
			`⚠️  No pattern for: ${mapping.category}/${mapping.originalName}`,
		);
		continue;
	}

	const detectorContent = `/**
 * ${mapping.ruleId}: ${mapping.originalName}
 *
 * Rule: ${mapping.rule}
 * Category: ${mapping.category}
 */

import * as ts from "typescript";
import type { DetectionContext, RuleDetector } from "../../../detectors/rule-detector.js";
import {
	createViolationHelper,
} from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "${mapping.ruleId}",
	category: "${mapping.category}",
	originalName: "${mapping.originalName}",
	rule: "${mapping.rule.replace(/"/g, '\\"')}",
	example: "${mapping.example.replace(/"/g, '\\"')}",
} as const;

const violation = createViolationHelper(meta, "${pattern.severity}", "${pattern.certainty}");

/**
 * Detect violations of: ${mapping.rule}
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for ${mapping.originalName}
		// Checks for: ${pattern.checks.join(", ")}

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "${pattern.severity}",
	defaultCertainty: "${pattern.certainty}",
	detect,
};

export default detector;
`;

	fs.writeFileSync(detectorPath, detectorContent);
	console.log(
		`Created: ${mapping.category}/${mapping.ruleId}/${mapping.ruleId}.detector.ts`,
	);
}

console.log("\n=== Creating Category Detector Indexes ===\n");

// Group rules by category
const rulesByCategory = new Map<string, RuleMapping[]>();
for (const mapping of ruleMappings) {
	if (!rulesByCategory.has(mapping.category)) {
		rulesByCategory.set(mapping.category, []);
	}
	rulesByCategory.get(mapping.category)?.push(mapping);
}

// Create index files for each category
for (const [category, rules] of rulesByCategory) {
	const categoryDir = path.join(CATEGORIES_DIR, category);
	const indexPath = path.join(categoryDir, "_detectors.ts");

	const imports = rules
		.map(
			(r) =>
				`import { detector as ${r.originalName.replace(/-/g, "_")} } from "./${r.ruleId}/${r.ruleId}.detector.js";`,
		)
		.join("\n");

	const exports = rules
		.map((r) => `\t${r.originalName.replace(/-/g, "_")},`)
		.join("\n");

	const indexContent = `/**
 * ${category} category detectors
 *
 * Auto-generated index of all rule detectors in this category
 */

${imports}

export const detectors = [
${exports}
] as const;

export default detectors;
`;

	fs.writeFileSync(indexPath, indexContent);
	console.log(`Created: ${category}/_detectors.ts`);
}

console.log("\n=== Migration Complete ===");
console.log(`Generated ${ruleMappings.length} detector files`);
console.log(`\nNext steps:`);
console.log(`1. Implement the detection logic in each detector file`);
console.log(`2. Update the main runner to use the new per-rule detectors`);
