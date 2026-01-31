#!/usr/bin/env bun
/**
 * effect-diagnose v0.2 - Structured JSON diagnosis output
 *
 * Usage: bun run scripts/effect-diagnose/diagnose-v0.2.ts <file-path>
 *
 * This script:
 * 1. Runs the detector to get violations
 * 2. Asks Claude to diagnose root causes with structured JSON output
 * 3. Outputs a machine-readable diagnosis
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
	summary: {
		fixable: number;
		restructure: number;
		exceptions: number;
	};
}

async function main() {
	const filePath = process.argv[2];
	if (!filePath) {
		console.error("Usage: bun run diagnose-v0.2.ts <file-path>");
		process.exit(1);
	}

	const absolutePath = filePath.startsWith("/") ? filePath : `${process.cwd()}/${filePath}`;

	// Step 1: Run detector
	console.error("Running detector...");
	const detectResult = await $`cd ${EFFECT_AGENT_ROOT} && bun run detect:all ${absolutePath} --json 2>/dev/null`.nothrow().text();

	let violations: unknown[];
	try {
		const parsed = JSON.parse(detectResult);
		violations = parsed.violations || [];
	} catch {
		console.error("Failed to parse detector output");
		process.exit(1);
	}

	if (violations.length === 0) {
		const emptyDiagnosis: Diagnosis = {
			filePath: absolutePath,
			totalViolations: 0,
			rootCauses: [],
			summary: { fixable: 0, restructure: 0, exceptions: 0 }
		};
		console.log(JSON.stringify(emptyDiagnosis, null, 2));
		process.exit(0);
	}

	// Step 2: Create diagnostic prompt
	console.error(`Found ${violations.length} violations. Running diagnosis...`);
	const diagnosticPrompt = createDiagnosticPrompt(absolutePath, violations);

	const promptFile = `/tmp/diagnose-prompt-${Date.now()}.txt`;
	await Bun.write(promptFile, diagnosticPrompt);

	const result = await $`claude -p "$(cat ${promptFile})" --output-format text 2>/dev/null`.nothrow().text();

	// Step 3: Parse JSON from response
	const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/);
	if (jsonMatch) {
		try {
			const diagnosis = JSON.parse(jsonMatch[1]);
			console.log(JSON.stringify(diagnosis, null, 2));
		} catch (e) {
			console.error("Failed to parse diagnosis JSON");
			console.error(result);
			process.exit(1);
		}
	} else {
		console.error("No JSON block found in response");
		console.error(result);
		process.exit(1);
	}

	await $`rm ${promptFile}`.nothrow();
}

function createDiagnosticPrompt(filePath: string, violations: unknown[]): string {
	const violationSummary = violations.map((v: any, i: number) =>
		`${i + 1}. [${v.ruleId}] Line ${v.line}: ${v.message}\n   Snippet: ${v.snippet?.slice(0, 100)}...`
	).join("\n");

	return `You are an Effect-TS expert analyzing a file for refactoring opportunities.

## Your Task

Read the file and analyze the violations below. Output a JSON diagnosis.

## Important Constraints

- Type predicates (\`x is Foo\`) MUST return boolean - they cannot use Effect
- Don't suggest adding suppression comments
- DO suggest deleting code and reimplementing differently when appropriate
- Consider if existing code in the file already provides a better pattern

## File to Analyze

Path: ${filePath}

Read the file first, then analyze the violations.

## Violations Found (${violations.length} total)

${violationSummary}

## Required Output Format

Output ONLY a JSON code block with this structure:

\`\`\`json
{
  "filePath": "${filePath}",
  "totalViolations": ${violations.length},
  "rootCauses": [
    {
      "id": 1,
      "title": "Brief description of root cause",
      "violationIndices": [1, 2, 3],
      "explanation": "Why these violations share a common cause",
      "alternative": {
        "description": "What to do instead",
        "codeExample": "optional code snippet"
      },
      "recommendation": "LOCAL_FIX | RESTRUCTURE | EXCEPTION",
      "confidence": "HIGH | MEDIUM | LOW"
    }
  ],
  "summary": {
    "fixable": 0,
    "restructure": 0,
    "exceptions": 0
  }
}
\`\`\`

Rules:
- "fixable" = violations with LOCAL_FIX recommendation
- "restructure" = violations with RESTRUCTURE recommendation
- "exceptions" = violations with EXCEPTION recommendation
- Sum of summary values should equal totalViolations
`;
}

main().catch(console.error);
