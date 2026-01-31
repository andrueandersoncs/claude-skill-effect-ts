/**
 * rule-014: schema-field-composition
 *
 * Rule: Never duplicate Schema fields across multiple definitions; use `.fields` spread, `.extend()`, `.pick()`, `.omit()`, or TaggedClass
 *
 * Detects when multiple Schema.Struct or Schema.Class definitions share
 * significant field overlap, suggesting composition patterns instead.
 */

import * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-014",
	category: "schema",
	name: "schema-field-composition",
};

interface SchemaDefinition {
	name: string;
	fields: Set<string>;
	node: ts.Node;
	type: "Struct" | "Class" | "TaggedClass";
	line: number;
	column: number;
}

/**
 * Extracts field names from a Schema.Struct, Schema.Class, or Schema.TaggedClass definition
 */
const extractFieldNames = (
	objectLiteral: ts.ObjectLiteralExpression,
	_sourceFile: ts.SourceFile,
): Set<string> => {
	const fields = new Set<string>();

	for (const prop of objectLiteral.properties) {
		if (
			ts.isPropertyAssignment(prop) ||
			ts.isShorthandPropertyAssignment(prop)
		) {
			const name = prop.name;
			if (ts.isIdentifier(name)) {
				// Skip spread properties (they indicate composition is already being used)
				fields.add(name.text);
			}
		}
		// If we see a spread assignment, this schema is already using composition
		if (ts.isSpreadAssignment(prop)) {
			// Return empty set to indicate this schema uses composition
			return new Set();
		}
	}

	return fields;
};

/**
 * Checks if a call expression is Schema.Struct
 */
const isSchemaStruct = (node: ts.CallExpression): boolean => {
	const expr = node.expression;
	if (ts.isPropertyAccessExpression(expr)) {
		return (
			ts.isIdentifier(expr.expression) &&
			expr.expression.text === "Schema" &&
			expr.name.text === "Struct"
		);
	}
	return false;
};

/**
 * Checks if a node is a Schema.Class definition
 */
const isSchemaClass = (
	node: ts.ClassDeclaration,
	_sourceFile: ts.SourceFile,
): ts.ObjectLiteralExpression | null => {
	// Look for: class X extends Schema.Class<X>("X")({ fields })
	if (!node.heritageClauses) return null;

	for (const clause of node.heritageClauses) {
		if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
			for (const type of clause.types) {
				const expr = type.expression;
				// Schema.Class<X>("X")({ fields }) - need to find the call with object literal
				if (ts.isCallExpression(expr) && expr.arguments.length > 0) {
					const arg = expr.arguments[0];
					if (ts.isObjectLiteralExpression(arg)) {
						// Check if parent call is Schema.Class
						const parentCall = expr.expression;
						if (ts.isCallExpression(parentCall)) {
							const parentExpr = parentCall.expression;
							if (ts.isPropertyAccessExpression(parentExpr)) {
								if (
									ts.isIdentifier(parentExpr.expression) &&
									parentExpr.expression.text === "Schema" &&
									parentExpr.name.text === "Class"
								) {
									return arg;
								}
							}
						}
					}
				}
			}
		}
	}
	return null;
};

/**
 * Checks if a node is a Schema.TaggedClass definition
 */
const isSchemaTaggedClass = (
	node: ts.ClassDeclaration,
	_sourceFile: ts.SourceFile,
): ts.ObjectLiteralExpression | null => {
	// Look for: class X extends Schema.TaggedClass<X>()("X", { fields })
	if (!node.heritageClauses) return null;

	for (const clause of node.heritageClauses) {
		if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
			for (const type of clause.types) {
				const expr = type.expression;
				// Schema.TaggedClass<X>()("X", { fields })
				if (ts.isCallExpression(expr) && expr.arguments.length >= 2) {
					const fieldsArg = expr.arguments[1];
					if (ts.isObjectLiteralExpression(fieldsArg)) {
						// Check if parent calls lead to Schema.TaggedClass
						const parentCall = expr.expression;
						if (ts.isCallExpression(parentCall)) {
							const grandParent = parentCall.expression;
							if (ts.isPropertyAccessExpression(grandParent)) {
								if (
									ts.isIdentifier(grandParent.expression) &&
									grandParent.expression.text === "Schema" &&
									grandParent.name.text === "TaggedClass"
								) {
									return fieldsArg;
								}
							}
						}
					}
				}
			}
		}
	}
	return null;
};

/**
 * Gets the name of a schema definition from its variable/class declaration
 */
const getSchemaName = (node: ts.Node, _sourceFile: ts.SourceFile): string => {
	// For variable declarations: const X = Schema.Struct({...})
	if (
		ts.isVariableDeclaration(node.parent) &&
		ts.isIdentifier(node.parent.name)
	) {
		return node.parent.name.text;
	}
	// For class declarations: class X extends Schema.Class...
	if (ts.isClassDeclaration(node) && node.name) {
		return node.name.text;
	}
	return "<anonymous>";
};

