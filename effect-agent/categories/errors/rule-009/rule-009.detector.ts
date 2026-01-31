/**
 * rule-009: retry-schedule
 *
 * Rule: Never use manual retry loops; use Effect.retry with Schedule
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-009",
	category: "errors",
	name: "retry-schedule",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect while/for loops with retry-like patterns
		if (ts.isWhileStatement(node) || ts.isForStatement(node)) {
			const bodyText = node.getText(sourceFile).toLowerCase();

			if (
				(bodyText.includes("retry") ||
					bodyText.includes("attempt") ||
					bodyText.includes("try") ||
					bodyText.includes("tries")) &&
				(bodyText.includes("catch") ||
					bodyText.includes("error") ||
					bodyText.includes("fail"))
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Manual retry loop; use Effect.retry with Schedule",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Use effect.pipe(Effect.retry(Schedule.exponential('100 millis').pipe(Schedule.jittered, Schedule.compose(Schedule.recurs(5)))))",
				});
			}
		}

		// Detect recursive retry functions
		if (ts.isFunctionDeclaration(node) && node.name && node.body) {
			const funcName = node.name.text.toLowerCase();
			const bodyText = node.body.getText(sourceFile);

			if (
				(funcName.includes("retry") || funcName.includes("attempt")) &&
				bodyText.includes(node.name.text)
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Recursive retry function; use Effect.retry with Schedule",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: `function ${node.name.text}(...)`,
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Use Effect.retry(Schedule.recurs(n)) for simple retries or Schedule.exponential for backoff",
				});
			}
		}

		// Detect variables tracking retry count
		if (ts.isVariableDeclaration(node) && node.name && node.initializer) {
			const name = node.name.getText(sourceFile).toLowerCase();
			if (
				(name.includes("retry") ||
					name.includes("attempt") ||
					name.includes("tries")) &&
				node.initializer.getText(sourceFile) === "0"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "Manual retry counter; use Effect.retry with Schedule",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile),
					severity: "info",
					certainty: "potential",
					suggestion:
						"Effect.retry handles retry counting automatically with Schedule combinators",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
