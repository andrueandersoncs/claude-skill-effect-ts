/**
 * Detector Tests
 *
 * Dynamically discovers all detector files and tests each one
 * against its corresponding .bad.ts file to verify violations are detected.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";
import { describe, expect, it } from "vitest";
import type { Violation } from "./types.js";

// Discover all detector files
function discoverDetectors(categoriesDir: string): string[] {
	const detectors: string[] = [];

	if (!fs.existsSync(categoriesDir)) {
		return detectors;
	}

	const categories = fs.readdirSync(categoriesDir);

	for (const category of categories) {
		const categoryPath = path.join(categoriesDir, category);
		if (!fs.statSync(categoryPath).isDirectory()) continue;
		if (category.startsWith("_")) continue; // Skip _fixtures etc.

		const rules = fs.readdirSync(categoryPath);
		for (const rule of rules) {
			const rulePath = path.join(categoryPath, rule);
			if (!fs.statSync(rulePath).isDirectory()) continue;

			const detectorFile = path.join(rulePath, `${rule}.detector.ts`);
			if (fs.existsSync(detectorFile)) {
				detectors.push(detectorFile);
			}
		}
	}

	return detectors;
}

// Parse a TypeScript file into a SourceFile
function parseFile(filePath: string): ts.SourceFile {
	const content = fs.readFileSync(filePath, "utf-8");
	return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
}

// Extract rule metadata from .bad.ts file comments
function extractRuleMetadata(
	filePath: string,
): { ruleId: string; category: string } | null {
	const content = fs.readFileSync(filePath, "utf-8");
	const ruleIdMatch = content.match(/@rule-id:\s*(\S+)/);
	const categoryMatch = content.match(/@category:\s*(\S+)/);

	if (ruleIdMatch && categoryMatch) {
		return {
			ruleId: ruleIdMatch[1],
			category: categoryMatch[1],
		};
	}
	return null;
}

// Main test suite
const categoriesDir = path.join(__dirname, "..", "categories");
const detectorFiles = discoverDetectors(categoriesDir);

describe("Detector Tests", () => {
	describe("Discovery", () => {
		it("should discover detector files", () => {
			expect(detectorFiles.length).toBeGreaterThan(0);
			console.log(`Discovered ${detectorFiles.length} detector files`);
		});
	});

	describe("Individual Detectors", () => {
		for (const detectorPath of detectorFiles) {
			const relativePath = path.relative(categoriesDir, detectorPath);
			const parts = relativePath.split(path.sep);
			const category = parts[0];
			const rule = parts[1];
			const badFilePath = detectorPath.replace(".detector.ts", ".bad.ts");
			const testName = `${category}/${rule}`;

			it(`${testName} should detect violations in .bad.ts`, async () => {
				// Check .bad.ts file exists
				if (!fs.existsSync(badFilePath)) {
					console.warn(`Skipping ${testName}: no .bad.ts file found`);
					return;
				}

				// Dynamically import the detector
				const detector = await import(detectorPath);
				expect(detector.detect).toBeDefined();
				expect(typeof detector.detect).toBe("function");

				// Parse the .bad.ts file
				const sourceFile = parseFile(badFilePath);

				// Run detection
				const violations: Violation[] = detector.detect(
					badFilePath,
					sourceFile,
				);

				// Verify at least one violation was detected
				expect(violations.length).toBeGreaterThan(0);

				// Verify violation structure
				for (const violation of violations) {
					expect(violation.ruleId).toBeDefined();
					expect(violation.category).toBe(category);
					expect(violation.message).toBeDefined();
					expect(violation.line).toBeGreaterThan(0);
					expect(violation.column).toBeGreaterThan(0);
					expect(violation.certainty).toMatch(/^(definite|potential)$/);
				}

				// Optionally verify the rule ID matches metadata
				const metadata = extractRuleMetadata(badFilePath);
				if (metadata) {
					const hasMatchingRule = violations.some(
						(v) => v.ruleId === metadata.ruleId,
					);
					expect(hasMatchingRule).toBe(true);
				}
			});
		}
	});
});
