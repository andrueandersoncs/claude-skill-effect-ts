/**
 * rule-006: effect-try
 *
 * Rule: Never use try/catch blocks; use Effect.try()
 * Category: errors
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "errors",
	originalName: "effect-try",
	rule: "Never use try/catch blocks; use Effect.try()",
	example: "Multiple try/catch blocks",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use try/catch blocks; use Effect.try()
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect try/catch statements
		if (ts.isTryStatement(node)) {
			violations.push(
				violation(
					context,
					node,
					"try/catch blocks should be replaced with Effect.try()",
					"Use Effect.try() for sync operations or Effect.tryPromise() for async",
				),
			);
		}

		// Detect catch clauses with untyped error parameter
		if (ts.isCatchClause(node)) {
			const param = node.variableDeclaration;
			let hasTypedError = false;

			if (param?.type) {
				const typeText = param.type.getText(context.sourceFile);
				hasTypedError = typeText !== "any" && typeText !== "unknown";
			}

			violations.push(
				violation(
					context,
					node,
					hasTypedError
						? "catch clause should be replaced with Effect error handling"
						: "catch clause has untyped error parameter",
					"Use Effect.catchTag() or Effect.catchAll() with typed errors",
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
