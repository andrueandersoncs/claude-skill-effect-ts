/**
 * Effect-TS Rule Violation Detectors
 *
 * A static analysis system for detecting Effect-TS anti-patterns
 * using per-rule detectors organized by category.
 */

export type {
	DetectionContext,
	RuleDetector,
	RuleMetadata,
} from "./rule-detector.js";
export {
	createPositionHelper,
	createViolationHelper,
} from "./rule-detector.js";
export {
	detectDirectory,
	detectFile,
	formatSummary,
	formatViolations,
	getAllDetectors,
	getCategoryDetectors,
	getCategoryNames,
} from "./runner.js";

export * from "./types.js";
