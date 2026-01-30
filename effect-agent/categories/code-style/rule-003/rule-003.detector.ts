/**
 * rule-003: dynamic-property-access
 *
 * Rule: Never use eslint-disable for any-type errors; use Schema
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "code-style",
	name: "dynamic-property-access",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect dynamic property access obj[key] (should use Struct module)
		if (
			ts.isElementAccessExpression(node) &&
			!ts.isNumericLiteral(node.argumentExpression) &&
			!ts.isStringLiteral(node.argumentExpression)
		) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "Dynamic property access may be unsafe; consider Struct.get()",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 80),
				severity: "info",
				certainty: "potential",
				suggestion: "Use Struct.get() or Record.get() for safe property access",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
