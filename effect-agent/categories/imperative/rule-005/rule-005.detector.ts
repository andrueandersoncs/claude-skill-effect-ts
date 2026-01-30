/**
 * rule-005: effectful-iteration
 *
 * Rule: Never use for/while/do loops; use Array.map/filter/reduce or Effect.forEach
 * Category: imperative
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "imperative",
	originalName: "effectful-iteration",
	rule: "Never use for/while/do loops; use Array.map/filter/reduce or Effect.forEach",
	example: "Effectful iteration",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use for/while/do loops; use Array.map/filter/reduce or Effect.forEach
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect for loops
		if (ts.isForStatement(node)) {
			violations.push(
				violation(
					context,
					node,
					"Use Effect.forEach or Array methods instead of for loops",
					"Replace with Effect.forEach() or Array.map/filter/reduce",
				),
			);
		}

		// Detect for...of loops
		if (ts.isForOfStatement(node)) {
			violations.push(
				violation(
					context,
					node,
					"Use Effect.forEach or Array methods instead of for...of loops",
					"Replace with Effect.forEach() or Array.map/filter/reduce",
				),
			);
		}

		// Detect for...in loops
		if (ts.isForInStatement(node)) {
			violations.push(
				violation(
					context,
					node,
					"Use Record.toEntries or Object methods instead of for...in loops",
					"Replace with Record.toEntries() or Record.keys()",
				),
			);
		}

		// Detect while loops
		if (ts.isWhileStatement(node)) {
			violations.push(
				violation(
					context,
					node,
					"Use Effect.loop, Effect.iterate, or recursion instead of while loops",
					"Replace with Effect.loop() or recursive Effect.gen()",
				),
			);
		}

		// Detect do...while loops
		if (ts.isDoStatement(node)) {
			violations.push(
				violation(
					context,
					node,
					"Use Effect.loop or recursion instead of do...while loops",
					"Replace with Effect.loop() or recursive Effect.gen()",
				),
			);
		}

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "error",
	defaultCertainty: "definite",
	detect,
};

export default detector;
