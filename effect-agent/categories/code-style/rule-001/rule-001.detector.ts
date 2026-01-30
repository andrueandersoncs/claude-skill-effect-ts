/**
 * rule-001: dom-element
 *
 * Rule: Never use angle bracket casting (<Type>value); use Schema
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "code-style",
	name: "dom-element",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect angle bracket type assertions (<Type>value)
		if (ts.isTypeAssertion(node)) {
			const { line, character } = sourceFile.getLineAndCharacterOfPosition(
				node.getStart(),
			);
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: "Angle bracket type assertion; use Schema validation instead",
				filePath,
				line: line + 1,
				column: character + 1,
				snippet: node.getText(sourceFile).slice(0, 80),
				severity: "warning",
				certainty: "definite",
				suggestion:
					"Use Schema.decodeUnknown(MySchema)(value) for runtime validation instead of <Type>casting",
			});
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
