#!/usr/bin/env bun
/**
 * effect-diagnose v0.1 - Simple diagnostic prompt test
 *
 * Usage: bun run scripts/effect-diagnose/diagnose-v0.1.ts <file-path>
 *
 * This script:
 * 1. Runs the detector to get violations
 * 2. Asks Claude to diagnose root causes and suggest alternatives
 * 3. Outputs the diagnosis
 */

import { $ } from "bun";

const EFFECT_AGENT_ROOT = `${import.meta.dir}/../../effect-agent`;

async function main() {
	const filePath = process.argv[2];
	if (!filePath) {
		console.error("Usage: bun run diagnose-v0.1.ts <file-path>");
		process.exit(1);
	}

	console.log(`\n=== Effect Diagnose v0.1 ===`);
	console.log(`Target: ${filePath}\n`);

	// Step 1: Run detector to get violations
	console.log("Step 1: Running detector...");
	const absolutePath = filePath.startsWith("/") ? filePath : `${process.cwd()}/${filePath}`;
	const detectResult = await $`cd ${EFFECT_AGENT_ROOT} && bun run detect:all ${absolutePath} --json 2>/dev/null`.nothrow().text();

	let violations: unknown[];
	try {
		const parsed = JSON.parse(detectResult);
		violations = parsed.violations || [];
	} catch {
		console.error("Failed to parse detector output");
		process.exit(1);
	}

	console.log(`Found ${violations.length} violations\n`);

	if (violations.length === 0) {
		console.log("No violations to diagnose.");
		process.exit(0);
	}

	// Step 2: Create diagnostic prompt
	const diagnosticPrompt = createDiagnosticPrompt(absolutePath, violations);

	// Step 3: Run Claude with the diagnostic prompt
	console.log("Step 2: Running diagnostic analysis...\n");

	const promptFile = `/tmp/diagnose-prompt-${Date.now()}.txt`;
	await Bun.write(promptFile, diagnosticPrompt);

	const result = await $`claude -p "$(cat ${promptFile})" --output-format text 2>/dev/null`.nothrow().text();

	console.log("=== DIAGNOSIS ===\n");
	console.log(result);
	console.log("\n=== END DIAGNOSIS ===\n");

	// Cleanup
	await $`rm ${promptFile}`.nothrow();
}

function createDiagnosticPrompt(filePath: string, violations: unknown[]): string {
	const violationSummary = violations.map((v: any, i: number) =>
		`${i + 1}. [${v.ruleId}] Line ${v.line}: ${v.message}\n   Snippet: ${v.snippet?.slice(0, 100)}...`
	).join("\n");

	return `You are an Effect-TS expert analyzing a file for refactoring opportunities.

## Your Task

Analyze the violations below and identify:
1. **Root Causes**: Group violations that share a common underlying cause
2. **Alternative Designs**: For each root cause, suggest a different implementation approach
3. **Recommendation**: For each group, recommend: LOCAL_FIX | RESTRUCTURE | EXCEPTION

## Important

- Don't suggest wrapping type predicates (\`x is Foo\`) in Effect - they MUST return boolean
- Don't suggest adding suppression comments
- DO suggest deleting code and reimplementing differently when appropriate
- Consider if existing code in the file already provides a better pattern

## File to Analyze

Path: ${filePath}

Please read the file first, then analyze the violations.

## Violations Found (${violations.length} total)

${violationSummary}

## Output Format

For each root cause group:

### Root Cause [N]: [Brief description]
**Violations**: [list of violation numbers from above]
**Why it happens**: [explanation]
**Alternative design**: [specific code suggestion]
**Recommendation**: LOCAL_FIX | RESTRUCTURE | EXCEPTION
**Confidence**: HIGH | MEDIUM | LOW

After all groups, provide:

### Summary
- Total violations: X
- Grouped into N root causes
- Recommended actions: [summary]
`;
}

main().catch(console.error);
