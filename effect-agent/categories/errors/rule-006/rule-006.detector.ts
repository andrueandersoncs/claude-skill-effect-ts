/**
 * rule-006: effect-try
 *
 * Rule: Never use try/catch blocks; use Effect.try()
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "errors",
	name: "effect-try",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect try/catch statements
		if (ts.isTryStatement(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "try/catch blocks should be replaced with Effect.try()",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 150),
				severity: "error",
				certainty: "definite",
				suggestion:
					"Use Effect.try() for sync operations or Effect.tryPromise() for async",
			});
		}

		// Detect catch clauses with untyped error parameter
		if (ts.isCatchClause(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);

			// Check if error parameter has 'any' or 'unknown' type annotation
			const param = node.variableDeclaration;
			let hasTypedError = false;

			if (param?.type) {
				const typeText = param.type.getText(sourceFile);
				hasTypedError = typeText !== "any" && typeText !== "unknown";
			}

			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: hasTypedError
					? "catch clause should be replaced with Effect error handling"
					: "catch clause has untyped error parameter",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 100),
				severity: "error",
				certainty: "definite",
				suggestion:
					"Use Effect.catchTag() or Effect.catchAll() with typed errors",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
