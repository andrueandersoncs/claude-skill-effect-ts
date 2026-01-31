/**
 * rule-008: wrap-external-async
 *
 * Rule: Never use async functions; use Effect.gen with yield*
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-008",
	category: "async",
	name: "wrap-external-async",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect async function declarations
		if (ts.isFunctionDeclaration(node)) {
			if (node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "async function declaration; use Effect.gen instead",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: `async function ${node.name?.text || "anonymous"}(...)`,
					severity: "warning",
					certainty: "definite",
					suggestion:
						"Replace async function with Effect.gen(function* () { ... yield* Effect.tryPromise(...) })",
				});
			}
		}

		// Detect async arrow functions
		if (ts.isArrowFunction(node)) {
			if (node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "async arrow function; use Effect.gen instead",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "warning",
					certainty: "definite",
					suggestion:
						"Replace async arrow with Effect.gen(function* () { ... yield* Effect.tryPromise(...) })",
				});
			}
		}

		// Detect async method declarations
		if (ts.isMethodDeclaration(node)) {
			if (node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "async method; use Effect.gen instead",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: `async ${node.name?.getText(sourceFile) || "method"}(...)`,
					severity: "warning",
					certainty: "definite",
					suggestion:
						"Replace async method with method returning Effect.gen(function* () { ... })",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
