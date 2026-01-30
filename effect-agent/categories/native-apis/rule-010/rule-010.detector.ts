/**
 * rule-010: omitting-fields
 *
 * Rule: Never use destructuring to omit fields; use Struct.omit
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-010",
	category: "native-apis",
	name: "omitting-fields",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect const { unwanted, ...rest } = obj pattern for omitting
		if (ts.isVariableDeclaration(node) && node.initializer) {
			const name = node.name;

			if (ts.isObjectBindingPattern(name)) {
				// Check if there's a rest element
				const hasRest = name.elements.some((e) => e.dotDotDotToken);
				const nonRestElements = name.elements.filter((e) => !e.dotDotDotToken);

				// If we have both rest and non-rest elements, it might be omitting
				if (hasRest && nonRestElements.length > 0) {
					// Check if non-rest elements are unused (prefixed with _)
					const possiblyOmitting = nonRestElements.some((e) => {
						const elementName = e.name.getText(sourceFile);
						return elementName.startsWith("_");
					});

					if (possiblyOmitting) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: meta.id,
							category: meta.category,
							message: "Destructuring to omit fields; use Struct.omit",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 80),
							severity: "info",
							certainty: "potential",
							suggestion:
								"Use Struct.omit(obj, 'field1', 'field2') for clearer intent",
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
