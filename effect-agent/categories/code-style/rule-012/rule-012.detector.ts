/**
 * rule-012: unknown-conversion
 *
 * Rule: Never use 'as unknown as T'; define a Schema instead
 * Category: code-style
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-012",
	category: "code-style",
	originalName: "unknown-conversion",
	rule: "Never use 'as unknown as T'; define a Schema instead",
	example: "Converting between types",
} as const;

const violation = createViolationHelper(meta, "error", "definite");

/**
 * Detect violations of: Never use 'as unknown as T'; define a Schema instead
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for unknown-conversion
		// Checks for: as unknown as T

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
