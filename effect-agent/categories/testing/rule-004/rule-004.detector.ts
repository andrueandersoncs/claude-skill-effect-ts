/**
 * rule-004: effect-vitest-imports
 *
 * Rule: Never import from vitest directly; use @effect/vitest
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-004",
	category: "testing",
	name: "effect-vitest-imports",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Only check test files
	if (
		!filePath.includes(".test.") &&
		!filePath.includes(".spec.") &&
		!filePath.includes("__tests__")
	) {
		return violations;
	}

	const sourceCode = sourceFile.getFullText();
	let hasEffectVitestImport = false;
	let hasVitestImport = false;

	const visit = (node: ts.Node) => {
		if (ts.isImportDeclaration(node)) {
			const moduleSpecifier = node.moduleSpecifier;
			if (ts.isStringLiteral(moduleSpecifier)) {
				const moduleName = moduleSpecifier.text;
				if (moduleName === "@effect/vitest") {
					hasEffectVitestImport = true;
				}
				if (moduleName === "vitest") {
					hasVitestImport = true;
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);

	// Check for missing @effect/vitest import in test files with Effects
	if (!hasEffectVitestImport && hasVitestImport) {
		const hasEffectUsage =
			sourceCode.includes("Effect.") || sourceCode.includes("yield*");
		if (hasEffectUsage) {
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message:
					"Test file uses Effect but imports from 'vitest' instead of '@effect/vitest'",
				filePath,
				line: 1,
				column: 1,
				snippet: "import { ... } from 'vitest'",
				severity: "error",
				certainty: "potential",
				suggestion:
					"Replace 'vitest' import with '@effect/vitest' for Effect test utilities",
			});
		}
	}

	return violations;
};
