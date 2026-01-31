#!/usr/bin/env bun
/**
 * Experiment 4: Single-pass with duplicate prevention
 *
 * Hypothesis: Multiple passes cause regression. Need one complete pass
 * that fixes everything and explicitly prevents duplicates.
 */

import { $ } from "bun";

const EFFECT_CHECK_PATH = "commands/effect-check.md";

// Ultra-focused single-pass instructions
const NEW_EFFECT_CHECK = `---
name: effect-check
description: Run Effect-TS compliance checks
argument-hint: "<file-path> [--fix]"
allowed-tools:
  - Bash
  - Read
  - Write
---

# Effect-TS Compliance Checker

## Without --fix
\`cd effect-agent && bun run detect:all <path>\`

## With --fix

### Process
1. Read the entire file
2. Identify ALL violations
3. **Rewrite the entire file once** with all fixes applied
4. Use Write tool (not Edit) to replace the file completely
5. Verify: \`cd effect-agent && bun run detect:all <path>\`

### Transformations
- \`if (x === null) {...}\` → \`Option.fromNullable(x).pipe(Option.match({onNone: ..., onSome: ...}))\`
- \`for (let i = 0; i < n; i++)\` → \`Array.from({length: n}, (_, i) => i).forEach(...)\` or \`Effect.forEach\`
- \`x ? a : b\` → \`Match.value(x).pipe(Match.when(...), Match.orElse(...))\`
- \`console.log\` → \`Effect.log\`

### CRITICAL RULES
1. **ONE rewrite only** - Do not make multiple edits. Read file, transform all at once, write file.
2. **Delete old code** - When replacing a pattern, REMOVE the original. Never keep both versions.
3. **Add imports** - Add Effect imports at the top: \`import { Effect, Option, Match, Array, Function } from "effect";\`
4. **No suppressions** - Never add eslint-disable, @ts-ignore, etc.

### Example

Before:
\`\`\`typescript
const x = getValue();
if (x === null) {
  console.log("error");
}
\`\`\`

After (CORRECT - old code removed):
\`\`\`typescript
import { Effect, Option } from "effect";

const x = getValue();
Option.fromNullable(x).pipe(
  Option.match({
    onNone: () => Effect.log("error"),
    onSome: () => Effect.void
  })
);
\`\`\`

WRONG (keeping both):
\`\`\`typescript
if (x === null) { ... }  // DO NOT KEEP THIS
Option.fromNullable(x)... // alongside this
\`\`\`
`;

async function main() {
  console.log("=== Experiment 4: Single-Pass Complete Rewrite ===\n");

  await Bun.write(EFFECT_CHECK_PATH, NEW_EFFECT_CHECK);
  console.log("Wrote ultra-focused effect-check.md\n");

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
  console.log("Reset test file\n");

  // Before
  const beforeRaw = await $`cd effect-agent && bun run detect:all /tmp/test-effect-check.ts 2>&1`.nothrow().text();
  const beforeMatch = beforeRaw.match(/Total violations: (\d+)/);
  const beforeCount = beforeMatch ? parseInt(beforeMatch[1]) : 0;
  console.log(`Before: ${beforeCount} violations\n`);

  // Fix
  console.log("Running single-pass fix...\n");
  const startTime = Date.now();
  const output = await $`claude -p "/effect-check /tmp/test-effect-check.ts --fix"`.nothrow().text();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Completed in ${elapsed}s\n`);
  console.log("=== Output ===\n" + output.slice(0, 2000) + (output.length > 2000 ? "\n...[truncated]" : "") + "\n==============\n");

  // After
  const afterRaw = await $`cd effect-agent && bun run detect:all /tmp/test-effect-check.ts 2>&1`.nothrow().text();
  const afterMatch = afterRaw.match(/Total violations: (\d+)/);
  const afterCount = afterMatch ? parseInt(afterMatch[1]) : 0;

  // Check file
  const finalContent = await Bun.file("/tmp/test-effect-check.ts").text();
  const suppressions = (finalContent.match(/eslint-disable|@ts-ignore|@ts-expect-error/g) || []).length;

  // Duplicate detection
  const lines = finalContent.split("\n");
  const hasIfNull = lines.some(l => /if\s*\(\s*x\s*===?\s*null/.test(l));
  const hasOptionMatch = finalContent.includes("Option.match") || finalContent.includes("Option.fromNullable");
  const hasForLoop = lines.some(l => /for\s*\(let/.test(l));
  const hasArrayMethod = finalContent.includes(".forEach(") || finalContent.includes("Effect.forEach");
  const hasTernary = lines.some(l => /[^?]\?[^?:].*:[^:]/.test(l) && !l.includes("Match"));
  const hasMatch = finalContent.includes("Match.value");

  const dupIfOption = hasIfNull && hasOptionMatch;
  const dupForArray = hasForLoop && hasArrayMethod;
  const dupTernMatch = hasTernary && hasMatch;
  const hasDuplicates = dupIfOption || dupForArray || dupTernMatch;

  console.log("=== Final File ===\n" + finalContent + "\n==================\n");
  console.log(`After: ${afterCount} violations`);
  console.log(`Suppressions: ${suppressions}`);
  console.log(`Duplicates: ${hasDuplicates ? "YES" : "NO"}`);
  if (hasDuplicates) {
    console.log(`  if+Option: ${dupIfOption}, for+Array: ${dupForArray}, tern+Match: ${dupTernMatch}`);
  }

  console.log("\n=== Summary ===");
  console.log(`${beforeCount} → ${afterCount} violations`);

  if (afterCount === 0 && suppressions === 0 && !hasDuplicates) {
    console.log("✅ PERFECT: All violations fixed, no duplicates!");
  } else if (afterCount <= 2 && suppressions === 0 && !hasDuplicates) {
    console.log("✅ SUCCESS: Major improvement, no duplicates");
  } else if (!hasDuplicates && suppressions === 0) {
    console.log("⚠️ PARTIAL: Some violations remain but no duplicates");
  } else {
    console.log("❌ FAILED");
  }
}

main().catch(console.error);
