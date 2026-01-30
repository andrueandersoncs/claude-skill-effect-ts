/**
 * rule-002: generator-yield
 *
 * Rule: Never use yield or await in Effect.gen; use yield*
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-002",
	category: "async",
	name: "generator-yield",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect generator functions
		if (
			(ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) &&
			node.asteriskToken
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "Generator functions should not be mixed with Effect",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 80),
				severity: "warning",
				certainty: "potential",
				suggestion: "Use Effect.gen() with yield* instead of plain generators",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
