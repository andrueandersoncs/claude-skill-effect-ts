/**
 * rule-008: wrap-third-party-sdk
 *
 * Rule: Never call third-party SDKs directly; wrap in a Context.Tag service
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "services",
	name: "wrap-third-party-sdk",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect axios calls
		if (ts.isCallExpression(node)) {
			const callText = node.expression.getText(sourceFile);

			if (callText === "axios" || callText.startsWith("axios.")) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "axios should be wrapped in an HttpClient service",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Create a Context.Tag service wrapping axios with Live/Test layers",
				});
			}
		}

		// Detect process.env access
		if (
			ts.isPropertyAccessExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const objExpr = node.expression;
			if (
				ts.isIdentifier(objExpr.expression) &&
				objExpr.expression.text === "process" &&
				objExpr.name.text === "env"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: `process.env.${node.name.text} should use Effect Config`,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "warning",
					certainty: "potential",
					suggestion: `Use Config.string('${node.name.text}') with ConfigProvider`,
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
