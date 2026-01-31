/**
 * rule-004: layer-composition
 *
 * Rule: Never provide services ad-hoc; compose layers with Layer.mergeAll/provide
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-004",
	category: "services",
	name: "layer-composition",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect multiple .provide() calls in a chain
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			node.expression.name.text === "provide"
		) {
			// Check if this is chained with another provide
			const inner = node.expression.expression;
			if (
				ts.isCallExpression(inner) &&
				ts.isPropertyAccessExpression(inner.expression) &&
				inner.expression.name.text === "provide"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Multiple .provide() calls; compose layers with Layer.mergeAll",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Use Layer.mergeAll(Layer1, Layer2, ...) then single .provide(composedLayer)",
				});
			}
		}

		// Detect Effect.provideService calls (ad-hoc service provision)
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (
				ts.isIdentifier(obj) &&
				obj.text === "Effect" &&
				method === "provideService"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Effect.provideService for ad-hoc provision; use Layer composition",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Create a Layer with Layer.succeed(Service, impl) and compose with other layers",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
