#!/usr/bin/env bun
/**
 * Experiment: Rewrite effect-check.md with diagnosis-first approach
 *
 * Hypothesis: The current effect-check fails because it spawns too many workers
 * making overlapping changes. A diagnosis-first approach that groups violations
 * by root cause should work better.
 *
 * This script:
 * 1. Creates a minimal effect-check.md based on diagnosis-first
 * 2. Tests it on a small file
 * 3. Reports results
 */

import { $ } from "bun";

const EFFECT_CHECK_PATH = "commands/effect-check.md";

// Minimal, focused effect-check instructions
const NEW_EFFECT_CHECK = `---
name: effect-check
description: Run Effect-TS compliance checks - detectors flag issues, then LLM agents analyze/fix violations in parallel
argument-hint: "<file-path> [--fix]"
allowed-tools:
  - Bash
  - Read
  - Task
  - TaskCreate
  - TaskUpdate
  - TaskList
---

# Effect-TS Compliance Checker

Run detectors on TypeScript files and optionally fix violations.

## Usage

\`\`\`
/effect-check <path>           # Report violations only
/effect-check <path> --fix     # Diagnose and fix violations
\`\`\`

## Detection Mode (no --fix)

1. Run detectors: \`bun run detect:all <path> --json\`
2. Report violations grouped by rule
3. Show total count and breakdown

## Fix Mode (--fix flag)

### Phase 0: Diagnosis

Before spawning any workers, analyze ALL violations to find root causes:

\`\`\`bash
bun scripts/effect-diagnose/diagnose-v0.4.ts <path>
\`\`\`

This outputs a diagnosis with:
- **Root causes** grouped by category (LOCAL_FIX, ARCHITECTURAL, UNFIXABLE)
- **Dependencies** between violations
- **Recommended approach** per root cause

### Phase 1: Plan Based on Diagnosis

Group violations by fixability:

| Category | Action |
|----------|--------|
| LOCAL_FIX | Can be fixed independently - spawn workers |
| ARCHITECTURAL | Requires design decision - ask user or document |
| UNFIXABLE | Skip - document why |

**Critical rule**: Never spawn more than 10 workers. If diagnosis shows >10 root causes that are LOCAL_FIX, batch them.

### Phase 2: Execute Fixes

For each LOCAL_FIX root cause:
1. Create a task-worker with the specific root cause context
2. Worker fixes ALL violations stemming from that root cause
3. Worker verifies with \`bun run detect:all <path> --json\`

### Phase 3: Merge

If multiple workers:
1. Use tournament merge (merge-worker agents)
2. Verify final result: \`bun run detect:all <path> --json\`
3. Verify no type errors: \`bun run check\`

### Phase 4: Report

Show before/after comparison:
- Violation count change
- Type error status
- Any suppression comments added (should be 0)

## Constraints

- **No suppression comments** - Never add eslint-disable, @ts-ignore, etc.
- **No dangerous assertions** - Never use \`as any\` or \`as unknown as X\`
- **Preserve functionality** - All tests must still pass
- **Document unfixable** - Explain why violations can't be fixed

## Example Workflow

\`\`\`
User: /effect-check src/utils.ts --fix

1. Run diagnosis:
   $ bun scripts/effect-diagnose/diagnose-v0.4.ts src/utils.ts

   Output:
   - Root cause A (LOCAL_FIX): 5 violations from missing Schema validation
   - Root cause B (LOCAL_FIX): 3 violations from imperative loops
   - Root cause C (ARCHITECTURAL): 2 violations need Effect runtime

2. Plan:
   - Spawn 2 workers for A and B
   - Document C as architectural decision needed

3. Execute and merge

4. Report: 8 → 0 violations fixed, 2 documented as architectural
\`\`\`
`;

async function main() {
  console.log("=== Experiment: Rewrite effect-check.md ===\n");

  // Step 1: Backup current effect-check.md
  console.log("1. Backing up current effect-check.md...");
  const backup = await Bun.file(EFFECT_CHECK_PATH).text();
  await Bun.write(EFFECT_CHECK_PATH + ".backup", backup);
  console.log(`   Backed up to ${EFFECT_CHECK_PATH}.backup\n`);

  // Step 2: Write new minimal effect-check.md
  console.log("2. Writing new effect-check.md...");
  await Bun.write(EFFECT_CHECK_PATH, NEW_EFFECT_CHECK);
  console.log(`   Written ${NEW_EFFECT_CHECK.length} chars (was ${backup.length})\n`);

  // Step 3: Create a small test file with known violations
  console.log("3. Creating test file...");
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
  console.log("   Created /tmp/test-effect-check.ts\n");

  // Step 4: Test detection mode (no --fix)
  console.log("4. Testing detection mode...");
  const detectResult = await $`cd /Users/andrueanderson/Workspace/claude-skill-effect-ts/effect-agent && bun run detect:all /tmp/test-effect-check.ts 2>&1`.nothrow().text();
  console.log("   Detection output:");
  console.log(detectResult.split("\n").slice(0, 15).join("\n"));
  console.log("   ...\n");

  // Step 5: Test fix mode with claude -p
  console.log("5. Testing fix mode with claude -p (headless)...");
  console.log("   This will spawn a headless Claude to test the new instructions.\n");

  const fixResult = await $`claude -p "/effect-check /tmp/test-effect-check.ts --fix" 2>&1`.text().catch(e => `Error: ${e.message}`);

  console.log("=== Fix Mode Result ===");
  console.log(fixResult);

  // Step 6: Verify result
  console.log("\n6. Verifying result...");
  const afterDetect = await $`cd /Users/andrueanderson/Workspace/claude-skill-effect-ts/effect-agent && bun run detect:all /tmp/test-effect-check.ts 2>&1`.nothrow().text();
  const afterContent = await Bun.file("/tmp/test-effect-check.ts").text();

  console.log("   After content:");
  console.log(afterContent);
  console.log("\n   After detection:");
  console.log(afterDetect.split("\n").slice(0, 10).join("\n"));

  // Report
  console.log("\n=== Experiment Complete ===");
  console.log("Check /tmp/test-effect-check.ts to see if fixes were applied correctly.");
  console.log(`Original effect-check.md backed up to ${EFFECT_CHECK_PATH}.backup`);
}

main().catch(console.error);
