#!/usr/bin/env bun
/**
 * effect-diagnose v0.3 - Verify diagnosis by attempting refactoring
 *
 * Usage: bun run scripts/effect-diagnose/diagnose-v0.3.ts <file-path>
 *
 * This script:
 * 1. Runs diagnosis (v0.2)
 * 2. For each RESTRUCTURE/LOCAL_FIX recommendation, asks Claude to implement it
 * 3. Verifies: no type errors AND violations reduced
 * 4. Reports success/failure for each root cause
 */

import { $ } from "bun";

const EFFECT_AGENT_ROOT = `${import.meta.dir}/../../effect-agent`;
const SCRATCHPAD = `/tmp/effect-diagnose-${Date.now()}`;

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
	summary: {
		fixable: number;
		restructure: number;
		exceptions: number;
	};
}

interface VerificationResult {
	rootCauseId: number;
	title: string;
	recommendation: string;
	attempted: boolean;
	success: boolean;
	violationsBefore: number;
	violationsAfter: number;
	typeErrorsBefore: boolean;
	typeErrorsAfter: boolean;
	error?: string;
}

async function main() {
	const filePath = process.argv[2];
	if (!filePath) {
		console.error("Usage: bun run diagnose-v0.3.ts <file-path>");
		process.exit(1);
	}

	const absolutePath = filePath.startsWith("/") ? filePath : `${process.cwd()}/${filePath}`;

	// Setup scratchpad
	await $`mkdir -p ${SCRATCHPAD}`.nothrow();

	console.log("=== Effect Diagnose v0.3 (Verification Mode) ===\n");
	console.log(`Target: ${absolutePath}\n`);

	// Step 1: Run diagnosis
	console.log("Step 1: Running diagnosis...");
	const diagnosisResult = await $`bun run ${import.meta.dir}/diagnose-v0.2.ts ${absolutePath} 2>/dev/null`.nothrow().text();

	let diagnosis: Diagnosis;
	try {
		diagnosis = JSON.parse(diagnosisResult);
	} catch {
		console.error("Failed to parse diagnosis");
		console.error(diagnosisResult);
		process.exit(1);
	}

	console.log(`Found ${diagnosis.totalViolations} violations grouped into ${diagnosis.rootCauses.length} root causes\n`);

	// Step 2: Get baseline metrics
	console.log("Step 2: Getting baseline metrics...");
	const baseline = await getMetrics(absolutePath);
	console.log(`  Violations: ${baseline.violations}`);
	console.log(`  Type errors: ${baseline.hasTypeErrors ? "YES" : "NO"}\n`);

	// Step 3: Verify each fixable root cause
	console.log("Step 3: Verifying each fixable root cause...\n");

	const results: VerificationResult[] = [];

	for (const rootCause of diagnosis.rootCauses) {
		const result: VerificationResult = {
			rootCauseId: rootCause.id,
			title: rootCause.title,
			recommendation: rootCause.recommendation,
			attempted: false,
			success: false,
			violationsBefore: baseline.violations,
			violationsAfter: baseline.violations,
			typeErrorsBefore: baseline.hasTypeErrors,
			typeErrorsAfter: baseline.hasTypeErrors,
		};

		if (rootCause.recommendation === "EXCEPTION") {
			console.log(`[${rootCause.id}] ${rootCause.title}`);
			console.log(`    Recommendation: EXCEPTION (skipped)\n`);
			results.push(result);
			continue;
		}

		result.attempted = true;
		console.log(`[${rootCause.id}] ${rootCause.title}`);
		console.log(`    Recommendation: ${rootCause.recommendation}`);

		// Create a working copy
		const workingCopy = `${SCRATCHPAD}/attempt-${rootCause.id}.ts`;
		await $`cp ${absolutePath} ${workingCopy}`.nothrow();

		// Ask Claude to implement the fix
		const fixPrompt = createFixPrompt(workingCopy, rootCause, await Bun.file(absolutePath).text());
		const promptFile = `${SCRATCHPAD}/fix-prompt-${rootCause.id}.txt`;
		await Bun.write(promptFile, fixPrompt);

		console.log(`    Attempting fix...`);
		const fixResult = await $`claude -p "$(cat ${promptFile})" --allowedTools Edit,Read --output-format text 2>/dev/null`.nothrow().text();

		// Check if the file was modified
		const originalContent = await Bun.file(absolutePath).text();
		const modifiedContent = await Bun.file(workingCopy).text();

		if (originalContent === modifiedContent) {
			result.error = "No changes made";
			console.log(`    Result: FAILED (no changes made)\n`);
			results.push(result);
			continue;
		}

		// Check metrics after fix
		const afterFix = await getMetrics(workingCopy);
		result.violationsAfter = afterFix.violations;
		result.typeErrorsAfter = afterFix.hasTypeErrors;

		// Determine success
		const violationsReduced = afterFix.violations < baseline.violations;
		const noNewTypeErrors = !afterFix.hasTypeErrors || (baseline.hasTypeErrors && afterFix.hasTypeErrors);

		result.success = violationsReduced && noNewTypeErrors;

		if (result.success) {
			console.log(`    Result: SUCCESS`);
			console.log(`      Violations: ${baseline.violations} → ${afterFix.violations} (reduced by ${baseline.violations - afterFix.violations})`);
		} else {
			if (!violationsReduced) {
				result.error = `Violations not reduced (${baseline.violations} → ${afterFix.violations})`;
			} else if (afterFix.hasTypeErrors && !baseline.hasTypeErrors) {
				result.error = "Introduced type errors";
			}
			console.log(`    Result: FAILED - ${result.error}`);
		}
		console.log("");

		results.push(result);
	}

	// Step 4: Summary
	console.log("=== VERIFICATION SUMMARY ===\n");
	const attempted = results.filter(r => r.attempted);
	const successful = results.filter(r => r.success);
	const exceptions = results.filter(r => r.recommendation === "EXCEPTION");

	console.log(`Total root causes: ${results.length}`);
	console.log(`  Attempted: ${attempted.length}`);
	console.log(`  Successful: ${successful.length}`);
	console.log(`  Exceptions: ${exceptions.length}`);
	console.log(`  Failed: ${attempted.length - successful.length}\n`);

	// Output JSON results
	const outputFile = `${SCRATCHPAD}/verification-results.json`;
	await Bun.write(outputFile, JSON.stringify({ diagnosis, results }, null, 2));
	console.log(`Full results saved to: ${outputFile}\n`);

	// Cleanup on success
	if (successful.length === attempted.length) {
		console.log("All fixable root causes verified successfully!");
	}
}

