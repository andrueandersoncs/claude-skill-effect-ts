/**
 * rule-011: layer-effect-prop
 *
 * Rule: Never test with partial coverage; combine layer() with it.effect.prop
 */

import type * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-011",
	category: "testing",
	name: "layer-effect-prop",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Only check test files (and .bad.ts for testing the detector)
	if (
		!filePath.includes(".test.") &&
		!filePath.includes(".spec.") &&
		!filePath.includes("__tests__") &&
		!filePath.includes(".bad.ts")
	) {
		return violations;
	}

	const fullText = sourceFile.getFullText();

	// Check if file has describe.layer or layer() but no property-based tests
	const hasDescribeLayer =
		fullText.includes("describe.layer") ||
		fullText.includes("it.layer") ||
		/\blayer\s*\(/.test(fullText);
	const hasPropertyTests =
		fullText.includes("it.prop") ||
		fullText.includes("it.effect.prop") ||
		fullText.includes(".prop(");

	if (hasDescribeLayer && !hasPropertyTests) {
		// This is just informational - suggest combining layer with prop
		violations.push({
			ruleId: meta.id,
			category: meta.category,
			message:
				"Test suite uses layer() but no property-based tests; consider it.effect.prop for fuller coverage",
			filePath,
			line: 1,
			column: 1,
			snippet: "describe.layer without property-based tests",
			severity: "info",
			certainty: "potential",
			suggestion:
				"Combine layer() with it.effect.prop() for comprehensive integration testing with generated data",
		});
	}

	return violations;
};
