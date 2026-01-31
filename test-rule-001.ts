#!/usr/bin/env bun
/**
 * Reproduction script for rule-001 detector - tests that violations are detected
 * and that the detector doesn't use Effect.runSync() mid-flow
 */

import { spawn } from "bun";
import { $ } from "bun";

// Run the detector on a file with new Promise()
const result = await $`cd ../worktree-task-001/effect-agent && bun run detect:errors ../../../test-rule-001-sample.ts`.nothrow();

console.log("Detector output:", result.stdout.toString());
console.log("Detector stderr:", result.stderr.toString());

// Check if rule-003 violation is present (Effect.runSync mid-flow)
const detectOutput = result.stdout.toString();
const hasRule003Violation = detectOutput.includes("rule-003");

if (hasRule003Violation) {
	console.log("\n❌ PROBLEM: rule-003 violation still present (Effect.runSync mid-flow)");
	process.exit(0); // Exit 0 means problem exists
} else {
	console.log("\n✅ FIXED: rule-003 violation resolved");
	process.exit(1); // Exit 1 means problem is fixed
}
