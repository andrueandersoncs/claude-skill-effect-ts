#!/usr/bin/env bun
/**
 * effect-diagnose v0.4 - Apply all verified fixes to original file
 *
 * Usage: bun run scripts/effect-diagnose/diagnose-v0.4.ts <file-path> [--apply]
 *
 * Without --apply: runs diagnosis and verification only
 * With --apply: applies all successful fixes to the original file
 */

import { $ } from "bun";

const EFFECT_AGENT_ROOT = `${import.meta.dir}/../../effect-agent`;

interface RootCause {
	id: number;
	title: string;
	violationIndices: number[];
	explanation: string;
	alternative: {
		description: string;
		codeExample?: string;
	};
	recommendation: "LOCAL_FIX" | "RESTRUCTURE" | "EXCEPTION";
	confidence: "HIGH" | "MEDIUM" | "LOW";
}

interface Diagnosis {
	filePath: string;
	totalViolations: number;
	rootCauses: RootCause[];
}

async function main() {
	const args = process.argv.slice(2);
	const applyMode = args.includes("--apply");
	const filePath = args.find(a => !a.startsWith("--"));

	if (!filePath) {
		console.error("Usage: bun run diagnose-v0.4.ts <file-path> [--apply]");
		process.exit(1);
	}

	const absolutePath = filePath.startsWith("/") ? filePath : `${process.cwd()}/${filePath}`;

	console.log("=== Effect Diagnose v0.4 ===\n");
	console.log(`Target: ${absolutePath}`);
	console.log(`Mode: ${applyMode ? "APPLY" : "DRY RUN"}\n`);

	// Step 1: Get diagnosis
	console.log("Step 1: Running diagnosis...");
	const diagnosisResult = await $`bun run ${import.meta.dir}/diagnose-v0.2.ts ${absolutePath} 2>/dev/null`.nothrow().text();

	let diagnosis: Diagnosis;
	try {
		diagnosis = JSON.parse(diagnosisResult);
	} catch {
		console.error("Failed to parse diagnosis");
		process.exit(1);
	}

	const fixable = diagnosis.rootCauses.filter(rc => rc.recommendation !== "EXCEPTION");
	const exceptions = diagnosis.rootCauses.filter(rc => rc.recommendation === "EXCEPTION");

	console.log(`Found ${diagnosis.totalViolations} violations`);
	console.log(`  ${fixable.length} fixable root causes`);
	console.log(`  ${exceptions.length} exceptions\n`);

	if (fixable.length === 0) {
		console.log("No fixable root causes found.");
		process.exit(0);
	}

	// Step 2: Get baseline
	const baselineViolations = await countViolations(absolutePath);
	console.log(`Baseline violations: ${baselineViolations}\n`);

	// Step 3: Create combined fix prompt
	console.log("Step 2: Creating combined fix plan...\n");

	const fixPlan = fixable.map(rc => `
### ${rc.id}. ${rc.title} (${rc.recommendation})
**What to do**: ${rc.alternative.description}
${rc.alternative.codeExample ? `**Example**:\n\`\`\`typescript\n${rc.alternative.codeExample}\n\`\`\`` : ""}`).join("\n");

	console.log("Fix plan:");
	console.log(fixPlan);
	console.log("");

	if (!applyMode) {
		console.log("=== DRY RUN COMPLETE ===");
		console.log("Run with --apply to apply fixes to the original file.");
		process.exit(0);
	}

	// Step 4: Apply fixes
	console.log("Step 3: Applying fixes...\n");

	const combinedPrompt = createCombinedFixPrompt(absolutePath, fixable);
	const promptFile = `/tmp/diagnose-combined-${Date.now()}.txt`;
	await Bun.write(promptFile, combinedPrompt);

	await $`claude -p "$(cat ${promptFile})" --allowedTools Edit,Read --output-format text 2>/dev/null`.nothrow();

	// Step 5: Verify
	console.log("\nStep 4: Verifying...\n");

	const afterViolations = await countViolations(absolutePath);
	const reduction = baselineViolations - afterViolations;

	console.log(`Violations: ${baselineViolations} → ${afterViolations}`);

	if (reduction > 0) {
		console.log(`\n✓ SUCCESS: Reduced by ${reduction} violations`);
	} else if (reduction === 0) {
		console.log(`\n⚠ NO CHANGE: Violations unchanged`);
	} else {
		console.log(`\n✗ REGRESSION: Violations increased by ${-reduction}`);
	}

	// Cleanup
	await $`rm ${promptFile}`.nothrow();
}

async function countViolations(filePath: string): Promise<number> {
	const result = await $`cd ${EFFECT_AGENT_ROOT} && bun run detect:all ${filePath} --json 2>/dev/null`.nothrow().text();
	try {
		const parsed = JSON.parse(result);
		return parsed.violations?.length || 0;
	} catch {
		return 0;
	}
}

function createCombinedFixPrompt(filePath: string, rootCauses: RootCause[]): string {
	const fixInstructions = rootCauses.map(rc => `
## Fix ${rc.id}: ${rc.title}
**What to do**: ${rc.alternative.description}
${rc.alternative.codeExample ? `**Example**:\n\`\`\`typescript\n${rc.alternative.codeExample}\n\`\`\`` : ""}`).join("\n");

	return `You are implementing multiple refactorings to fix Effect-TS violations.

## File to Modify

Path: ${filePath}

## Fixes to Apply (in order)

${fixInstructions}

## Critical Rules

1. Do NOT add suppression comments (eslint-disable, @ts-ignore, etc.)
2. Do NOT introduce type errors
3. Apply ALL fixes in a single coherent refactoring
4. If a fix conflicts with another, prioritize RESTRUCTURE over LOCAL_FIX

## Instructions

1. Read the file at ${filePath}
2. Apply all fixes in a single coherent edit
3. Verify the changes compile and make sense together
`;
}

main().catch(console.error);
