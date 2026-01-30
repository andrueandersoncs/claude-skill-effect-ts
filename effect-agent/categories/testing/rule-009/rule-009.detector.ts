/**
 * rule-009: it-prop-schema
 *
 * Rule: Never use raw fc.integer/fc.string; use it.prop with Schema
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-009",
	category: "testing",
	name: "it-prop-schema",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Only check test files (and .bad.ts for testing the detector)
	if (
		!filePath.includes(".test.") &&
		!filePath.includes(".spec.") &&
		!filePath.includes("__tests__") &&
		!filePath.includes(".bad.ts")
	) {
		return violations;
	}

	const visit = (node: ts.Node) => {
		// Detect fc.* (fast-check) arbitrary usage
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "fc") {
				const rawArbitraries = [
					"integer",
					"nat",
					"string",
					"boolean",
					"date",
					"array",
					"object",
					"record",
					"tuple",
					"float",
					"double",
				];

				if (rawArbitraries.includes(method)) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: meta.id,
						category: meta.category,
						message: `fc.${method}() - use Schema with it.prop instead of raw fast-check`,
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 80),
						severity: "warning",
						certainty: "definite",
						suggestion:
							"Use it.prop({ value: Schema.Number }) or it.effect.prop({ value: Schema.String }) with Schema-defined types",
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
