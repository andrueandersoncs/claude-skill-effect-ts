/**
 * rule-005: equality-testers
 *
 * Rule: Never skip addEqualityTesters(); call it for Effect type equality
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

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

	// Only check test setup files (and .bad.ts for testing the detector)
	if (
		!filePath.includes("setup") &&
		!filePath.includes("vitest.config") &&
		!filePath.includes("test-utils") &&
		!filePath.includes(".bad.ts")
	) {
		return violations;
	}

	const fullText = sourceFile.getFullText();

	// Check if file uses Effect types that need equality testers (Option, Either, etc.)
	const hasEffectTypes =
		fullText.includes("Option.") ||
		fullText.includes("Either.") ||
		fullText.includes("Exit.") ||
		fullText.includes("Cause.") ||
		fullText.includes("Chunk.");

	// Check if file uses expect().toEqual on Effect types
	const hasToEqualWithEffectTypes =
		fullText.includes("toEqual") && hasEffectTypes;

	if (hasToEqualWithEffectTypes) {
		// Look for an actual addEqualityTesters() call (not just in comments)
		let hasAddEqualityTestersCall = false;

		const visit = (node: ts.Node) => {
			if (ts.isCallExpression(node)) {
				const callText = node.expression.getText(sourceFile);
				if (callText === "addEqualityTesters") {
					hasAddEqualityTestersCall = true;
				}
			}
			ts.forEachChild(node, visit);
		};

		visit(sourceFile);

		if (!hasAddEqualityTestersCall) {
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message:
					"Test uses Effect types with toEqual() but missing addEqualityTesters() call",
				filePath,
				line: 1,
				column: 1,
				snippet: "Missing addEqualityTesters() for Effect type equality",
				certainty: "potential",
				suggestion:
					"Add: import { addEqualityTesters } from '@effect/vitest'; addEqualityTesters();",
			});
		}
	}

	return violations;
};
