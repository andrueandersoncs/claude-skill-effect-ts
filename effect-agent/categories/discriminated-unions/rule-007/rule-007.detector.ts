/**
 * rule-007: use-union-directly
 *
 * Rule: Never extract types from ._tag; use the union type directly
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-007",
	category: "discriminated-unions",
	name: "use-union-directly",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// Detect manual union type definitions with _tag property
		if (ts.isTypeAliasDeclaration(node) && ts.isUnionTypeNode(node.type)) {
			// Check if union members have _tag property
			const hasTaggedMembers = node.type.types.some((type) => {
				if (ts.isTypeLiteralNode(type)) {
					return type.members.some(
						(member) =>
							ts.isPropertySignature(member) &&
							ts.isIdentifier(member.name) &&
							member.name.text === "_tag",
					);
				}
				return false;
			});

			if (hasTaggedMembers) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: `Tagged union type '${node.name.text}' should use Schema.Union of Schema.TaggedClass`,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, 100),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Define each variant as Schema.TaggedClass and combine with Schema.Union",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
