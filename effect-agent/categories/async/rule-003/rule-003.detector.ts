/**
 * rule-003: http-handler-boundary
 *
 * Rule: Never use Effect.runPromise except at application boundaries
 */

import * as ts from "typescript";
import {
	SNIPPET_MAX_LENGTH,
	type Violation,
} from "../../../detectors/types.js";

const meta = {
	id: "rule-003",
	category: "async",
	name: "http-handler-boundary",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	// Check if this looks like an entry point / boundary
	const fileName = filePath.toLowerCase();
	const isBoundary =
		fileName.includes("main") ||
		fileName.includes("index") ||
		fileName.includes("server") ||
		fileName.includes("handler") ||
		fileName.includes("route") ||
		fileName.includes("controller") ||
		fileName.includes("entry") ||
		fileName.includes("app.");

	const visit = (node: ts.Node) => {
		// Detect Effect.runPromise / Effect.runSync calls
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "Effect") {
				if (
					method === "runPromise" ||
					method === "runSync" ||
					method === "runPromiseExit" ||
					method === "runSyncExit"
				) {
					// If not at a boundary, flag it
					if (!isBoundary) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message: `Effect.${method}() should only be used at application boundaries`,
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
							certainty: "potential",
							suggestion:
								"Keep Effect.run* at entry points (main, handlers, routes); compose Effects instead of running them mid-flow",
						});
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
