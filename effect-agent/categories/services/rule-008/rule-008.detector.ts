/**
 * rule-008: wrap-third-party-sdk
 *
 * Rule: Never call third-party SDKs directly; wrap in a Context.Tag service
 * Category: services
 */

import * as ts from "typescript";
import type {
	DetectionContext,
	RuleDetector,
} from "../../../detectors/rule-detector.js";
import { createViolationHelper } from "../../../detectors/rule-detector.js";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "services",
	originalName: "wrap-third-party-sdk",
	rule: "Never call third-party SDKs directly; wrap in a Context.Tag service",
	example: "Third-party SDK usage (Stripe, SendGrid, AWS, etc.)",
} as const;

const violation = createViolationHelper(meta, "error", "potential");

/**
 * Detect violations of: Never call third-party SDKs directly; wrap in a Context.Tag service
 */
export const detect = (context: DetectionContext): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// TODO: Implement detection logic for wrap-third-party-sdk
		// Checks for: stripe., sendgrid., aws-sdk

		ts.forEachChild(node, visit);
	};

	visit(context.sourceFile);
	return violations;
};

export const detector: RuleDetector = {
	meta,
	defaultSeverity: "error",
	defaultCertainty: "potential",
	detect,
};

export default detector;
