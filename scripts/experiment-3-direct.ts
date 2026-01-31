#!/usr/bin/env bun
/**
 * Experiment 3: Direct editing, no workers
 *
 * Hypothesis: Workers and merges are the problem. Just edit the file directly.
 */

import { $ } from "bun";

const EFFECT_CHECK_PATH = "commands/effect-check.md";

// Radically simple instructions
const NEW_EFFECT_CHECK = `---
name: effect-check
description: Run Effect-TS compliance checks
argument-hint: "<file-path> [--fix]"
allowed-tools:
  - Bash
  - Read
  - Edit
---

# Effect-TS Compliance Checker

## Without --fix

Run: \`cd effect-agent && bun run detect:all <path>\`

## With --fix

1. Run \`cd effect-agent && bun run detect:all <path>\` to see violations
2. Read the file with Read tool
3. Fix violations one at a time using Edit tool:
   - Replace \`if (x === null)\` with \`Option.fromNullable(x) |> Option.match\`
   - Replace \`for\` loops with \`Array.map/filter/forEach\` or \`Effect.forEach\`
   - Replace \`x ? a : b\` with \`Match.value(x).pipe(Match.when(...), Match.orElse(...))\`
   - Replace \`console.log\` with \`Effect.log\`
4. Run detectors again to verify
5. Report before/after counts

**Rules:**
- Edit the file directly. Do NOT spawn workers.
- Do NOT add eslint-disable or @ts-ignore
- Do NOT use \`as any\`
- Delete old code when replacing, don't keep both versions
`;

async function main() {
  console.log("=== Experiment 3: Direct Editing ===\n");

  // Write new instructions
  await Bun.write(EFFECT_CHECK_PATH, NEW_EFFECT_CHECK);
  console.log("Wrote simplified effect-check.md\n");

  // Reset test file
  const testFile = `// Test file with known violations
const x = null;
if (x === null) {
  console.log("null check - should use Match");
}

for (let i = 0; i < 10; i++) {
  console.log(i);
}

const result = x ? "yes" : "no";
`;
  await Bun.write("/tmp/test-effect-check.ts", testFile);
  console.log("Reset /tmp/test-effect-check.ts\n");

  // Count before
  const beforeRaw = await $`cd effect-agent && bun run detect:all /tmp/test-effect-check.ts 2>&1`.nothrow().text();
  const beforeMatch = beforeRaw.match(/Total violations: (\d+)/);
  const beforeCount = beforeMatch ? parseInt(beforeMatch[1]) : 0;
  console.log(`Before: ${beforeCount} violations\n`);

  // Run fix
  console.log("Running fix mode...\n");
  const startTime = Date.now();
  const output = await $`claude -p "/effect-check /tmp/test-effect-check.ts --fix"`.nothrow().text();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Completed in ${elapsed}s\n`);
  console.log("=== Output ===\n" + output + "\n==============\n");

  // Count after
  const afterRaw = await $`cd effect-agent && bun run detect:all /tmp/test-effect-check.ts 2>&1`.nothrow().text();
  const afterMatch = afterRaw.match(/Total violations: (\d+)/);
  const afterCount = afterMatch ? parseInt(afterMatch[1]) : 0;

  // Check file
  const finalContent = await Bun.file("/tmp/test-effect-check.ts").text();
  const suppressions = (finalContent.match(/eslint-disable|@ts-ignore|@ts-expect-error/g) || []).length;

  // Check for duplicate patterns (both old and new code present)
  const hasIfNull = finalContent.includes("if (x === null)") || finalContent.includes("if(x === null)");
  const hasOptionMatch = finalContent.includes("Option.match") || finalContent.includes("Option.fromNullable");
  const hasForLoop = finalContent.includes("for (let") || finalContent.includes("for(let");
  const hasArrayMethod = finalContent.includes(".forEach(") || finalContent.includes(".map(") || finalContent.includes("Effect.forEach");
  const hasTernary = /\?\s*["'][^"']+["']\s*:\s*["']/.test(finalContent);
  const hasMatch = finalContent.includes("Match.value") || finalContent.includes("Match.when");

  const duplicates = (hasIfNull && hasOptionMatch) || (hasForLoop && hasArrayMethod) || (hasTernary && hasMatch);

  console.log("=== Final File ===\n" + finalContent + "\n==================\n");
  console.log(`After: ${afterCount} violations`);
  console.log(`Suppressions: ${suppressions}`);
  console.log(`Duplicates: ${duplicates ? "YES" : "NO"}`);
  console.log(`  if+Option: ${hasIfNull && hasOptionMatch}`);
  console.log(`  for+Array: ${hasForLoop && hasArrayMethod}`);
  console.log(`  tern+Match: ${hasTernary && hasMatch}\n`);

  console.log("=== Summary ===");
  console.log(`${beforeCount} → ${afterCount} violations (${beforeCount - afterCount} fixed)`);

  if (afterCount === 0 && suppressions === 0 && !duplicates) {
    console.log("✅ SUCCESS");
  } else if (afterCount < beforeCount && suppressions === 0 && !duplicates) {
    console.log("⚠️ PARTIAL: Improved but not perfect");
  } else if (duplicates) {
    console.log("❌ FAILED: Duplicates created");
  } else {
    console.log("❌ FAILED");
  }
}

main().catch(console.error);
