/**
 * rule-003: match-struct-conditions
 *
 * Rule: Never use combined AND conditions (&&); define a Schema.Struct capturing all conditions and use Match.when with Schema.is
 * Category: conditionals
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "conditionals",
	originalName: "match-struct-conditions",
	rule: "Never use combined AND conditions (&&); define a Schema.Struct capturing all conditions and use Match.when with Schema.is",
	example: "Matching multiple conditions with Schema.Struct",
} as const;

const violation = createViolationHelper(meta, "warning", "potential");

/**
 * Detect violations of: Never use combined AND conditions (&&); define a Schema.Struct capturing all conditions and use Match.when with Schema.is
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for match-struct-conditions
		// Checks for: && chains

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "warning",
	defaultCertainty: "potential",
	detect,
};

export default detector;
