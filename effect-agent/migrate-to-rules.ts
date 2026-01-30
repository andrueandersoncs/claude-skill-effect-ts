/**
 * Migration script to reorganize effect-agent around individual rules
 *
 * New structure:
 * categories/
 *   async/
 *     rule-001/
 *       rule-001.md          (documentation - rule description, rationale)
 *       rule-001.ts          (code examples - good/bad patterns)
 *       rule-001.detector.ts (detection logic for this rule)
 *     rule-002/
 *       ...
 *     README.md
 *     index.ts
 *   _fixtures.ts (shared fixtures - stays at root)
 */

import * as fs from "node:fs";
import * as path from "node:path";

const CATEGORIES_DIR = "./categories";

interface RuleMapping {
	category: string;
	oldName: string;
	ruleId: string;
	ruleDir: string;
	oldPath: string;
	newTsPath: string;
	newMdPath: string;
	rule: string;
	example: string;
}

// Get all categories
const categories = fs
	.readdirSync(CATEGORIES_DIR, { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => d.name);

console.log(`Found ${categories.length} categories`);

const ruleMappings: RuleMapping[] = [];

// Process each category
for (const category of categories) {
	const categoryPath = path.join(CATEGORIES_DIR, category);

	// Get all .ts files in this category (excluding _fixtures.ts)
	const ruleFiles = fs
		.readdirSync(categoryPath)
		.filter((f) => f.endsWith(".ts") && f !== "_fixtures.ts")
		.sort();

	console.log(`\n${category}: ${ruleFiles.length} rules`);

	let categoryRuleNum = 1;
	for (const ruleFile of ruleFiles) {
		const ruleId = `rule-${String(categoryRuleNum).padStart(3, "0")}`;
		const ruleDir = path.join(categoryPath, ruleId);
		const oldPath = path.join(categoryPath, ruleFile);

		// Read content to extract metadata
		const content = fs.readFileSync(oldPath, "utf-8");
		const ruleMatch = content.match(/\/\/\s*Rule:\s*(.+)/);
		const exampleMatch = content.match(/\/\/\s*Example:\s*(.+)/);

		ruleMappings.push({
			category,
			oldName: ruleFile.replace(".ts", ""),
			ruleId,
			ruleDir,
			oldPath,
			newTsPath: path.join(ruleDir, `${ruleId}.ts`),
			newMdPath: path.join(ruleDir, `${ruleId}.md`),
			rule: ruleMatch?.[1]?.trim() || "",
			example: exampleMatch?.[1]?.trim() || "",
		});

		console.log(`  ${ruleFile} -> ${ruleId}/`);
		categoryRuleNum++;
	}
}

console.log(`\nTotal rules: ${ruleMappings.length}`);
console.log("\n=== Performing Migration ===\n");

// Perform the migration
for (const mapping of ruleMappings) {
	// Create rule directory
	if (!fs.existsSync(mapping.ruleDir)) {
		fs.mkdirSync(mapping.ruleDir, { recursive: true });
	}

	// Read original file content
	const content = fs.readFileSync(mapping.oldPath, "utf-8");

	// Create markdown documentation file
	const mdContent = `# ${mapping.ruleId}: ${mapping.oldName}

**Category:** ${mapping.category}
**Rule ID:** ${mapping.ruleId}

## Rule

${mapping.rule}

## Description

${mapping.example}

## Good Pattern

See \`${mapping.ruleId}.ts\` for the correct implementation pattern.

## Detection

This rule can be detected by the \`${mapping.ruleId}.detector.ts\` file.
`;

	fs.writeFileSync(mapping.newMdPath, mdContent);

	// Update the TypeScript file with metadata header
	const lines = content.split("\n");

	// Find where to insert metadata (after existing // Rule: and // Example: comments)
	let insertIndex = 0;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith("// Rule:") || lines[i].startsWith("// Example:")) {
			insertIndex = i + 1;
		} else if (insertIndex > 0 && !lines[i].startsWith("//")) {
			break;
		}
	}

	// Add metadata
	const metadataLines = [
		`// @rule-id: ${mapping.ruleId}`,
		`// @category: ${mapping.category}`,
		`// @original-name: ${mapping.oldName}`,
		"",
	];

	if (insertIndex > 0) {
		lines.splice(insertIndex, 0, ...metadataLines);
	} else {
		lines.unshift(...metadataLines);
	}

	const newContent = lines.join("\n");

	// Write TypeScript file to new location
	fs.writeFileSync(mapping.newTsPath, newContent);

	// Remove old file
	fs.unlinkSync(mapping.oldPath);

	console.log(
		`Migrated: ${mapping.category}/${mapping.oldName} -> ${mapping.ruleId}/`,
	);
}

// Create index.ts for each category
console.log("\n=== Creating Category Indexes ===\n");

for (const category of categories) {
	const categoryPath = path.join(CATEGORIES_DIR, category);
	const categoryRules = ruleMappings.filter((m) => m.category === category);

	const indexContent = `/**
 * ${category} rules index
 *
 * This file exports all rules in the ${category} category.
 */

${categoryRules.map((r) => `export * from "./${r.ruleId}/${r.ruleId}.js";`).join("\n")}

/**
 * Rule metadata for this category
 */
export const rules = [
${categoryRules
	.map(
		(r) => `  {
    id: "${r.ruleId}",
    category: "${category}",
    name: "${r.oldName}",
    rule: "${r.rule.replace(/"/g, '\\"')}",
  },`,
	)
	.join("\n")}
] as const;

export type RuleId = (typeof rules)[number]["id"];
`;

	fs.writeFileSync(path.join(categoryPath, "index.ts"), indexContent);
	console.log(`Created index for: ${category}`);
}

// Save mapping as JSON for reference
const mappingOutput = ruleMappings.map((m) => ({
	ruleId: m.ruleId,
	category: m.category,
	originalName: m.oldName,
	rule: m.rule,
	example: m.example,
}));
fs.writeFileSync(
	"./rule-mappings.json",
	JSON.stringify(mappingOutput, null, 2),
);
console.log("\nRule mappings saved to rule-mappings.json");

console.log("\n=== Migration Complete ===");
console.log(
	`Migrated ${ruleMappings.length} rules across ${categories.length} categories`,
);
console.log("\nNext steps:");
console.log("1. Create detector files for each rule (rule-XXX.detector.ts)");
console.log("2. Update the main detector runner to use the new structure");
