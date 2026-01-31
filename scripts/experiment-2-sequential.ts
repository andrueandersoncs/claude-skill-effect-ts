#!/usr/bin/env bun
/**
 * Experiment 2: Sequential single-worker approach
 *
 * Hypothesis: Tournament merge creates duplicate code. A single worker
 * fixing violations sequentially should produce cleaner results.
 */

import { $ } from "bun";

const EFFECT_CHECK_PATH = "commands/effect-check.md";

// Single-worker sequential approach
const NEW_EFFECT_CHECK = `---
name: effect-check
description: Run Effect-TS compliance checks - detectors flag issues, then LLM agents analyze/fix violations in parallel
argument-hint: "<file-path> [--fix]"
allowed-tools:
  - Bash
  - Read
  - Edit
  - Write
  - Task
  - TaskCreate
  - TaskUpdate
  - TaskList
---

# Effect-TS Compliance Checker

## Detection Mode (no --fix)

Run detectors and report:
\`\`\`bash
cd effect-agent && bun run detect:all <path>
\`\`\`

## Fix Mode (--fix flag)

### Step 1: Diagnose

Run diagnosis to understand root causes:
\`\`\`bash
bun scripts/effect-diagnose/diagnose-v0.4.ts <path>
\`\`\`

### Step 2: Fix Sequentially

**CRITICAL: Do NOT spawn multiple workers for overlapping changes.**

Fix violations in this order:
1. Read the file
2. For each fixable violation (LOCAL_FIX category):
   - Apply the fix
   - Verify with \`bun run detect:all <path> --json\`
   - If new errors introduced, revert and try different approach
3. After all fixes, run \`bun run check\` to verify no type errors

### Step 3: Report

Show:
- Before/after violation count
- Type error status
- List of fixes applied
- List of unfixable violations with reasons

## Constraints

- **Never add suppression comments**
- **Never use \`as any\` or dangerous assertions**
- **Fix one violation at a time, verify before continuing**
- **If a fix introduces type errors, revert it**
`;

async function main() {
  console.log("=== Experiment 2: Sequential Single-Worker ===\n");

  // Backup and write new instructions
  console.log("1. Writing new effect-check.md...");
  await Bun.write(EFFECT_CHECK_PATH, NEW_EFFECT_CHECK);

  // Reset test file
  console.log("2. Resetting test file...");
  const testFile = `// Test file with known violations
const x = null;
if (x === null) {
  console.log("null check - should use Match");
}

for (let i = 0; i < 10; i++) {
  console.log(i); // loop - should use Array methods
}

const result = x ? "yes" : "no"; // ternary - should use Match
`;
  await Bun.write("/tmp/test-effect-check.ts", testFile);

  // Count before
  console.log("3. Counting violations before...");
  const beforeOutput = await $`cd effect-agent && bun run detect:all /tmp/test-effect-check.ts --json 2>/dev/null`.nothrow().text();
  let beforeCount = 0;
  try {
    const beforeJson = JSON.parse(beforeOutput);
    beforeCount = beforeJson.violations?.length || 0;
  } catch {
    // Count from text output
    const matches = beforeOutput.match(/Total violations: (\d+)/);
    beforeCount = matches ? parseInt(matches[1]) : 0;
  }
  console.log(`   Before: ${beforeCount} violations\n`);

  // Run fix mode
  console.log("4. Running fix mode (headless Claude)...");
  console.log("   Command: claude -p \"/effect-check /tmp/test-effect-check.ts --fix\"\n");

  const startTime = Date.now();
  const fixOutput = await $`claude -p "/effect-check /tmp/test-effect-check.ts --fix" 2>&1`.nothrow().text();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`   Completed in ${elapsed}s\n`);
  console.log("=== Fix Output ===");
  console.log(fixOutput);
  console.log("==================\n");

  // Count after
  console.log("5. Counting violations after...");
  const afterOutput = await $`cd effect-agent && bun run detect:all /tmp/test-effect-check.ts --json 2>/dev/null`.nothrow().text();
  let afterCount = 0;
  try {
    const afterJson = JSON.parse(afterOutput);
    afterCount = afterJson.violations?.length || 0;
  } catch {
    const matches = afterOutput.match(/Total violations: (\d+)/);
    afterCount = matches ? parseInt(matches[1]) : 0;
  }

  // Check for suppression comments
  const afterContent = await Bun.file("/tmp/test-effect-check.ts").text();
  const suppressions = (afterContent.match(/eslint-disable|@ts-ignore|@ts-expect-error/g) || []).length;

  // Check for duplicates (indication of bad merge)
  const hasDuplicates = afterContent.includes("for (") && afterContent.includes(".forEach(");

  console.log(`   After: ${afterCount} violations`);
  console.log(`   Suppressions: ${suppressions}`);
  console.log(`   Has duplicates: ${hasDuplicates}\n`);

  // Show final file
  console.log("=== Final File ===");
  console.log(afterContent);
  console.log("==================\n");

  // Summary
  console.log("=== Experiment 2 Summary ===");
  console.log(`Violations: ${beforeCount} → ${afterCount} (${beforeCount - afterCount} fixed)`);
  console.log(`Suppressions: ${suppressions}`);
  console.log(`Duplicates: ${hasDuplicates ? "YES (bad merge)" : "NO"}`);
  console.log(`Time: ${elapsed}s`);

  if (afterCount === 0 && suppressions === 0 && !hasDuplicates) {
    console.log("\n✅ SUCCESS: All violations fixed cleanly!");
  } else if (afterCount < beforeCount && suppressions === 0 && !hasDuplicates) {
    console.log("\n⚠️ PARTIAL: Some violations fixed, no duplicates");
  } else {
    console.log("\n❌ FAILED: Still has issues");
  }
}

main().catch(console.error);
