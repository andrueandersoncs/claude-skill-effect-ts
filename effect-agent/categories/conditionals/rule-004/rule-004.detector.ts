/**
 * rule-004: multi-condition-assignment
 *
 * Rule: Never use conditional variable reassignment; define Schema types and use Match.when with Schema.is
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-004",
	category: "conditionals",
	name: "multi-condition-assignment",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect let declarations followed by if/else reassignment
		if (ts.isVariableStatement(node)) {
			const declarations = node.declarationList.declarations;
			if (
				node.declarationList.flags & ts.NodeFlags.Let &&
				declarations.length === 1
			) {
				const decl = declarations[0];
				const varName = decl.name.getText(sourceFile);

				// Look at the next sibling for if statement
				const parent = node.parent;
				if (ts.isBlock(parent) || ts.isSourceFile(parent)) {
					const statements = parent.statements
						? Array.from(parent.statements)
						: [];
					const idx = statements.indexOf(node);
					if (idx >= 0 && idx + 1 < statements.length) {
						const nextStmt = statements[idx + 1];
						if (ts.isIfStatement(nextStmt)) {
							// Check if the if body assigns to our variable
							const ifText = nextStmt.getText(sourceFile);
							if (
								ifText.includes(`${varName} =`) ||
								ifText.includes(`${varName}=`)
							) {
								const { line, character } =
									sourceFile.getLineAndCharacterOfPosition(node.getStart());
								violations.push({
									ruleId: meta.id,
									category: meta.category,
									message:
										"Variable with conditional reassignment; use Match.value for declarative assignment",
									filePath,
									line: line + 1,
									column: character + 1,
									snippet: `let ${varName} = ... followed by if/else assignment`,
									severity: "warning",
									certainty: "potential",
									suggestion:
										"Use Match.value(input).pipe(Match.when(..., () => value1), Match.when(..., () => value2), Match.exhaustive)",
								});
							}
						}
					}
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