async function getMetrics(filePath: string): Promise<{ violations: number; hasTypeErrors: boolean }> {
	// Get violation count (all violations, not just definite)
	const detectResult = await $`cd ${EFFECT_AGENT_ROOT} && bun run detect:all ${filePath} --json 2>/dev/null`.nothrow().text();
	let violations = 0;
	try {
		const parsed = JSON.parse(detectResult);
		violations = parsed.violations?.length || 0;
	} catch {
		// If parsing fails, count is 0
	}

	// Check for type errors on just this file
	const typeCheckResult = await $`cd ${EFFECT_AGENT_ROOT} && bunx tsc --noEmit ${filePath} 2>&1`.nothrow();
	const hasTypeErrors = typeCheckResult.exitCode !== 0;

	return { violations, hasTypeErrors };
}

function createFixPrompt(workingCopyPath: string, rootCause: RootCause, originalContent: string): string {
	return `You are implementing a specific refactoring to fix Effect-TS violations.

## Your Task

Implement ONLY the following refactoring:

**Root Cause**: ${rootCause.title}
**Explanation**: ${rootCause.explanation}
**What to do**: ${rootCause.alternative.description}
${rootCause.alternative.codeExample ? `**Example**:\n\`\`\`typescript\n${rootCause.alternative.codeExample}\n\`\`\`` : ""}

## File to Modify

Path: ${workingCopyPath}

## Critical Rules

1. Do NOT add suppression comments (eslint-disable, @ts-ignore, etc.)
2. Do NOT introduce type errors
3. Make ONLY the changes described above - nothing else
4. If you cannot implement the fix without breaking rules 1-2, make no changes

## Instructions

1. Read the file at ${workingCopyPath}
2. Implement the refactoring described above
3. Edit the file with your changes

The file has already been copied to a working location - edit it directly.
`;
}

main().catch(console.error);
