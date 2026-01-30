/**
 * Effect-TS Rule Violation Detectors
 *
 * A static analysis system for detecting Effect-TS anti-patterns
 */

export * from "./categories/index.js";
export {
	detectDirectory,
	detectFile,
	formatSummary,
	formatViolations,
} from "./runner.js";
export * from "./types.js";
