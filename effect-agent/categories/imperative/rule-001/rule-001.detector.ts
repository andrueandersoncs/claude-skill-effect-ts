/**
 * rule-001: array-splice-modification
 *
 * Rule: Never mutate variables (let, push, pop, splice); use immutable operations
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "imperative",
	name: "array-splice-modification",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect Array.push, Array.pop, Array.splice, etc.
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const methodName = node.expression.name.text;
			const mutatingMethods = [
				"push",
				"pop",
				"shift",
				"unshift",
				"splice",
				"sort",
				"reverse",
				"fill",
				"copyWithin",
			];

			if (mutatingMethods.includes(methodName)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: `Array.${methodName}() mutates the array; use Effect Array module`,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "potential",
					suggestion: `Use Array.append, Array.prepend, Array.remove, or other immutable operations`,
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
