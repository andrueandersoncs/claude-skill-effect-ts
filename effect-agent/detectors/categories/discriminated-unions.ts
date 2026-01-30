/**
 * Discriminated unions detector
 *
 * Detects improper handling of discriminated unions
 */

import * as ts from "typescript";
import type { CategoryDetector, Violation } from "../types.js";

export const discriminatedUnionsDetector: CategoryDetector = {
	category: "discriminated-unions",
	description: "Detects improper discriminated union handling",

	detect(filePath: string, sourceCode: string): Violation[] {
		const violations: Violation[] = [];
		const sourceFile = ts.createSourceFile(
			filePath,
			sourceCode,
			ts.ScriptTarget.Latest,
			true,
		);

		const visit = (node: ts.Node) => {
			// Detect direct ._tag access
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

					// Check context to determine appropriate suggestion
					let suggestion = "Use Match.tag() for exhaustive pattern matching";
					let ruleId = "match-tag-dispatch";

					// If it's in a comparison, it's likely conditional logic
					if (
						node.parent &&
						ts.isBinaryExpression(node.parent) &&
						(node.parent.operatorToken.kind ===
							ts.SyntaxKind.EqualsEqualsEqualsToken ||
							node.parent.operatorToken.kind ===
								ts.SyntaxKind.EqualsEqualsToken)
					) {
						ruleId = "switch-on-tag";
						suggestion = "Use Match.tag() instead of comparing ._tag directly";
					}

					violations.push({
						ruleId,
						category: "discriminated-unions",
						message:
							"Direct ._tag access; use Match.tag() or Schema.is() instead",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet:
							node.parent?.getText(sourceFile).slice(0, 100) ||
							node.getText(sourceFile),
						severity: "error",
						certainty: "definite",
						suggestion,
					});
				}
			}

			// Detect switch statements on ._tag
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
						ruleId: "switch-on-tag",
						category: "discriminated-unions",
						message:
							"switch on ._tag should use Match.tag() for exhaustive matching",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 150),
						severity: "error",
						certainty: "definite",
						suggestion:
							"Replace with Match.type<UnionType>().pipe(Match.tag('Tag1', ...), ...)",
					});
				}
			}

			// Detect if statements checking ._tag
			if (ts.isIfStatement(node)) {
				const conditionText = node.expression.getText(sourceFile);

				if (conditionText.includes("._tag")) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "switch-on-tag",
						category: "discriminated-unions",
						message: "if statement checking ._tag should use Match.tag()",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile).slice(0, 150),
						severity: "error",
						certainty: "definite",
						suggestion:
							"Replace with Match.tag() for exhaustive pattern matching",
					});
				}
			}

			// Detect potential non-exhaustive handling (array filter on _tag)
			if (
				ts.isCallExpression(node) &&
				ts.isPropertyAccessExpression(node.expression) &&
				node.expression.name.text === "filter"
			) {
				const args = node.arguments;
				if (args.length > 0) {
					const argText = args[0].getText(sourceFile);
					if (argText.includes("._tag")) {
						const { line, character } =
							sourceFile.getLineAndCharacterOfPosition(node.getStart());
						violations.push({
							ruleId: "partitioning-by-tag",
							category: "discriminated-unions",
							message:
								"Filtering by ._tag may miss cases; consider Array.partition with Match",
							filePath,
							line: line + 1,
							column: character + 1,
							snippet: node.getText(sourceFile).slice(0, 100),
							severity: "warning",
							certainty: "potential",
							suggestion:
								"Use Array.partition() or Match to handle all union variants",
						});
					}
				}
			}

			// Detect type narrowing with 'in' operator (may indicate union handling)
			if (
				ts.isBinaryExpression(node) &&
				node.operatorToken.kind === ts.SyntaxKind.InKeyword
			) {
				const leftText = node.left.getText(sourceFile);
				if (leftText === '"_tag"' || leftText === "'_tag'") {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					violations.push({
						ruleId: "runtime-validation",
						category: "discriminated-unions",
						message: "'_tag' in check should use Schema.is() type guard",
						filePath,
						line: line + 1,
						column: character + 1,
						snippet: node.getText(sourceFile),
						severity: "warning",
						certainty: "potential",
						suggestion: "Use Schema.is(MyTaggedClass) for type-safe narrowing",
					});
				}
			}

			// Detect manual union type definitions that should use Schema
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
						ruleId: "use-union-directly",
						category: "discriminated-unions",
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
	},
};
