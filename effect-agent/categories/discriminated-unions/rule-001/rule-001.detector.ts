/**
 * rule-001: match-tag-dispatch
 *
 * Rule: Never use if/else, switch/case, or direct ._tag access on discriminated unions
 *
 * This detector consolidates detection from:
 * - discriminated-unions/rule-001 (if/else on ._tag)
 * - discriminated-unions/rule-006 (switch on ._tag)
 * - discriminated-unions/rule-007 (extracting ._tag as type)
 * - conditionals/rule-009 (switch statements for discriminated unions)
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-001",
	category: "discriminated-unions",
	name: "match-tag-dispatch",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];

	const visit = (node: ts.Node) => {
		// ------------------------------------------------
		// Detection 1: Switch statements on ._tag
		// ------------------------------------------------
		if (ts.isSwitchStatement(node)) {
			const expressionText = node.expression.getText(sourceFile);

			if (
				expressionText.includes("._tag") ||
				expressionText.endsWith("._tag")
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"switch on ._tag should use Match.tag() for exhaustive matching",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Replace with Match.type<UnionType>().pipe(Match.tag('Tag1', ...), ...)",
				});
			}
		}

		// ------------------------------------------------
		// Detection 2: If statements checking ._tag
		// ------------------------------------------------
		if (ts.isIfStatement(node)) {
			const conditionText = node.expression.getText(sourceFile);

			if (conditionText.includes("._tag")) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: "if statement checking ._tag should use Match.tag()",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "error",
					certainty: "definite",
					suggestion:
						"Replace with Match.tag() for exhaustive pattern matching",
				});
			}
		}

		// ------------------------------------------------
		// Detection 3: Direct ._tag property access
		// ------------------------------------------------
		if (ts.isPropertyAccessExpression(node) && node.name.text === "_tag") {
			// Skip if in type context
			let parent = node.parent;
			let isInTypeContext = false;
			let isInSchemaIs = false;
			let isInMatchTag = false;

			while (parent) {
				if (
					ts.isTypeAliasDeclaration(parent) ||
					ts.isInterfaceDeclaration(parent) ||
					ts.isTypeLiteralNode(parent)
				) {
					isInTypeContext = true;
					break;
				}

				// Check if inside Schema.is() or Match.tag() - that's okay
				if (ts.isCallExpression(parent)) {
					const callText = parent.expression.getText(sourceFile);
					if (callText.includes("Schema.is") || callText.includes(".is(")) {
						isInSchemaIs = true;
						break;
					}
					if (callText.includes("Match.tag") || callText.includes(".tag(")) {
						isInMatchTag = true;
						break;
					}
				}

				parent = parent.parent;
			}

			if (!isInTypeContext && !isInSchemaIs && !isInMatchTag) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);

				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message:
						"Direct ._tag access; use Match.tag() or Schema.is() instead",
					filePath,
					line: line + 1,
					column: character + 1,
					snippet:
						node.parent?.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH) ||
						node.getText(sourceFile),
					severity: "error",
					certainty: "definite",
					suggestion: "Use Match.tag() for exhaustive pattern matching",
				});
			}
		}

		// ------------------------------------------------
		// Detection 4: Manual union type definitions with _tag property
		// ------------------------------------------------
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
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Define each variant as Schema.TaggedClass and combine with Schema.Union",
				});
			}
		}

		// ------------------------------------------------
		// Detection 5: Indexed access types extracting _tag: SomeType["_tag"]
		// ------------------------------------------------
		if (
			ts.isTypeAliasDeclaration(node) &&
			ts.isIndexedAccessTypeNode(node.type)
		) {
			const indexType = node.type.indexType;
			if (
				ts.isLiteralTypeNode(indexType) &&
				ts.isStringLiteral(indexType.literal) &&
				indexType.literal.text === "_tag"
			) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(
					node.getStart(),
				);
				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: `Type '${node.name.text}' extracts _tag; use the union type directly instead`,
					filePath,
					line: line + 1,
					column: character + 1,
					snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
					severity: "warning",
					certainty: "potential",
					suggestion:
						"Pass the full union type to functions instead of just the _tag string",
				});
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return violations;
};