/**
 * Calculates the overlap between two sets of fields
 */
const calculateOverlap = (
	fields1: Set<string>,
	fields2: Set<string>,
): { count: number; fields: string[] } => {
	const overlap: string[] = [];
	for (const field of fields1) {
		if (fields2.has(field)) {
			overlap.push(field);
		}
	}
	return { count: overlap.length, fields: overlap };
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const schemaDefinitions: SchemaDefinition[] = [];

	// Minimum number of shared fields to consider as duplication
	const MIN_SHARED_FIELDS = 3;
	// Minimum percentage of fields that must overlap
	const MIN_OVERLAP_PERCENTAGE = 0.5;

	const visit = (node: ts.Node) => {
		// Detect Schema.Struct definitions
		if (ts.isCallExpression(node) && isSchemaStruct(node)) {
			if (
				node.arguments.length > 0 &&
				ts.isObjectLiteralExpression(node.arguments[0])
			) {
				const fields = extractFieldNames(node.arguments[0], sourceFile);
				if (fields.size > 0) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					schemaDefinitions.push({
						name: getSchemaName(node, sourceFile),
						fields,
						node,
						type: "Struct",
						line: line + 1,
						column: character + 1,
					});
				}
			}
		}

		// Detect Schema.Class definitions
		if (ts.isClassDeclaration(node)) {
			const classFields = isSchemaClass(node, sourceFile);
			if (classFields) {
				const fields = extractFieldNames(classFields, sourceFile);
				if (fields.size > 0) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					schemaDefinitions.push({
						name: node.name?.text || "<anonymous>",
						fields,
						node,
						type: "Class",
						line: line + 1,
						column: character + 1,
					});
				}
			}

			// Detect Schema.TaggedClass definitions
			const taggedClassFields = isSchemaTaggedClass(node, sourceFile);
			if (taggedClassFields) {
				const fields = extractFieldNames(taggedClassFields, sourceFile);
				if (fields.size > 0) {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition(
						node.getStart(),
					);
					schemaDefinitions.push({
						name: node.name?.text || "<anonymous>",
						fields,
						node,
						type: "TaggedClass",
						line: line + 1,
						column: character + 1,
					});
				}
			}
		}

		ts.forEachChild(node, visit);
	};

	visit(sourceFile);

	// Compare all pairs of schema definitions for field overlap
	const reportedPairs = new Set<string>();

	for (let i = 0; i < schemaDefinitions.length; i++) {
		for (let j = i + 1; j < schemaDefinitions.length; j++) {
			const schema1 = schemaDefinitions[i];
			const schema2 = schemaDefinitions[j];

			const { count: overlapCount, fields: overlapFields } = calculateOverlap(
				schema1.fields,
				schema2.fields,
			);

			const minSize = Math.min(schema1.fields.size, schema2.fields.size);
			const overlapPercentage = overlapCount / minSize;

			// Report if significant overlap
			if (
				overlapCount >= MIN_SHARED_FIELDS &&
				overlapPercentage >= MIN_OVERLAP_PERCENTAGE
			) {
				// Create a canonical pair key to avoid duplicate reports
				const pairKey = [schema1.name, schema2.name].sort().join(":");
				if (reportedPairs.has(pairKey)) continue;
				reportedPairs.add(pairKey);

				// Report on the second (later) schema definition
				const suggestion = getSuggestion(schema1, schema2);

				violations.push({
					ruleId: meta.id,
					category: meta.category,
					message: `Schema '${schema2.name}' duplicates ${overlapCount} fields from '${schema1.name}': ${overlapFields.slice(0, 5).join(", ")}${overlapFields.length > 5 ? "..." : ""}`,
					filePath,
					line: schema2.line,
					column: schema2.column,
					snippet: `${schema2.type}: ${schema2.name} shares ${overlapCount}/${schema2.fields.size} fields with ${schema1.name}`,
					severity: "warning",
					certainty: "potential",
					suggestion,
				});
			}
		}
	}

	return violations;
};

/**
 * Generates an appropriate suggestion based on schema types
 */
const getSuggestion = (
	schema1: SchemaDefinition,
	schema2: SchemaDefinition,
): string => {
	if (schema1.type === "Struct" && schema2.type === "Struct") {
		return `Extract shared fields to a base struct and use spread: Schema.Struct({ ...${schema1.name}.fields, ...additionalFields })`;
	}

	if (schema1.type === "Class" && schema2.type === "Class") {
		return `Use class extension: class ${schema2.name} extends ${schema1.name}.extend<${schema2.name}>("${schema2.name}")({ ...additionalFields })`;
	}

	if (schema1.type === "TaggedClass" && schema2.type === "TaggedClass") {
		return `Extract shared fields to a const object and spread into both TaggedClass definitions: const baseFields = { ... }; Schema.TaggedClass<T>()("Tag", { ...baseFields, ...additionalFields })`;
	}

	// Mixed types
	return `Extract shared fields to a reusable object and use composition with .fields spread, .extend(), or TaggedClass`;
};
