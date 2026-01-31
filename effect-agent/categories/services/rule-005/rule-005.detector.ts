/**
 * rule-005: layer-implementation
 *
 * Rule: Never create services inline; use Layer.effect or Layer.succeed with proper Live/Test patterns
 *
 * Detects:
 * 1. Inline service creation in Effect.gen without Layer.effect
 * 2. Services with Live layer but missing Test layer (and vice versa)
 * 3. Stateless test layers using Layer.succeed instead of Layer.effect with Ref
 */

import * as ts from "typescript";
import { SNIPPET_MAX_LENGTH, type Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-005",
	category: "services",
	name: "layer-implementation",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	// =========================================================================
	// Detection 1: Inline service creation in Effect.gen
	// =========================================================================

	const visitInlineService = (node: ts.Node) => {
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression)
		) {
			const obj = node.expression.expression;
			const method = node.expression.name.text;

			if (ts.isIdentifier(obj) && obj.text === "Effect" && method === "gen") {
				if (node.arguments.length > 0) {
					const genBody = node.arguments[0].getText(sourceFile);

					// Check for inline object creation that looks like a service
					if (
						genBody.includes("return {") &&
						(genBody.includes(":") || genBody.includes("()"))
					) {
						// Check if it's creating an object with methods
						const methodPattern = /\w+:\s*\(.*\)\s*=>/;
						if (methodPattern.test(genBody)) {
							const { line, character } =
								sourceFile.getLineAndCharacterOfPosition(node.getStart());
							violations.push({
								ruleId: meta.id,
								category: meta.category,
								message:
									"Inline service creation; use Layer.effect or Layer.succeed",
								filePath,
								line: line + 1,
								column: character + 1,
								snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
								severity: "info",
								certainty: "potential",
								suggestion:
									"Use Layer.effect(ServiceTag, Effect.gen(function* () { ... })) for services with dependencies",
							});
						}
					}
				}
			}
		}

		ts.forEachChild(node, visitInlineService);
	};

	visitInlineService(sourceFile);

	// =========================================================================
	// Detection 2: Missing Live/Test layer pairs
	// =========================================================================

	const services = new Set<string>();
	const liveLayerFor = new Set<string>();
	const testLayerFor = new Set<string>();

	// Find Context.Tag definitions to identify services (including GenericTag)
	const servicePattern = /(\w+)\s*=\s*Context\.(?:Generic)?Tag/g;
	for (const match of fullText.matchAll(servicePattern)) {
		services.add(match[1]);
	}

	// Find Layer definitions
	const livePattern = /(\w+)Live\s*=\s*Layer\./g;
	for (const match of fullText.matchAll(livePattern)) {
		liveLayerFor.add(match[1]);
	}

	const testPattern = /(\w+)Test\s*=\s*Layer\./g;
	for (const match of fullText.matchAll(testPattern)) {
		testLayerFor.add(match[1]);
	}

	// Check each service
	for (const service of services) {
		const hasLive = liveLayerFor.has(service);
		const hasTest = testLayerFor.has(service);

		if (hasLive && !hasTest) {
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: `Service ${service} has Live layer but no Test layer`,
				filePath,
				line: 1,
				column: 1,
				snippet: `${service}Live exists but ${service}Test is missing`,
				severity: "warning",
				certainty: "potential",
				suggestion: `Create ${service}Test layer for testing with mocked/in-memory implementation`,
			});
		} else if (!hasLive && hasTest) {
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: `Service ${service} has Test layer but no Live layer`,
				filePath,
				line: 1,
				column: 1,
				snippet: `${service}Test exists but ${service}Live is missing`,
				severity: "warning",
				certainty: "potential",
				suggestion: `Create ${service}Live layer with real implementation`,
			});
		}
	}

	// =========================================================================
	// Detection 3: Stateless test layers (Layer.succeed without Ref)
	// =========================================================================

	// Only check test files or files with Test layers
	if (fullText.includes("Test") || filePath.includes("test")) {
		const visitStatelessTest = (node: ts.Node) => {
			if (
				ts.isCallExpression(node) &&
				ts.isPropertyAccessExpression(node.expression)
			) {
				const obj = node.expression.expression;
				const method = node.expression.name.text;

				if (
					ts.isIdentifier(obj) &&
					obj.text === "Layer" &&
					method === "succeed"
				) {
					// Check if this is a test layer
					let parent = node.parent;
					while (parent) {
						const parentText = parent.getText(sourceFile);
						if (parentText.includes("Test")) {
							// Check if the service implementation uses Ref
							const argText =
								node.arguments.length > 1
									? node.arguments[1].getText(sourceFile)
									: "";

							if (!argText.includes("Ref") && !argText.includes("ref")) {
								const { line, character } =
									sourceFile.getLineAndCharacterOfPosition(node.getStart());
								violations.push({
									ruleId: meta.id,
									category: meta.category,
									message:
										"Test layer with Layer.succeed (stateless); consider Layer.effect with Ref",
									filePath,
									line: line + 1,
									column: character + 1,
									snippet: node.getText(sourceFile).slice(0, SNIPPET_MAX_LENGTH),
									severity: "info",
									certainty: "potential",
									suggestion:
										"Use Layer.effect(Tag, Effect.gen(function* () { const state = yield* Ref.make(...); return { ... } })) for stateful test mocks",
								});
							}
							break;
						}
						parent = parent.parent;
					}
				}
			}

			ts.forEachChild(node, visitStatelessTest);
		};

		visitStatelessTest(sourceFile);
	}

	return violations;
};
