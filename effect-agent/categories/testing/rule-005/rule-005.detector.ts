/**
 * rule-005: equality-testers
 *
 * Rule: Never skip addEqualityTesters(); call it for Effect type equality
 */

import type * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "testing",
	name: "equality-testers",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Only check test setup files
	if (
		!filePath.includes("setup") &&
		!filePath.includes("vitest.config") &&
		!filePath.includes("test-utils")
	) {
		return violations;
	}

	const fullText = sourceFile.getFullText();

	// Check if file imports from @effect/vitest but doesn't call addEqualityTesters
	const hasEffectVitestImport =
		fullText.includes("@effect/vitest") ||
		fullText.includes("from 'effect'") ||
		fullText.includes('from "effect"');

	if (hasEffectVitestImport) {
		const hasAddEqualityTesters = fullText.includes("addEqualityTesters");

		if (!hasAddEqualityTesters) {
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "Test setup uses Effect but missing addEqualityTesters() call",
				filePath,
				line: 1,
				column: 1,
				snippet: "Missing addEqualityTesters() in test setup",
				severity: "warning",
				certainty: "potential",
				suggestion:
					"Add: import { addEqualityTesters } from '@effect/vitest'; addEqualityTesters();",
			});
		}
	}

	return violations;
};
