import { loadCategories, flattenCategories } from "./categories/index.js";
import { runDetectionPhase } from "./phases/detection.js";
import { runMergePhase } from "./phases/merge.js";
import { runApplyPhase } from "./phases/apply.js";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY not found in environment");
    console.error("Create a .env file with your API key or set it in your shell");
    process.exit(1);
  }

  const target = process.argv[2];
  if (!target) {
    console.error("Usage: bun run src/index.ts <file-or-directory> [max-iterations]");
    console.error("Example: bun run src/index.ts ./src 10");
    process.exit(1);
  }

  const maxIterations = parseInt(process.argv[3] ?? "10", 10);
  if (isNaN(maxIterations) || maxIterations < 1) {
    console.error("Error: max-iterations must be a positive number");
    process.exit(1);
  }

  // Load categories and flatten to rules
  const categories = await loadCategories();
  const rules = flattenCategories(categories);

  console.log(`\n🔍 Effect Code Style Fixer (Parallel)`);
  console.log(`Target: ${target}`);
  console.log(`Max iterations: ${maxIterations}`);
  console.log(`Categories: ${categories.map((c) => c.id).join(", ")}`);
  console.log(`Rules: ${rules.length} total`);

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    console.log(`\n${"━".repeat(50)}`);
    console.log(`Iteration ${iteration}`);
    console.log(`${"━".repeat(50)}`);

    // Phase 1: Detection (parallel by rule)
    await runDetectionPhase(target);

    // Phase 2: Merge (sequential, in-process)
    const mergedFiles = await runMergePhase();

    if (mergedFiles.length === 0) {
      console.log("\n✅ No violations found! All files pass.");
      break;
    }

    // Phase 3: Apply (parallel by file)
    await runApplyPhase(mergedFiles);

    if (iteration === maxIterations) {
      console.log(`\n⚠️  Max iterations reached. Some issues may remain.`);
    }
  }
}

main().catch(console.error);
